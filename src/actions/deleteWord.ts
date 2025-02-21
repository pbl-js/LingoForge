'use server';

import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { routes } from '@/consts/routes';
import { redirect } from 'next/navigation';
import { del } from '@vercel/blob';
import { getWordById } from '@/db/getWordById';

export async function deleteWordAction(wordId: number) {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('User not found');
    }

    const prisma = new PrismaClient();

    // Get the word to access its audioUrl before deletion
    const word = await getWordById(prisma, {
      userId: user.id,
      wordId: wordId,
    });

    if (!word) {
      throw new Error('Word not found');
    }

    await prisma.$transaction(async (tx) => {
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

      await tx.word.delete({
        where: {
          id: wordId,
          userId: user.id,
        },
      });

      // Delete the audio file after successful database deletion
      if (word.audioUrl) {
        try {
          await del(word.audioUrl);
        } catch (error) {
          console.error('Failed to delete audio file:', error);
          // Decide if you want to throw or continue
        }
      }
    });

    revalidatePath(routes.wordList);
    redirect(routes.wordList);
  } catch (err) {
    console.error('Error deleting word:', err);
    return { error: 'Failed to delete word' };
  }
}
