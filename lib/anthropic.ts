import Anthropic from "@anthropic-ai/sdk";

// const generalContext = `
//   You are a bedtime story teller for children, limit your answer to fewer than 2 sentences. 
//   If the user input is in English, respond in English. 
//   If the user input is not in English, Respond in the same language that user use, then translate it to English. 
//   Please put your story in <story></story> tags, and translation in <en></en> tags`;

const generalContext = `You are a helpful expert at Agriculture for farmers in India. 
Please provide your expert agriculture advice based on user context. 
Always answer the questions in the same languages that the user use. When unsure, use English.`

export async function createCompletions(query: string): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "",
  });

  const prompt = `${Anthropic.HUMAN_PROMPT} ${generalContext} \n ${query} ${Anthropic.AI_PROMPT}`;

  try {
    const completion = await anthropic.completions.create({
      // model: "claude-2",
      model: "claude-instant-1",
      prompt: prompt,
      max_tokens_to_sample: 500,
    });
    return completion.completion;
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.log(err.status); // 400
      console.log(err.name); // BadRequestError
      console.log(err.headers); // {server: 'nginx', ...}
    } else {
      throw err;
    }
    return "";
  }
}
