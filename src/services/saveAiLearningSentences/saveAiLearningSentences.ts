import { PrismaClient } from "@prisma/client";

export function saveAiLearningSentences({
  prisma,
  sentences,
  wordId,
}: {
  prisma: PrismaClient;
  sentences: {
    en: string;
    pl: string;
  }[];
  wordId: number;
}) {
  return prisma.$transaction(async (tx) => {
    const createdSentences = await Promise.all(
      sentences.map(async (sentenceTranslations) => {
        const sentence = await tx.sentence.create({
          data: {
            wordId: wordId,
            translations: {
              createMany: {
                data: [
                  {
                    language: "EN",
                    content: sentenceTranslations.en,
                  },
                  {
                    language: "PL",
                    content: sentenceTranslations.pl,
                  },
                ],
              },
            },
          },
          include: {
            translations: true,
          },
        });
        return sentence;
      })
    );

    return {
      wordId,
      learningSentences: createdSentences,
    };
  });
}
