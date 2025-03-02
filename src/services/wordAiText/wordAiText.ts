import { WORD_AI_TEXT } from '@/consts/prompts';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import { z } from 'zod';

const openai = new OpenAI();

export const WordAiTextSchema = z.object({
  word: z.string().describe('The word provided by user'),
  similarWords: z.array(z.string()),
  usagesList: z.array(
    z.object({
      usageTitle: z.object({ en: z.string(), pl: z.string() }),
      usageDescription: z.object({ en: z.string(), pl: z.string() }),
      sentencesList: z.array(z.object({ en: z.string(), pl: z.string() })),
    })
  ),
});

export type WordAiText = z.infer<typeof WordAiTextSchema>;

export const wordAiText = (sentence: string) =>
  openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'developer',
        content: WORD_AI_TEXT,
      },
      {
        role: 'user',
        content: sentence,
      },
    ],
    response_format: zodResponseFormat(WordAiTextSchema, 'sentence'),
    store: true,
  });
