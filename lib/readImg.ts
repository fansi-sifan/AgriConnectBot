import OpenAI from "openai";

const openai = new OpenAI();
console.log('image processing')
export async function readImg(fileUrl: string) {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "as an agriculture expert, identify agriculture-related `issues from this image. Respond first with a detailed description of the type of crops, then what's wrong with the crops" },
            {
              type: "image_url",
              image_url: {
                "url": fileUrl,
              },
            },
          ],
        },
      ],
      "max_tokens": 300
    });
    console.log(response.choices[0]);
    return response.choices[0].message.content;
  }
  