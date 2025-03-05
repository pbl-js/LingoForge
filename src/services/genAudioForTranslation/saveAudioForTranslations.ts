import { put } from '@vercel/blob';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

interface AudioTranslationItem {
  translationId: number;
  languageCode: string;
  audioBuffer: ArrayBuffer;
}

/**
 * Saves generated audio files to Vercel Blob and updates the database
 * @param audioTranslations - Array of translation items with audio buffers
 * @returns Promise<void>
 */
export const saveAudioForTranslations = async (
  audioTranslations: AudioTranslationItem[]
): Promise<void> => {
  try {
    console.log('saveAudioForTranslations runs');
    if (!audioTranslations.length) {
      throw new Error('No audio translations provided');
    }

    // Get unique translation IDs
    const translationIds = [
      ...new Set(audioTranslations.map((item) => item.translationId)),
    ];

    // Verify translations exist
    const existingTranslations = await db.translation.findMany({
      where: {
        id: {
          in: translationIds,
        },
      },
      select: { id: true },
    });

    if (existingTranslations.length !== translationIds.length) {
      const foundIds = new Set(existingTranslations.map((t) => t.id));
      const missingIds = translationIds.filter((id) => !foundIds.has(id));
      throw new Error(
        `Translations with IDs ${missingIds.join(', ')} not found`
      );
    }

    // Process each audio translation
    const audioUpdates: Prisma.PrismaPromise<
      Prisma.TranslationGetPayload<{ select: { id: true } }>
    >[] = [];

    for (const item of audioTranslations) {
      // Upload audio buffer to Vercel Blob
      const filename = `translation-${item.translationId}-${
        item.languageCode
      }-${uuidv4()}.mp3`;

      const blob = await put(filename, item.audioBuffer, {
        access: 'public',
        contentType: 'audio/mpeg',
      });

      // Add database update operation
      audioUpdates.push(
        db.translation.update({
          where: { id: item.translationId },
          data: { audioUrl: blob.url },
        })
      );
    }

    // Execute all database operations in a transaction
    await db.$transaction(audioUpdates);
  } catch (error) {
    console.error('Error saving audio for translations:', error);
    throw error;
  }
};
