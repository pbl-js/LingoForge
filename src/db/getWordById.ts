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
  const word = await prisma.word.findUnique({
    where: {
      userId,
      id: wordId,
    },
    include: {
      sentences: true,
    },
  });

  return word;
}

export type Word = Prisma.PromiseReturnType<typeof getWordById>;
