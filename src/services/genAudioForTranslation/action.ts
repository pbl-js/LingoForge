'use server';

import { db } from '@/lib/db';
import { genAudioWithTimestampsForTranslations } from './genAudioWithTimestampsForTranslation';
import { saveAudioForTranslations } from './saveAudioForTranslations';
import { revalidatePath } from 'next/cache';

export const generateAndSaveAudioForTranslations = async (
  translationIds: number[]
): Promise<{
  success: boolean;
  message: string;
  processedCount: number;
  failedIds?: number[];
}> => {
  try {
    if (!translationIds.length) {
      return {
        success: false,
        message: 'No translation IDs provided',
        processedCount: 0,
      };
    }

    // Fetch translations from database
    const translations = await db.translation.findMany({
      where: {
        id: {
          in: translationIds,
        },
      },
    });

    if (!translations.length) {
      return {
        success: false,
        message: 'No translations found with the provided IDs',
        processedCount: 0,
      };
    }

    // Generate audio for translations
    const audioResults = await genAudioWithTimestampsForTranslations(
      translations
    );
    console.log('audioResults: ', audioResults);

    // Filter successful results and prepare for saving
    const successfulResults = audioResults.filter(
      (result) => result.success && result.audioStream
    );

    if (!successfulResults.length) {
      return {
        success: false,
        message: 'Failed to generate audio for any translations',
        processedCount: 0,
        failedIds: translations.map((t) => t.id),
      };
    }

    // Convert streams to ArrayBuffers and prepare for saving
    const audioTranslationItems = await Promise.all(
      successfulResults.map(async (result) => {
        if (!result.audioStream) {
          throw new Error('Audio stream is null despite success flag');
        }

        const chunks = [];
        for await (const chunk of result.audioStream) {
          chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);

        // Make sure we have data
        if (!audioBuffer || audioBuffer.length === 0) {
          throw new Error('Received empty audio buffer from ElevenLabs');
        }

        return {
          translationId: result.translation.id,
          languageCode: result.translation.language,
          audioBuffer,
          timestamps: result.timestamps,
        };
      })
    );

    console.log('audioResults: ', audioResults);

    // Save audio files
    await saveAudioForTranslations(audioTranslationItems);

    // Identify any failed translations
    const failedIds = audioResults
      .filter((result) => !result.success)
      .map((result) => result.translation.id);

    revalidatePath('/');

    return {
      success: true,
      message: failedIds.length
        ? `Successfully processed ${successfulResults.length} translations with ${failedIds.length} failures`
        : `Successfully processed all ${successfulResults.length} translations`,
      processedCount: successfulResults.length,
      failedIds: failedIds.length ? failedIds : undefined,
    };
  } catch (error) {
    console.error('Error in generateAndSaveAudioForTranslations:', error);
    return {
      success: false,
      message: `Error processing translations: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      processedCount: 0,
    };
  }
};
