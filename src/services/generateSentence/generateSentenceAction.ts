'use server';

import OpenAI from 'openai';
import React from 'react';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { GENERATE_SENTENCE_PROMPT } from '@/consts/prompts';

const openai = new OpenAI();

const SentencesList = z.object({
  word: z.string().describe('The word provided by user'),
  usagesList: z.array(z.string()),
  sentencesList: z.array(z.object({ usage: z.string(), sentence: z.string() })),
});

const oaiGenerateSentence = React.cache((sentence: string) =>
  openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'developer',
        content: GENERATE_SENTENCE_PROMPT,
      },
      {
        role: 'user',
        content: sentence,
      },
    ],
    response_format: zodResponseFormat(SentencesList, 'sentence'),
    store: true,
  })
);

export async function generateSentenceAction() {
  // Mutate data
  const res = await oaiGenerateSentence('apprehend');

  if (!res.choices[0]?.message.content)
    throw new Error('No sentences for provided word');

  return JSON.parse(res.choices[0]?.message.content);
}
