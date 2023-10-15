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


export async function createIntro(keywords: string) {
  const intro_prompt = `Responding to user: ${keywords} . 
  If he asks an agriculture related questions, answer it. 
  If not, greet him in his language, asks him to provide information about where his land is, and what crops he grow, and suggest what questions he can ask`;
  const prompt = `${Anthropic.HUMAN_PROMPT} ${intro_prompt}${Anthropic.AI_PROMPT}`;
 
  const completion = await createCompletions(prompt);
  return completion;
}

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

export async function summarizeText(context: string) {

  const sum_prompt = `Summarise the technical content, no more than 5 sentences. ${context}`;
  
  const prompt = `${Anthropic.HUMAN_PROMPT} ${sum_prompt}${Anthropic.AI_PROMPT}`;

  console.log("summarize" + prompt)

  const completion = await createCompletions(prompt); // use Anthropi
  // const completion = await createCompletionsHL(chatString); // use HumanLoop
  return completion;
}


