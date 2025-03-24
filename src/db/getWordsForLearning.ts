import { Prisma, PrismaClient } from "@prisma/client";

export async function getWordsForLearning(
  prisma: PrismaClient,
  {
    userId,
    limit = 10,
  }: {
    userId: string;
    limit?: number;
  }
) {
  return prisma.word.findMany({
    where: {
      userId,
      useCases: {
        some: {
          sentences: {
            some: {},
          },
        },
      },
    },
    take: limit,
    include: {
      translations: true,
      similarWords: {
        include: {
          translations: true,
        },
      },
      useCases: {
        include: {
          wordTranslations: true,
          titleTranslations: true,
          descriptionTranslations: true,
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

export type WordForLearning = Prisma.PromiseReturnType<typeof getWordsForLearning>[number];
