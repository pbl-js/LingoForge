'use server';

import OpenAI from 'openai';
import React from 'react';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { GENERATE_SENTENCE_PROMPT } from '@/consts/prompts';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { routes } from '@/consts/routes';

const prisma = new PrismaClient();

const openai = new OpenAI();

const WordWithSentencesSchema = z.object({
  word: z.string().describe('The word provided by user'),
  // sentences: z.array(z.object({
  //   sentence: z.string(),
  //   useCase: z.string()
  // }))
  usagesList: z.array(
    z.object({
      usage: z.string(),
      sentencesList: z.array(z.string()),
    })
  ),
});

export type WordWithSentences = z.infer<typeof WordWithSentencesSchema>;

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
    response_format: zodResponseFormat(WordWithSentencesSchema, 'sentence'),
    store: true,
  })
);

export async function generateSentenceAction() {
  // Mutate data
  const res = await oaiGenerateSentence('apprehend');

  if (!res.choices[0]?.message.content)
    throw new Error('No sentences for provided word');

  const parsedRes = WordWithSentencesSchema.parse(
    JSON.parse(res.choices[0]?.message.content)
  );
  // return parsedRes;

  // await prisma.useCase.createMany({
  //   data: parsedRes.usagesList.map((item) => ({
  //     wordId: 1,
  //     title: item.usage,
  //     sentences: {},
  //   })),
  // });

  const flattenedSentences = parsedRes.usagesList.flatMap((item) => {
    return item.sentencesList.map((sentence) => ({
      sentence,
      useCase: item.usage,
    }));
  });

  const word = await prisma.word.update({
    where: {
      id: 1,
    },
    data: {
      sentences: {
        createMany: {
          data: flattenedSentences.map((sentence) => ({
            title: sentence.sentence,
            useCase: sentence.useCase,
          })),
        },
      },
    },
    include: {
      sentences: true,
    },
  });

  revalidatePath(routes.wordListDetails(word.id));
  return word;
}
