'use server';

import { db } from '@/lib/db';
import { genAudioForTranslations } from './genAudioForTranslation';
import { saveAudioForTranslations } from './saveAudioForTranslations';
import { Readable } from 'stream';

/**
 * Converts a readable stream to an ArrayBuffer
 */
const streamToArrayBuffer = async (stream: Readable): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(
        buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        )
      );
    });
  });
};

/**
 * Server action to generate and save audio for translations
 * @param translationIds - Array of translation IDs to generate audio for
 * @returns Object containing success status and results
 */
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
    const audioResults = await genAudioForTranslations(translations);
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

        const audioBuffer = await streamToArrayBuffer(result.audioStream);

        return {
          translationId: result.translation.id,
          languageCode: result.translation.language,
          audioBuffer,
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
