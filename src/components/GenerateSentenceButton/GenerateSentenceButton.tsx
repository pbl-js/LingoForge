'use client';
import { generateSentenceAction } from '@/services/generateSentence/generateSentenceAction';
import { Button } from '../ui/button';
import React from 'react';

export function GenerateSentenceButton({ wordId }: { wordId: number }) {
  // transition hook
  const [isGenerating, generate] = React.useTransition();
  const [sentence, setSentence] =
    React.useState<Awaited<ReturnType<typeof generateSentenceAction>>>();

  const generateSentence = async () => {
    const sentence = await generateSentenceAction(wordId);
    setSentence(sentence);
  };

  console.log(sentence);

  return (
    <Button onClick={() => generate(generateSentence)}>
      {isGenerating ? 'Generating...' : 'Generate Sentence'}
    </Button>
  );
}
