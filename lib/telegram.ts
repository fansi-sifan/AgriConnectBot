import { Message, InlineKeyboardButton, InlineKeyboardMarkup, CallbackQuery } from "node-telegram-bot-api";
import { createIntro, continueChat, followUp, summarizeText } from "./telegramActions";
import {
  createSupabaseConnection,
  storeMessage,
  getChatHistory,
  getStoryStart,
  updateStoryStart,
  createStoryStart,
  reset,
} from "./supabase";
import { createOpenAIConnection } from "./openai";
import { transcribe } from "./voice";
import { generateAudio } from './elevenlabs';
import { search } from './search';

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

  if (message.text === "/reset") {
    await reset(supabase, user_id);
    bot.sendMessage(message.chat.id, "Reset successfully");
    return;
  } 

  let currentMessage: any | undefined;
  //transcribe
  if (message.voice) {
    // transcribe voice message
    const openai = await createOpenAIConnection();
    const fileId = message.voice.file_id;
    const transcription = await transcribe(openai, bot, fileId);
    console.log("audio:" + transcription)
    currentMessage = transcription;
  } else if (message.photo){
    
    const { generateImage } = require("./imgGen");
    const fileId = message.photo[0].file_id
    const caption = message.caption || ""; 

    const fileUrl: string = await bot.getFileLink(fileId);
    const imgMessage = await generateImage(fileUrl, caption);
    bot.sendMessage(message.chat.id, imgMessage);
    currentMessage = caption + "Here's a description of the image, give suggestions on what to do:" + imgMessage ;
  } else {
    currentMessage = message.text;
  }

  const story = await getStoryStart(supabase, user_id);

  let storeUserMessage = true;
  let response: string;
  let searchResult: any;

  // Check if user id exists in story
  if (story.length === 0) {
    console.log("New user");
    bot.sendMessage(message.chat.id, "Hi, I'm AgriConnect. 🧑🏽‍🌾️");
    storeUserMessage = false;
    await createStoryStart(supabase, user_id);
  // } else if (story.length > 0 && story[0].firstmessagesent === false) {
  //   console.log("Send intro");
  //   //get the intro and send to user
  //   response = await createIntro(currentMessage || "");
  //   await updateStoryStart(supabase, user_id);

    //render image
    // const { generateImage } = require("./imgGen");
    // const img = await generateImage(response);
    // bot.sendPhoto(message.chat.id, img[0]);

  } else {

    if (currentMessage.startsWith("/search")) {
      console.log("search");
      const query = currentMessage.slice('/search '.length);
      searchResult = await search(query);
      if (searchResult) {
        // response = searchResult.name;
        response = await summarizeText(searchResult.pageContent);
        console.log(searchResult)
      } else {
        response = "No results found for your search.";
      }
    } else {
      console.log("respond");
    const chatHistory = await getChatHistory(supabase, user_id);
    chatHistory.push({
      user_id: user_id,
      sender: "bot",
      text: currentMessage,
    });
    response = await continueChat(chatHistory);
    }
    // const img_prompt = response.match(/<en>(.*?)<\/en>/)?.[1] || "";

    //render image
    // const { generateImage } = require("./imgGen");
    // // const img = await generateImage(img_prompt);
    // const img = await generateImage(response);
    // bot.sendPhoto(message.chat.id, img[0]);

  bot.sendMessage(message.chat.id, response).then(() => {
    // Define the menu items
    const audioRequestButton: InlineKeyboardButton = {
      text: '👂 Click to listen',
      callback_data: 'REQUEST_AUDIO'
    };

    const sourceRequestButton: InlineKeyboardButton = {
      text: '🔍 Source',
        callback_data: 'REQUEST_SOURCE'
    };

    const followUpButton: InlineKeyboardButton = {
      text: '❓ Follow up',
        callback_data: 'FOLLOW_UP'
    };

    // Create the keyboard
    const keyboard: InlineKeyboardMarkup = {
      inline_keyboard: currentMessage.startsWith("/search") ? [[audioRequestButton, sourceRequestButton]] : [[audioRequestButton, followUpButton]]
    };

    // Send a message with the keyboard
    bot.sendMessage(message.chat.id, 'more options:',{
      reply_markup: keyboard
    });
  });

// Handle button clicks
bot.on('callback_query', async (callbackQuery: CallbackQuery) => {
  if (callbackQuery.message) {
    const message = callbackQuery.message;
    const chatId = message.chat.id;

    if (callbackQuery.data === 'REQUEST_AUDIO') {
        // Make a request to the ElevenLabs API
        const audio_response = await generateAudio(response);
        console.log('generate audio')
        // Send the audio file to the user
        bot.sendVoice(chatId, audio_response);
    } else if (callbackQuery.data === 'REQUEST_SOURCE') {
        // Handle source request
        // console.log(searchResult.metadata)
        const source_response = searchResult.link;
        console.log('search source')
        // Send the source information to the user
        bot.sendMessage(chatId, source_response);
    } else if (callbackQuery.data === 'FOLLOW_UP') {
      // Handle source request
      const follow_up = await followUp(response);
      console.log('follow up')
      // Send the source information to the user
      bot.sendMessage(chatId, follow_up);
    }
  }
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
    text: response,
  });
}
}
module.exports = {
  handleIncomingMessage,
};
