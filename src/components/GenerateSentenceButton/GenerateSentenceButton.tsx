'use client';
import { generateSentenceAction } from '@/services/generateSentence/generateSentenceAction';
import OpenAI from 'openai';
import { Button } from '../ui/button';
import React from 'react';

export function GenerateSentenceButton() {
  // transition hook
  const [isGenerating, generate] = React.useTransition();
  const [sentence, setSentence] =
    React.useState<OpenAI.Chat.Completions.ChatCompletionMessage>();

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
