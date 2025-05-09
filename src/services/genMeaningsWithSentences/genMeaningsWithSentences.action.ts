"use server";

import { auth } from "@clerk/nextjs/server";
import {
  genMeaningsWithSentences,
  GenMeaningsWithSentencesSchema,
} from "./genMeaningsWithSentences.ai";

export async function genMeaningsWithSentencesAction(word: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const res = await genMeaningsWithSentences(word, 1);

  if (!res.choices[0]?.message.content) throw new Error("No sentences for provided word");

  const parsedRes = GenMeaningsWithSentencesSchema.parse(
    JSON.parse(res.choices[0]?.message.content)
  );

  return parsedRes;
}
