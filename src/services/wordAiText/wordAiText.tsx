import { GENERATE_SENTENCE_PROMPT } from '@/consts/prompts';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import { z } from 'zod';

const openai = new OpenAI();

export const WordAiTextSchema = z.object({
  word: z.string().describe('The word provided by user'),
  similarWords: z.array(z.string()),
  usagesList: z.array(
    z.object({
      usageTitle: z.string(),
      usageDescription: z.string(),
      sentencesList: z.array(z.object({ name: z.string() })),
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
        content: GENERATE_SENTENCE_PROMPT,
      },
      {
        role: 'user',
        content: sentence,
      },
    ],
    response_format: zodResponseFormat(WordAiTextSchema, 'sentence'),
    store: true,
  });
