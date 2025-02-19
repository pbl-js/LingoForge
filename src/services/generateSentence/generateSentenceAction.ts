'use server';

import OpenAI from 'openai';
import React from 'react';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { GENERATE_SENTENCE_PROMPT } from '@/consts/prompts';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { routes } from '@/consts/routes';
import { getWordById } from '@/db/getWordById';
import { currentUser } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

const openai = new OpenAI();

const WordWithSentencesSchema = z.object({
  word: z.string().describe('The word provided by user'),
  similarWords: z.array(z.string()),
  usagesList: z.array(
    z.object({
      usageTitle: z.string(),
      usageDescription: z.string(),
      sentencesList: z.array(z.object({ name: z.string() })),
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

export async function generateSentenceAction(wordId: number) {
  const user = await currentUser();

  if (!user) {
    return {
      error: 'User not found',
    };
  }

  const word = await getWordById(prisma, {
    userId: user.id,
    wordId: wordId,
  });

  if (!word) {
    return {
      error: 'Word not found',
    };
  }

  const res = await oaiGenerateSentence(word.title);

  if (!res.choices[0]?.message.content)
    throw new Error('No sentences for provided word');

  const parsedRes = WordWithSentencesSchema.parse(
    JSON.parse(res.choices[0]?.message.content)
  );

  const updatedWord = await prisma.$transaction(
    async (tx) => {
      // Delete all related records
      await tx.sentence.deleteMany({
        where: {
          useCase: {
            wordId: wordId,
          },
        },
      });

      await tx.useCase.deleteMany({
        where: {
          wordId: wordId,
        },
      });

      await tx.similarWord.deleteMany({
        where: {
          wordId: wordId,
        },
      });

      // Create new useCases with sentences and similar words
      return tx.word.update({
        where: {
          id: wordId,
        },
        data: {
          similarWords: {
            create: parsedRes.similarWords.map((word) => ({
              content: word,
            })),
          },
          useCases: {
            create: parsedRes.usagesList.map((usage) => ({
              title: usage.usageTitle,
              description: usage.usageDescription,
              sentences: {
                create: usage.sentencesList.map((sentence) => ({
                  name: sentence.name,
                })),
              },
            })),
          },
        },
        include: {
          similarWords: true,
          useCases: {
            include: {
              sentences: true,
            },
          },
        },
      });
    },
    {
      timeout: 10000,
    }
  );

  revalidatePath(routes.wordListDetails(word.id));
  return updatedWord;
}
