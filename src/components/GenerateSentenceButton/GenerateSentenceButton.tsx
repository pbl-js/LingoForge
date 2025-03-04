'use client';
import { generateSentenceAction } from '@/services/generateWordData/generateWordDataAction';
import { Button } from '../ui/button';
import React from 'react';
import { ElevenLabsError } from 'elevenlabs';

export function GenerateSentenceButton({ wordId }: { wordId: number }) {
  // transition hook
  const [isGenerating, generate] = React.useTransition();
  const [sentence, setSentence] =
    React.useState<Awaited<ReturnType<typeof generateSentenceAction>>>();

  const generateSentence = async () => {
    try {
      const sentence = await generateSentenceAction(wordId);
      setSentence(sentence);
    } catch (err) {
      console.log('ERR: ', err);
      if (err instanceof ElevenLabsError) {
        console.log('Error: ', err);
        console.log('MESSAGE: ', err.message);
      }
    }
  };

  console.log(sentence);

  return (
    <Button onClick={() => generate(generateSentence)}>
      {isGenerating ? 'Generating...' : 'Generate Sentence'}
    </Button>
  );
}
