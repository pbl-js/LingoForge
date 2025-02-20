'use server';

import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { routes } from '@/consts/routes';
import { redirect } from 'next/navigation';

export async function deleteWordAction(wordId: number) {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('User not found');
    }

    const prisma = new PrismaClient();

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
    });

    revalidatePath(routes.wordList);
    redirect(routes.wordList);
  } catch (err) {
    console.error('Error deleting word:', err);
    return { error: 'Failed to delete word' };
  }
}
