import { currentUser } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { aiLearningSentences } from "@/services/aiSentences/aiSentences";
import { getMatchTranslation } from "@/lib/getMatchTranslation";

export async function POST(req: NextRequest) {
  try {
    // Validate request
    const body = await req.json();
    const schema = z.object({
      words: z.array(z.number()),
    });
    const parseResult = schema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: parseResult.error.issues },
        { status: 400 }
      );
    }
    const { words: wordsId } = parseResult.data;

    // Auth guard
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    // Get list of all words from database
    const prisma = new PrismaClient();
    const words = await prisma.word.findMany({
      where: { userId: user.id, id: { in: wordsId } },
      include: {
        translations: true,
      },
    });

    // Flatten translations to en property instead of array of translations
    const wordsWithFlattenEnTranslations = words.map((item) => ({
      ...item,
      translations: {
        en: getMatchTranslation(item.translations, "EN").content,
      },
    }));

    // Add promise for every word
    const wordsWithFlattenEnTranslationsWithLearningSentencesPromises =
      wordsWithFlattenEnTranslations.map((item) => {
        return {
          ...item,
          learningSentencesPromise: aiLearningSentences(item.translations.en, 5),
        };
      });

    // Resolve all promises at once. If any promise fails, all promises will be rejected
    const wordsWithFlattenEnTranslationsWithLearningSentences = await Promise.all(
      wordsWithFlattenEnTranslationsWithLearningSentencesPromises.map(
        (item) => item.learningSentencesPromise
      )
    );

    console.log(
      "wordsWithFlattenEnTranslationsWithLearningSentences",
      wordsWithFlattenEnTranslationsWithLearningSentences
    );

    // const wordsWithAiPromises = words.map(item => ({word: item.translations.}))
    const learningSentences = await aiLearningSentences("take", 5);

    console.log(learningSentences);
    // If there is no simillar words, generate them
    // Check count of learningSentences. If there is less than 5, generate more
    // Check if every sentence has audioUrl. If not, generate it

    // return NextResponse.json({ word }, { status: 200 });
  } catch (err) {
    console.error("POST /api/game-data-set", err);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
