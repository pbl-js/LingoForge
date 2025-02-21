'use client';
import { GenerateSentenceButton } from '../GenerateSentenceButton/GenerateSentenceButton';
import React from 'react';
import { useTransition } from 'react';
import { OpenAISpeechButton } from '../OpenAISpeechButton/OpenAISpeechButton';

type WordDetailsHeaderProps = {
  title: string;
  wordId: number;
  audioUrl?: string | null;
};

export function WordDetailsHeader({
  title,
  wordId,
  audioUrl,
}: WordDetailsHeaderProps) {
  const [isPending, startTransition] = useTransition();
  console.log(audioUrl);
  const playAudio = () => {
    startTransition(async () => {
      try {
        if (!audioUrl) return;

        const audio = new Audio(audioUrl);
        await audio.play();
      } catch (error) {
        console.error('Failed to play audio:', error);
      }
    });
  };

  return (
    <div className="flex w-full justify-between min-h-[40px] items-center">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-center text-white">{title}</h1>
        {audioUrl && (
          <button
            onClick={playAudio}
            disabled={isPending}
            className={`p-1 text-gray-300 hover:text-white ${
              isPending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Play audio"
          >
            {isPending ? '⏳' : '🔊'}
          </button>
        )}
      </div>
      <OpenAISpeechButton text={title} />
      <GenerateSentenceButton wordId={wordId} />
    </div>
  );
}
