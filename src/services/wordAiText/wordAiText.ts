import { WORD_AI_TEXT } from "@/consts/prompts";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";

const openai = new OpenAI();

const translationSchema = z.object({
  en: z.string(),
  pl: z.string(),
});

// Sometimes translating english to english is not needed
const translationSchemaExcludeEnglish = z.object({
  pl: z.string(),
});

export const WordAiTextSchema = z.object({
  word: z.string().describe("The word provided by user"),
  similarWords: z.array(translationSchema),
  usagesList: z.array(
    z.object({
      wordTranslation: translationSchemaExcludeEnglish,
      usageTitle: translationSchema,
      usageDescription: translationSchema,
      sentencesList: z.array(translationSchema),
    })
  ),
});

export type WordAiText = z.infer<typeof WordAiTextSchema>;

export const wordAiText = (sentence: string, sentencesCount: number) =>
  openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "developer",
        content: WORD_AI_TEXT(sentencesCount),
      },
      {
        role: "user",
        content: sentence,
      },
    ],
    response_format: zodResponseFormat(WordAiTextSchema, "sentence"),
    store: true,
  });
