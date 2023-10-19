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

export async function continueChat(userChatHistory: ChatMessage[]) {
  
  let chatString = ""
  
  if (userChatHistory.length > 0) {
    for (let i = 0; i < userChatHistory.length; i++) {
      let chat = userChatHistory[i];
      let prompt =
        chat.sender === "bot" ? Anthropic.AI_PROMPT : Anthropic.HUMAN_PROMPT;
      chatString += `${prompt} ${chat.text} `;
    }

    // Remove trailing space
    chatString = chatString.trim();
  }

  chatString += `\nAnswer their questions about farming in simple sentences. 
  Be helpful, limit your answer to 250 characters.`;

  const completion = await createCompletions(chatString); // use Anthropic
  
  // const completion = await createCompletionsHL(chatString); // use HumanLoop
  return completion;
}

export async function followUp(context: string) {

  const qa_prompt = `Suggest three follow up questions to ${context}`;
  
  const prompt = `${Anthropic.HUMAN_PROMPT} ${qa_prompt}${Anthropic.AI_PROMPT}`;

  console.log("qa" + prompt)

  const completion = await createCompletions(prompt); // use Anthropi
  // const completion = await createCompletionsHL(chatString); // use HumanLoop
  return completion;
}

export async function summarizeText(query: string, context: string) {

  const sum_prompt = `user question: ${query}. 
  Using the following context to answer in the same language as user question, with no more than 5 sentences. 
  
  Context: ${context}`;
  
  const prompt = `${Anthropic.HUMAN_PROMPT} ${sum_prompt}${Anthropic.AI_PROMPT}`;

  console.log("summarize" + prompt)

  const completion = await createCompletions(prompt); // use Anthropi
  // const completion = await createCompletionsHL(chatString); // use HumanLoop
  return completion;
}


