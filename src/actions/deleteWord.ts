"use server";

import { PrismaClient } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { routes } from "@/consts/routes";
import { del } from "@vercel/blob";
import { getWordById } from "@/db/getWordById";

export async function deleteWordAction(wordId: number) {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("User not found");
    }

    const prisma = new PrismaClient();

    // Get the word to access its translations before deletion
    const word = await getWordById(prisma, {
      userId: user.id,
      wordId: wordId,
    });

    if (!word) {
      throw new Error("Word not found");
    }

    // Find translations with audio URLs
    const translationsWithAudio = word.translations.filter((translation) => translation.audioUrl);

    await prisma.word.delete({
      where: {
        id: wordId,
        userId: user.id,
      },
    });

    // Delete the audio files after successful database deletion
    for (const translation of translationsWithAudio) {
      if (translation.audioUrl) {
        try {
          await del(translation.audioUrl);
        } catch (error) {
          console.error("Failed to delete audio file:", error);
          // Continue with other deletions even if one fails
        }
      }
    }

    revalidatePath(routes.wordList);
    return { success: true };
  } catch (err) {
    console.error("Error deleting word:", err);
    throw err;
  }
}
