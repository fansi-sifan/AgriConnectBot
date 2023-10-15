export async function generateImage(fileUrl: string) {
  const Replicate = require("replicate");

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY,
  });

  console.log('image processing')

  // Convert the buffer into a base64-encoded string

  const response = await replicate.run(
    "yorickvp/llava-13b:2cfef05a8e8e648f6e92ddb53fa21a81c04ab2c4f1390a6528cc4e331d608df8",
    {
      input: {
        prompt: "as an agriculture expert, identify agriculture-related `issues from this image. only respond with a detailed description of the type of crops, and what's wrong with the crops, nothing else needed",
        image: fileUrl,
      },
    }
  );
  console.log(response)
  return response;
}
