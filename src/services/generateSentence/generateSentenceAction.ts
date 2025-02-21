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
import { put, del } from '@vercel/blob';

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

  const wordTitleAudio = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice: 'sage',
    input: word.title,
    speed: 0.7,
  });

  // Delete old audio if exists
  if (word.audioUrl) {
    try {
      await del(word.audioUrl);
    } catch (error) {
      console.error('Failed to delete old audio:', error);
    }
  }
  let audioUrl: string;
  // Save audio to Vercel Blob
  try {
    // Get the audio as an ArrayBuffer
    const audioBuffer = await wordTitleAudio.arrayBuffer();

    // Make sure we have data
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      throw new Error('Received empty audio buffer from OpenAI');
    }

    // Create a Buffer from the ArrayBuffer
    const buffer = Buffer.from(audioBuffer);

    // Save to Vercel Blob with content type
    const { url } = await put(`${word.id}-${word.title}.mp3`, buffer, {
      access: 'public',
      contentType: 'audio/mpeg', // Add proper content type
    });

    // Verify the URL was created
    if (!url) {
      throw new Error('Failed to get URL from Vercel Blob');
    }

    console.log('Audio saved to:', url); // Debug log
    audioUrl = url;
  } catch (error) {
    console.error('Error saving audio:', error);
    throw error; // Re-throw to handle in the transaction
  }

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
          audioUrl: audioUrl,
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
