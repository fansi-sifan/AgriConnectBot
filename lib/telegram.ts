import {
  Message,
  InlineKeyboardButton,
  InlineKeyboardMarkup,
  CallbackQuery,
} from "node-telegram-bot-api";
import { continueChat, followUp, summarizeText } from "./telegramActions";
import {
  createSupabaseConnection,
  storeMessage,
  getChatHistory,
  getStoryStart,
  updateConsent,
  createConsent,
  reset,
  getSearchResult,
  getLastResponse,
} from "./supabase";
import { createOpenAIConnection } from "./openai";
import { transcribe } from "./voice";
import { generateAudio } from "./elevenlabs";
import { search } from "./search";

interface UserStory {
  id: string;
  firstMessageSent: boolean;
}

interface ChatMessage {
  user_id: string;
  sender: string;
  text: string;
}

async function handleIncomingMessage(bot: any, message: Message) {
  //check if user has an active story
  const user_id = String(message.chat.id);
  const supabase = await createSupabaseConnection();
  const story = await getStoryStart(supabase, user_id);

  if (message.text === "/reset") {
    await reset(supabase, user_id);
    bot.sendMessage(message.chat.id, "Reset successfully");
    return;
  }

  let currentMessage: any | undefined;

  //detect message type
  if (message.voice) {
    // transcribe voice message
    const openai = await createOpenAIConnection();
    const fileId = message.voice.file_id;
    const transcription = await transcribe(openai, bot, fileId);
    console.log("audio:" + transcription);
    currentMessage = transcription;
  } else if (message.photo) {
    const { generateImage } = require("./imgGen");
    const fileId = message.photo[0].file_id;
    const caption = message.caption || "";

    const fileUrl: string = await bot.getFileLink(fileId);
    const imgMessage = await generateImage(fileUrl, caption);
    bot.sendMessage(message.chat.id, imgMessage);
    currentMessage =
      caption +
      "Here's a description of the image, give suggestions on what to do:" +
      imgMessage;
  } else {
    currentMessage = message.text;
  }

  let storeUserMessage = true;
  let response: string;
  let searchResult: any;

  // Check if user id exists in story
  if (story.length === 0) {
    console.log("New user");
    await bot.sendMessage(message.chat.id, "Hi, I'm AgriConnect. 🧑🏽‍🌾️");
    await bot.sendMessage(message.chat.id, "PLACE HOLDER: data consent");
    await bot.sendMessage(message.chat.id, "Reply OK to continue");
    storeUserMessage = false;
    await createConsent(supabase, user_id);
  } else if (story.length > 0 && story[0].firstmessagesent === false) {
    console.log("Consent Granted");
    if (currentMessage.toLowerCase().includes("ok")) {
      bot.sendMessage(message.chat.id, "Let's get started!");
      await updateConsent(supabase, user_id);
    } else {
      bot.sendMessage(
        message.chat.id,
        "Please reply with 'OK' to give your consent and continue."
      );
    }
  } else {
    searchResult = await search(currentMessage);

    if (searchResult.length > 0) {
      const content = searchResult.map(
        (item: { pageContent: string }) => item.pageContent
      );
      console.log("search content:" + content);
      response = await summarizeText(currentMessage, content.join("\n"));
    } else {
      console.log("respond");
      await bot.sendMessage(message.chat.id, "Sorry, not found in my knowledge base.");
      await bot.sendMessage(message.chat.id, "Searching external knowledge base...");
      const chatHistory = await getChatHistory(supabase, user_id);

      response = await continueChat(chatHistory, currentMessage);

      chatHistory.push({
        user_id: user_id,
        sender: "user",
        text: currentMessage,
      });
    }
    // const img_prompt = response.match(/<en>(.*?)<\/en>/)?.[1] || "";

    //render image
    // const { generateImage } = require("./imgGen");
    // // const img = await generateImage(img_prompt);
    // const img = await generateImage(response);
    // bot.sendPhoto(message.chat.id, img[0]);

    const answerMatch = response.match(/<answer>(.*?)<\/answer>/s);
    let answer = answerMatch ? answerMatch[1] : response;
    answer = answer.replace(/<lang>(.*?)<\/lang>/g, "");
    answer = answer.replace(/<thoughts>(.*?)<\/thoughts>/g, "");
    answer = answer.replace(/<[^>]*>/g, "");

    bot.sendMessage(message.chat.id, answer).then(() => {
      // Define the menu items
      const audioRequestButton: InlineKeyboardButton = {
        text: "👂 Click to listen",
        callback_data: "REQUEST_AUDIO",
      };

      const sourceRequestButton: InlineKeyboardButton = {
        text: "🔍 Source",
        callback_data: "REQUEST_SOURCE",
      };

      const followUpButton: InlineKeyboardButton = {
        text: "❓ Follow up",
        callback_data: "FOLLOW_UP",
      };

      // Create the keyboard
      const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: searchResult.length > 0
          ? [[audioRequestButton, sourceRequestButton]]
          : [[audioRequestButton, followUpButton]],
      };

      // Send a message with the keyboard
      bot.sendMessage(message.chat.id, ".", {
        reply_markup: keyboard,
      });
    });

    //store messages in DB
    if (storeUserMessage)
      await storeMessage(supabase, {
        user_id: user_id,
        sender: "user",
        text: currentMessage || "",
      });
    await storeMessage(supabase, {
      user_id: user_id,
      sender: "bot",
      text: answer || "", 
    });
    await storeMessage(supabase, {
      user_id: user_id,
      sender: "search",
      text: searchResult || "",
    });
  }
}

// Handle button clicks
async function handleCallback(bot: any, callbackQuery: CallbackQuery) {
  if (callbackQuery.message) {
    const message = callbackQuery.message;

    console.log('callback')

    const user_id = String(message.chat.id);
    const supabase = await createSupabaseConnection();
    const response = await getLastResponse(supabase, user_id);
    const parsed_result = response[0].text;

    switch (callbackQuery.data) {
      case "REQUEST_AUDIO":
        console.log("generate audio");
        const audio_response = await generateAudio(parsed_result);
        bot.sendVoice(message.chat.id, audio_response);
        break;
      case "REQUEST_SOURCE":
        const searchResult = await getSearchResult(supabase, user_id);
        const parsed_search = JSON.parse(searchResult[0].text);
        const source_response = parsed_search.map(
          (item: { link: string }) => item.link
        );
        const uniqueSource = [...new Set(source_response)];
        // const source_response = parsed_search.link;
        bot.sendMessage(message.chat.id, uniqueSource.join("\n"));
        break;
      case "FOLLOW_UP":
        console.log("follow up");
        const follow_up = await followUp(parsed_result);
        bot.sendMessage(message.chat.id, follow_up.replace(/<[^>]*>/g, ""));
        break;
    }
  }
}

module.exports = {
  handleIncomingMessage,
  handleCallback,
};
