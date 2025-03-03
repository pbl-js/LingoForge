'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { routes } from '@/consts/routes';
import { getWordById } from '@/db/getWordById';
import { auth } from '@clerk/nextjs/server';
import { put, del } from '@vercel/blob';
import { ElevenLabsClient } from 'elevenlabs';
import { wordAiText, WordAiTextSchema } from '../wordAiText/wordAiText';
import { getMatchTranslation } from '@/lib/getMatchTranslation';

const prisma = new PrismaClient();

// Initialize ElevenLabs client
const elevenLabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function generateSentenceAction(wordId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const word = await getWordById(prisma, {
    userId: userId,
    wordId: wordId,
  });

  if (!word) {
    return {
      error: 'Word not found',
    };
  }

  const englishTranslation = getMatchTranslation(
    word.translations,
    'EN'
  ).content;

  const res = await wordAiText(englishTranslation);

  // Add ElevenLabs audio generation
  const wordTitleAudio = await elevenLabs.textToSpeech.convert(
    'ThT5KcBeYPX3keUQqHPh', // Using "Bella" voice which has a happier tone
    {
      text: englishTranslation,
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

  // Find audio URL in translations if it exists - we need to simplify this condition
  const audioTranslation = getMatchTranslation(word.translations, 'EN');

  // Delete old audio if exists
  if (audioTranslation?.audioUrl) {
    try {
      await del(audioTranslation.audioUrl);
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
      `/word-audio/${word.id}-${englishTranslation}.mp3`,
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

  // Make sure audioUrl is a string
  if (typeof audioUrl !== 'string' || !audioUrl) {
    throw new Error('Failed to generate a valid audio URL');
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

      // Create or update audio translation
      if (audioTranslation) {
        console.log(
          'Updating existing translation with ID:',
          audioTranslation.id
        );
        await tx.translation.update({
          where: { id: audioTranslation.id },
          data: {
            audioUrl: audioUrl,
          },
        });
      } else {
        console.log('Creating new translation with audio URL');
        // Create a new audio translation
        await tx.translation.create({
          data: {
            language: 'EN',
            content: englishTranslation,
            audioUrl: audioUrl,
            wordId: wordId,
          },
        });
      }

      // Create new useCases with sentences and similar words
      return tx.word.update({
        where: {
          id: wordId,
        },
        data: {
          similarWords: {
            create: parsedRes.similarWords.map((word) => {
              // Check if word is an object with en/pl properties or a simple string
              const wordContent =
                typeof word === 'object' && word.en ? word.en : word;
              return {
                translations: {
                  create: [
                    {
                      language: 'EN',
                      content:
                        typeof wordContent === 'string'
                          ? wordContent
                          : String(wordContent),
                    },
                    // Add Polish translation if available
                    ...(typeof word === 'object' && word.pl
                      ? [
                          {
                            language: 'PL',
                            content:
                              typeof word.pl === 'string'
                                ? word.pl
                                : String(word.pl),
                          },
                        ]
                      : []),
                  ],
                },
              };
            }),
          },
          useCases: {
            create: parsedRes.usagesList.map((usage) => {
              // Handle title which might be an object or string
              const titleContent =
                typeof usage.usageTitle === 'object' && usage.usageTitle.en
                  ? usage.usageTitle.en
                  : usage.usageTitle;

              // Handle description which might be an object or string
              const descContent =
                typeof usage.usageDescription === 'object' &&
                usage.usageDescription.en
                  ? usage.usageDescription.en
                  : usage.usageDescription;

              return {
                titleTranslations: {
                  create: [
                    {
                      language: 'EN',
                      content:
                        typeof titleContent === 'string'
                          ? titleContent
                          : String(titleContent),
                    },
                    // Add Polish translation if available
                    ...(typeof usage.usageTitle === 'object' &&
                    usage.usageTitle.pl
                      ? [
                          {
                            language: 'PL',
                            content:
                              typeof usage.usageTitle.pl === 'string'
                                ? usage.usageTitle.pl
                                : String(usage.usageTitle.pl),
                          },
                        ]
                      : []),
                  ],
                },
                descriptionTranslations: {
                  create: [
                    {
                      language: 'EN',
                      content:
                        typeof descContent === 'string'
                          ? descContent
                          : String(descContent),
                    },
                    // Add Polish translation if available
                    ...(typeof usage.usageDescription === 'object' &&
                    usage.usageDescription.pl
                      ? [
                          {
                            language: 'PL',
                            content:
                              typeof usage.usageDescription.pl === 'string'
                                ? usage.usageDescription.pl
                                : String(usage.usageDescription.pl),
                          },
                        ]
                      : []),
                  ],
                },
                sentences: {
                  create: usage.sentencesList.map((sentence) => ({
                    translations: {
                      create: [
                        {
                          language: 'EN',
                          content:
                            typeof sentence.en === 'string'
                              ? sentence.en
                              : String(sentence.en),
                        },
                        {
                          language: 'PL',
                          content:
                            typeof sentence.pl === 'string'
                              ? sentence.pl
                              : String(sentence.pl),
                        },
                      ],
                    },
                  })),
                },
              };
            }),
          },
        },
        include: {
          translations: true,
          similarWords: {
            include: {
              translations: true,
            },
          },
          useCases: {
            include: {
              titleTranslations: true,
              descriptionTranslations: true,
              sentences: {
                include: {
                  translations: true,
                },
              },
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
