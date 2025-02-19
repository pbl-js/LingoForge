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
