'use client';
import { GenerateSentenceButton } from '../GenerateSentenceButton/GenerateSentenceButton';
import React from 'react';
import { useTransition } from 'react';
import { OpenAISpeechButton } from '../OpenAISpeechButton/OpenAISpeechButton';
import { Volume2 } from 'lucide-react';
import { Button } from '../ui/button';

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
  const [audio, setAudio] = React.useState<HTMLAudioElement | null>(null);

  // Initialize audio on mount or when URL changes
  React.useEffect(() => {
    if (audioUrl) {
      const newAudio = new Audio(audioUrl);
      setAudio(newAudio);
      return () => {
        newAudio.pause();
        newAudio.src = '';
      };
    }
  }, [audioUrl]);

  const playAudio = () => {
    startTransition(async () => {
      try {
        if (!audio) return;

        // Reset audio to start if it was already played
        audio.currentTime = 0;
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
      </div>
      <div className="flex items-center gap-2">
        {audioUrl && (
          <Button
            onClick={playAudio}
            disabled={isPending}
            className=""
            title="Play stored audio"
          >
            <Volume2 /> {isPending ? 'Playing...' : 'pre-gen audio'}
          </Button>
        )}
        <OpenAISpeechButton text={title} />
        <GenerateSentenceButton wordId={wordId} />
      </div>
    </div>
  );
}
