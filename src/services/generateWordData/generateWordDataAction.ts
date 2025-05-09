"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { routes } from "@/consts/routes";
import { getWordById } from "@/db/getWordById";
import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { wordAiText, WordAiTextSchema } from "../wordAiText/wordAiText";
import { getMatchTranslation } from "@/lib/getMatchTranslation";

const prisma = new PrismaClient();

export async function generateSentenceAction(wordId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const word = await getWordById(prisma, {
    userId: userId,
    wordId: wordId,
  });

  if (!word) {
    return {
      error: "Word not found",
    };
  }

  const englishTranslation = getMatchTranslation(word.translations, "EN").content;

  const res = await wordAiText(englishTranslation, 5);
  const audioTranslation = getMatchTranslation(word.translations, "EN");

  //

  // Delete old audio if exists
  if (audioTranslation?.audioUrl) {
    try {
      await del(audioTranslation.audioUrl);
    } catch (error) {
      console.error("Failed to delete old audio:", error);
    }
  }

  if (!res.choices[0]?.message.content) throw new Error("No sentences for provided word");

  const parsedRes = WordAiTextSchema.parse(JSON.parse(res.choices[0]?.message.content));

  const updatedWord = await prisma.$transaction(
    async (tx) => {
      // First delete existing similar words and useCases with their related data
      await tx.word.update({
        where: {
          id: wordId,
        },
        data: {
          similarWords: {
            deleteMany: {},
          },
          useCases: {
            deleteMany: {},
          },
        },
      });

      // Create new useCases with sentences and similar words
      return tx.word.update({
        where: {
          id: wordId,
        },
        data: {
          similarWords: {
            create: parsedRes.similarWords.map((word) => {
              // Check if word is an object with en/pl properties or a simple string
              const wordContent = typeof word === "object" && word.en ? word.en : word;
              return {
                translations: {
                  create: [
                    {
                      language: "EN",
                      content: typeof wordContent === "string" ? wordContent : String(wordContent),
                    },
                    // Add Polish translation if available
                    ...(typeof word === "object" && word.pl
                      ? [
                          {
                            language: "PL",
                            content: typeof word.pl === "string" ? word.pl : String(word.pl),
                          },
                        ]
                      : []),
                  ],
                },
              };
            }),
          },
          useCases: {
            create: parsedRes.usagesList.map((usage) => {
              // Handle title which might be an object or string
              const titleContent =
                typeof usage.usageTitle === "object" && usage.usageTitle.en
                  ? usage.usageTitle.en
                  : usage.usageTitle;

              // Handle description which might be an object or string
              const descContent =
                typeof usage.usageDescription === "object" && usage.usageDescription.en
                  ? usage.usageDescription.en
                  : usage.usageDescription;

              return {
                wordTranslations: {
                  create: [
                    {
                      language: "PL",
                      content: usage.wordTranslation.pl,
                    },
                  ],
                },
                titleTranslations: {
                  create: [
                    {
                      language: "EN",
                      content:
                        typeof titleContent === "string" ? titleContent : String(titleContent),
                    },
                    // Add Polish translation if available
                    ...(typeof usage.usageTitle === "object" && usage.usageTitle.pl
                      ? [
                          {
                            language: "PL",
                            content:
                              typeof usage.usageTitle.pl === "string"
                                ? usage.usageTitle.pl
                                : String(usage.usageTitle.pl),
                          },
                        ]
                      : []),
                  ],
                },
                descriptionTranslations: {
                  create: [
                    {
                      language: "EN",
                      content: typeof descContent === "string" ? descContent : String(descContent),
                    },
                    // Add Polish translation if available
                    ...(typeof usage.usageDescription === "object" && usage.usageDescription.pl
                      ? [
                          {
                            language: "PL",
                            content:
                              typeof usage.usageDescription.pl === "string"
                                ? usage.usageDescription.pl
                                : String(usage.usageDescription.pl),
                          },
                        ]
                      : []),
                  ],
                },
                sentences: {
                  create: usage.sentencesList.map((sentence) => ({
                    translations: {
                      create: [
                        {
                          language: "EN",
                          content:
                            typeof sentence.en === "string" ? sentence.en : String(sentence.en),
                        },
                        {
                          language: "PL",
                          content:
                            typeof sentence.pl === "string" ? sentence.pl : String(sentence.pl),
                        },
                      ],
                    },
                  })),
                },
              };
            }),
          },
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
              sentences: {
                include: {
                  translations: true,
                },
              },
            },
          },
        },
      });
    },
    {
      timeout: 10000,
    }
  );

  revalidatePath(routes.wordListDetails(word.id));
  return updatedWord;
}
