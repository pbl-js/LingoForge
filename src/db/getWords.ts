import { Prisma, PrismaClient } from '@prisma/client';

export async function getWords(
  prisma: PrismaClient,
  {
    userId,
  }: {
    userId: string;
  }
) {
  const words = await prisma.word.findMany({ where: { userId } });

  return words;
}

export type Word = Prisma.PromiseReturnType<typeof getWords>;
