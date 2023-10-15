import { Humanloop} from "humanloop";

if (!process.env.HUMANLOOP_API_KEY) {
  throw Error(
    "no Humanloop API key provided; add one to your .env.local file with: `HUMANLOOP_API_KEY=..."
  );
}

const humanloop = new Humanloop({
  basePath: "https://api.humanloop.com/v4",
  apiKey: process.env.HUMANLOOP_API_KEY,
});

export async function createCompletionsHL(userMessages: string) {
  const response = await humanloop.chatDeployed({
    project: "TED AI Hackathon",
    messages: [
        {
          role: "user",
          content: userMessages,    
        },
      ],
  });
  
  return response.data.data[0].output;
}


