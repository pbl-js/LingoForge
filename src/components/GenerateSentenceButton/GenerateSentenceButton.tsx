'use client';
import {
  generateSentenceAction,
  WordWithSentences,
} from '@/services/generateSentence/generateSentenceAction';
import { Button } from '../ui/button';
import React from 'react';

export function GenerateSentenceButton() {
  // transition hook
  const [isGenerating, generate] = React.useTransition();
  const [sentence, setSentence] = React.useState<WordWithSentences>();

  const generateSentence = async () => {
    const sentence = await generateSentenceAction();
    setSentence(sentence);
  };

  console.log(sentence);

  return (
    <Button onClick={() => generate(generateSentence)}>
      {isGenerating ? 'Generating...' : 'Generate Sentence'}
    </Button>
  );
}
