import { GenerateSentenceButton } from '@/components/GenerateSentenceButton/GenerateSentenceButton';
import React from 'react';
import { currentUser, User } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { getWordById } from '@/db/getWordById';
import { getWords } from '@/db/getWords';
import { NoWord } from './NoWord';
import { WordDetailsHeader } from '@/components/WordDetailsHeader/WordDetailsHeader';

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

    const word = await getWordById(prisma, {
      userId: user.id,
      wordId: Number(routeParams['word-id']),
    });

    return word;
  })();

  if (!word) return <NoWord />;

  if (word.useCases.length === 0) {
    return (
      <div className="flex flex-col gap-3 items-start">
        <WordDetailsHeader title={word.title} wordId={word.id} />
        <div className="flex flex-col p-3 rounded-xl bg-purple-900 gap-3 grow w-full">
          <p className="text-gray-400">
            No sentences generated yet. Click the button to generate some!
          </p>
        </div>
      </div>
    );
  }

  const useCases = word.useCases.map((useCase) => ({
    title: useCase.title,
    description: useCase.description,
    sentences: useCase.sentences,
  }));

  return (
    <div className="flex flex-col gap-3 items-start">
      <WordDetailsHeader title={word.title} wordId={word.id} />
      <div className="flex flex-col p-3 rounded-xl bg-purple-900 gap-3 grow w-full">
        <div className="flex flex-col">
          {useCases.map((useCase, index) => (
            <div key={index} className="text-white py-1">
              {useCase.title}
              <p className="text-gray-400">{useCase.description}</p>
              <ul className="flex flex-col gap-1 mt-2 pl-4">
                {useCase.sentences.map((sentence, sentenceIndex) => (
                  <li
                    key={sentenceIndex}
                    className="text-sm text-gray-300 list-disc list-inside"
                  >
                    {sentence.content}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
