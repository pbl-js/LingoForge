import { Prisma, PrismaClient } from "@prisma/client";

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
      translations: true,
      similarWords: {
        include: {
          translations: true,
        },
      },
      useCases: {
        include: {
          titleTranslations: true,
          descriptionTranslations: true,
          wordTranslations: true,
          sentences: {
            include: {
              translations: true,
            },
          },
        },
      },
    },
  });
}

export type Word = Prisma.PromiseReturnType<typeof getWordById>;
