"use client";

import React, { useTransition } from "react";
import { generateSpeech } from "@/actions/generateSpeech";

interface OpenAISpeechButtonProps {
  text: string;
}

export const OpenAISpeechButton = ({ text }: OpenAISpeechButtonProps) => {
  const [isPending, startTransition] = useTransition();

  const speak = () => {
    startTransition(async () => {
      try {
        const { base64Audio } = await generateSpeech(text);
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        await audio.play();
      } catch (error) {
        console.error("Failed to play audio:", error);
      }
    });
  };

  return (
    <button
      onClick={speak}
      disabled={isPending}
      className={`ml-2 p-1 text-gray-300 hover:text-white ${
        isPending ? "cursor-not-allowed opacity-50" : ""
      }`}
      title="Play AI audio"
    >
      {isPending ? "⏳" : "🤖"}
    </button>
  );
};
