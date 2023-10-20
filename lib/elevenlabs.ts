import axios, { AxiosRequestConfig } from 'axios';

export async function generateAudio(inputText: string) {
  const API_KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

  const options: AxiosRequestConfig = {
    method: 'POST',
    url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    headers: {
      accept: 'audio/mpeg',
      'content-type': 'application/json',
      'xi-api-key': `${API_KEY}`,
    },
    data: {
      text: inputText,
      model_id: "eleven_multilingual_v2",
    },
    responseType: 'arraybuffer',
  };

  const speechDetails = await axios.request(options);
  console.log('audio generated')
  return speechDetails.data;
};