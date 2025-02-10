'use server';

import OpenAI from 'openai';
import React from 'react';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

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
        // content:
        //   'You generate 10 sentences for word provided by user. These sentences are used to learn vocabulary in mobile application.',
        content:
          'You generate data for mobile vocabulary learning app. User provides a word and you generate list of ALL possible meaning/usage of the word. For every meaning/usage, you generate a list of 10 sentences. I need exactly 10 sentences for each meaning/usage. The array length of sentencesList should be equal to the array length of usagesList * 10.',
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

  if (!res.choices[0].message.content)
    throw new Error('No sentences for provided word');

  return JSON.parse(res.choices[0].message.content);
}
