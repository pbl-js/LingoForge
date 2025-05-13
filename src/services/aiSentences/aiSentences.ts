import { GENERATE_SENTENCES } from "@/consts/prompts";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";

const openai = new OpenAI();

const translationSchema = z.object({
  en: z.string(),
  pl: z.string(),
});

export const AiSentencesSchema = z.object({
  word: z.string().describe("The word provided by user"),
  sentencesList: z.array(translationSchema),
});

export type AiSentences = z.infer<typeof AiSentencesSchema>;

export const aiLearningSentences = async (word: string, sentencesCount: number) => {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "developer",
        content: GENERATE_SENTENCES(sentencesCount + 1),
      },
      {
        role: "user",
        content: word,
      },
    ],
    response_format: zodResponseFormat(AiSentencesSchema, "sentence"),
    store: true,
  });

  if (!res.choices[0]?.message.content) throw new Error("No sentences for provided word");

  const parsedRes = AiSentencesSchema.parse(JSON.parse(res.choices[0]?.message.content));
  const validatedSentences = parsedRes.sentencesList.filter((sentence) =>
    sentence.en.toLowerCase().includes(word.toLowerCase())
  );

  if (validatedSentences.length < sentencesCount) {
    const sentencesWithoutWord = parsedRes.sentencesList.filter(
      (sentence) => !sentence.en.includes(word)
    );
    console.warn("OpenAI returned sentences without provided word in proper form");
    console.warn("Sentences without word", sentencesWithoutWord);
  }

  return validatedSentences.slice(0, sentencesCount);
};
