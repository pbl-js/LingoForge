import { ArrayElement } from '@/lib/types';
import { Prisma, PrismaClient } from '@prisma/client';

export async function getWordsForLearning(
  prisma: PrismaClient,
  {
    userId,
  }: {
    userId: string;
  }
) {
  const words = await prisma.word.findMany({
    where: {
      userId,
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

  return words;
}

export type WordsForLearning = Prisma.PromiseReturnType<
  typeof getWordsForLearning
>;
export type WordForLearning = ArrayElement<WordsForLearning>;
