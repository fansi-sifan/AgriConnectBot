import Anthropic from "@anthropic-ai/sdk";

const generalContext = `You are a helpful expert at Agriculture. 
Please provide your expert agriculture advice based on user context. 
First identify what language did the user used in <question></question> XML tag, DO NOT make guess based on region. For example, if the user says
"I'm from Tamil Nadu", then the language should be English, not Tamil. Put the user language in <lang></lang> tags.
Then formulate your response. ALWAYS wrap your response in <answer></answer> tag, using the language in <lang></lang>.`;

export async function createCompletions(query: string): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "",
  });

  try {
    const msg = await anthropic.messages.create({
      // model: "claude-2",
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: [{ role: 'user', content: `${generalContext}`+  query }]
    });
    if ('text' in msg.content[0]) {
      console.log(msg.content[0].text);
      return msg.content[0].text;
    } else {
      throw new Error('ContentBlock does not contain text property');
    }
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error('Anthropic API error:', err.message);
      console.error('Status code:', err.status);
      console.log(err.name); // BadRequestError
      console.log(err.headers); // {server: 'nginx', ...}
    } else {
      throw err;
    }
    return "";
  }
}

