"use client";
import { GenerateSentenceButton } from "../GenerateSentenceButton/GenerateSentenceButton";
import React from "react";
import { OpenAISpeechButton } from "../OpenAISpeechButton/OpenAISpeechButton";
import { Volume2 } from "lucide-react";
import { Button } from "../ui/button";

type WordDetailsHeaderProps = {
  title: string;
  wordId: number;
  audioUrl?: string;
};

export function WordDetailsHeader({ title, wordId, audioUrl }: WordDetailsHeaderProps) {
  const [audio, setAudio] = React.useState<HTMLAudioElement | null>(null);

  // Initialize audio on mount or when URL changes
  React.useEffect(() => {
    if (audioUrl) {
      const newAudio = new Audio(audioUrl);
      setAudio(newAudio);
      return () => {
        newAudio.pause();
        newAudio.src = "";
      };
    }
  }, [audioUrl]);

  const playAudio = async () => {
    try {
      if (!audio) return;

      // Reset audio to start if it was already played
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.error("Failed to play audio:", error);
    }
  };

  return (
    <div className="flex min-h-[40px] w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-center text-2xl font-bold text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {audioUrl && (
          <Button onClick={playAudio} className="" title="Play stored audio">
            <Volume2 /> pre-gen audio
          </Button>
        )}
        <OpenAISpeechButton text={title} />
        <GenerateSentenceButton wordId={wordId} />
      </div>
    </div>
  );
}
