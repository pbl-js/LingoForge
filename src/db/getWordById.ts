import { Prisma, PrismaClient } from '@prisma/client';

export async function getWordById(
  prisma: PrismaClient,
  {
    userId,
    wordId,
  }: {
    userId: string;
    wordId: number;
  }
) {
  return prisma.word.findFirst({
    where: {
      id: wordId,
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
}

export type Word = Prisma.PromiseReturnType<typeof getWordById>;
