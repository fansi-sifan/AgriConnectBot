//start by asking some keywords
import Anthropic from "@anthropic-ai/sdk";

//on response
// generate image
// start beginning of story

// conversation
// generate key themes & store key themes

interface ChatMessage {
  user_id: string;
  sender: string;
  text: string;
}

import { createCompletions } from "./anthropic"
import { createCompletionsHL } from "./humanloop";

export async function continueChat(userChatHistory: ChatMessage[], currentMessage: string) {
  
  let chatString = ""
  
  if (userChatHistory.length > 0) {
    for (let i = 0; i < userChatHistory.length; i++) {
      let chat = userChatHistory[i];
      let prompt;
      switch (chat.sender) {
        case "bot":
          prompt = Anthropic.AI_PROMPT;
          break;
        case "user":
          prompt = Anthropic.HUMAN_PROMPT;
          break;
        case "search":
          continue;
      }
      chatString += `${prompt}${chat.text}`;
    }

    // Remove trailing space
    chatString = chatString.trim();
  }

  chatString += `${Anthropic.HUMAN_PROMPT} <question>${currentMessage}</question>\n`;

  const completion = await createCompletions(chatString); // use Anthropic
  
  // const completion = await createCompletionsHL(chatString); // use HumanLoop
  return completion;
}

export async function followUp(context: string) {

  const qa_prompt = `Suggest three follow up questions to: <context>${context}</context>`;
  
  const prompt = `${Anthropic.HUMAN_PROMPT} ${qa_prompt}`;

  const completion = await createCompletions(prompt); // use Anthropi
  // const completion = await createCompletionsHL(chatString); // use HumanLoop
  return completion;
}

export async function summarizeText(query: string, context: string) {

  const sum_prompt = `This is an external knowledge source for you:  
  <context> ${context} </context>

  First, think how the knowledge source is relevant to user question, put your thoughts in <thoughts></thoughts> tags.
  DO NOT INCLUDE the <thoughts> tags it in your response.

  If the context does not provide relevant information to user question, Say "Sorry, I couldn't find the relevant answer." 
  Otherwise, Answer the user question in English with no more than 5 sentences.
  <question> ${query}. </question>.`;

  const prompt = `${Anthropic.HUMAN_PROMPT} ${sum_prompt}`;

  const completion = await createCompletions(prompt); // use Anthropi
  // const completion = await createCompletionsHL(chatString); // use HumanLoop
  return completion;
}


