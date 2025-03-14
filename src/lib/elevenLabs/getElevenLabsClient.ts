import { ElevenLabsClient } from "elevenlabs";

export const getElevenLabsClient = (): ElevenLabsClient => {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured in environment variables");
  }

  return new ElevenLabsClient({
    apiKey,
  });
};
