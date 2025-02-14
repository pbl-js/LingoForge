import { GenerateSentenceButton } from '@/components/GenerateSentenceButton/GenerateSentenceButton';
import React from 'react';
import { currentUser, User } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { getWordById } from '@/db/getWordById';
import { getWords } from '@/db/getWords';
import { NoWord } from './NoWord';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: Promise<{ ['word-id']: number }>;
}) {
  const routeParams = await params;

  const user = (await currentUser()) as User;
  const prisma = new PrismaClient();

  const word = await (async () => {
    if (!routeParams['word-id']) {
      const words = await getWords(prisma, { userId: user.id });
      if (words.length === 0 || !words[0]) {
        return null;
      }

      const word = await getWordById(prisma, {
        userId: user.id,
        wordId: words[0].id,
      });

      return word;
    }

    const word = await prisma.word.findFirst({
      where: {
        userId: user.id,
        id: Number(routeParams['word-id']),
      },
    });

    return word;
  })();

  if (!word) return <NoWord />;

  return (
    <div className="flex flex-col gap-3 items-start">
      <div className="flex w-full justify-between min-h-[40px]">
        <h1 className="text-2xl font-bold text-center text-white">
          Sentences list
        </h1>
        <GenerateSentenceButton />
      </div>
      <div className="flex flex-col p-3 rounded-xl bg-purple-900 gap-3 grow w-full">
        {word.title}
      </div>
    </div>
  );
}
