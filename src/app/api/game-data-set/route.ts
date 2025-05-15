import { currentUser } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { aiLearningSentences } from "@/services/aiSentences/aiSentences";
import { getMatchTranslation } from "@/lib/getMatchTranslation";
import { saveAiLearningSentences } from "@/services/saveAiLearningSentences/saveAiLearningSentences";

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

    const prisma = new PrismaClient();

    // Get list of all words from database
    const words = await prisma.word.findMany({
      where: { userId: user.id, id: { in: wordsId } },
      include: {
        translations: true,
        learningSentences: true,
      },
    });

    // TODO: if word has less than 5 learning sentences, generate more.

    // Process each word. Generate learning sentences and save them to the database
    const processedWords = await Promise.all(
      words.map(async (word) => {
        const enTranslation = getMatchTranslation(word.translations, "EN").content;
        const generatedSentences = await aiLearningSentences(enTranslation, 5);

        return saveAiLearningSentences({
          prisma,
          sentences: generatedSentences,
          wordId: word.id,
        });
      })
    );

    // Generate audio for each sentence
    // const translationsToGenerateAudio = processedWords
    //   .flatMap((item) => item.learningSentences.flatMap((sentence) => sentence.translations))
    //   .filter((item) => item.language === "EN");

    // const audioResults = await genAudioWithTimestampsForTranslations(translationsToGenerateAudio);

    // Filter successful results and prepare for saving
    // const successfulResults = audioResults.filter((result) => result.success && result.audioStream);
    // const audioTranslationItems = await Promise.all(
    //   successfulResults.map(async (result) => {
    //     if (!result.audioStream) {
    //       throw new Error("Audio stream is null despite success flag");
    //     }

    //     const chunks = [];
    //     for await (const chunk of result.audioStream) {
    //       chunks.push(chunk);
    //     }
    //     const audioBuffer = Buffer.concat(chunks);

    //     // Make sure we have data
    //     if (!audioBuffer || audioBuffer.length === 0) {
    //       throw new Error("Received empty audio buffer from ElevenLabs");
    //     }

    //     return {
    //       translationId: result.translation.id,
    //       languageCode: result.translation.language,
    //       audioBuffer,
    //       timestamps: result.timestamps,
    //     };
    //   })
    // );

    // await saveAudioForTranslations(audioTranslationItems);

    // Identify any failed translations, if any, return error with failed ids
    // const failedIds = audioResults
    //   .filter((result) => !result.success)
    //   .map((result) => result.translation.id);

    // if (failedIds.length > 0) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: `Failed to generate audio for ${failedIds.length} translations`,
    //       failedIds,
    //     },
    //     { status: 500 }
    //   );
    // }

    // Generate game data set
    const gameDataSet = await prisma.gameDataSet.create({
      data: {
        userId: user.id,
        words: {
          create: processedWords.map((item) => ({
            word: {
              connect: { id: item.wordId },
            },
          })),
        },
      },
    });

    return NextResponse.json({ data: gameDataSet }, { status: 200 });
  } catch (err) {
    console.error("POST /api/game-data-set", err);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
