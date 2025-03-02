'use server';

import { auth } from '@clerk/nextjs/server';
import { wordAiText, WordAiTextSchema } from './wordAiText';

export async function wordAiTextAction(word: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const res = await wordAiText(word);

  if (!res.choices[0]?.message.content)
    throw new Error('No sentences for provided word');

  const parsedRes = WordAiTextSchema.parse(
    JSON.parse(res.choices[0]?.message.content)
  );

  return parsedRes;
}
