import Anthropic from "@anthropic-ai/sdk";

const generalContext = `You are a helpful expert at Agriculture for farmers in India. 
Please provide your expert agriculture advice based on user context. 
First identify what language did the user used in <question></question> XML tag, DO NOT make guess based on region. For example, if the user says
"I'm from Tamil Nadu", then the language should be English, not Tamil. Put the user language in <lang></lang> tags.
Then formulate your response. ALWAYS wrap your response in <answer></answer> tag, using the language in <lang></lang>.`;

export async function createCompletions(query: string): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "",
  });

  const prompt = `${Anthropic.HUMAN_PROMPT} ${generalContext} \n${query}\n ${Anthropic.AI_PROMPT}`;
  console.log("chat prompt:" + prompt);

  try {
    const completion = await anthropic.completions.create({
      // model: "claude-2",
      model: "claude-instant-1",
      prompt: prompt,
      max_tokens_to_sample: 1000,
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
