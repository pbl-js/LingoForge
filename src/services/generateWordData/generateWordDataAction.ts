'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { routes } from '@/consts/routes';
import { getWordById } from '@/db/getWordById';
import { currentUser } from '@clerk/nextjs/server';
import { put, del } from '@vercel/blob';
import { ElevenLabsClient } from 'elevenlabs';
import { wordAiText, WordAiTextSchema } from '../wordAiText/wordAiText';

const prisma = new PrismaClient();

// Initialize ElevenLabs client
const elevenLabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

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

  const res = await wordAiText(word.title);

  // Comment out OpenAI audio generation
  /*
  const wordTitleAudio = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice: 'sage',
    input: word.title,
    speed: 0.7,
  });
  */

  // Add ElevenLabs audio generation
  const wordTitleAudio = await elevenLabs.textToSpeech.convert(
    'ThT5KcBeYPX3keUQqHPh', // Using "Bella" voice which has a happier tone
    {
      text: word.title,
      model_id: 'eleven_multilingual_v2',
      output_format: 'mp3_44100_128',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.7, // Increases expressiveness for a happier tone
        use_speaker_boost: true,
      },
    }
  );

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
    // Convert ElevenLabs stream to buffer
    const chunks = [];
    for await (const chunk of wordTitleAudio) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // Make sure we have data
    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Received empty audio buffer from ElevenLabs');
    }

    // Save to Vercel Blob with content type
    const { url } = await put(
      `/word-audio/${word.id}-${word.title}.mp3`,
      audioBuffer,
      {
        access: 'public',
        contentType: 'audio/mpeg',
      }
    );

    // Verify the URL was created
    if (!url) {
      throw new Error('Failed to get URL from Vercel Blob');
    }

    console.log('Audio saved to:', url);
    audioUrl = url;
  } catch (error) {
    console.error('Error saving audio:', error);
    throw error;
  }

  if (!res.choices[0]?.message.content)
    throw new Error('No sentences for provided word');

  const parsedRes = WordAiTextSchema.parse(
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
