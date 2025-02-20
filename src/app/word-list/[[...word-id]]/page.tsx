import React from 'react';
import { currentUser, User } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { getWordById } from '@/db/getWordById';
import { getWords } from '@/db/getWords';
import { NoWord } from './NoWord';
import { WordDetailsHeader } from '@/components/WordDetailsHeader/WordDetailsHeader';
import { SpeechButton } from '@/components/SpeechButton/SpeechButton';

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

  return (
    <div className="flex flex-col gap-3 items-start">
      <WordDetailsHeader title={word.title} wordId={word.id} />
      <div className="flex flex-col p-3 rounded-xl bg-purple-900 gap-3 grow w-full">
        {/* Display similar words */}
        {word.similarWords && word.similarWords.length > 0 && (
          <div className="mb-4">
            <h3 className="text-white font-medium mb-2">Similar Words</h3>
            <ul className="pl-4">
              {word.similarWords.map((similarWord) => (
                <li
                  key={similarWord.id}
                  className="text-sm text-gray-400 list-disc list-inside"
                >
                  {similarWord.content}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Display use cases */}
        <div className="flex flex-col">
          {word.useCases.length === 0 ? (
            <p className="text-gray-400">
              No sentences generated yet. Click the button to generate some!
            </p>
          ) : (
            word.useCases.map((useCase) => (
              <div key={useCase.id} className="text-white py-1">
                {useCase.title}
                <p className="text-gray-400">{useCase.description}</p>
                <ul className="flex flex-col gap-1 mt-2 pl-4">
                  {useCase.sentences.map((sentence) => (
                    <li
                      key={sentence.id}
                      className="text-sm text-gray-300 list-disc list-inside flex items-center"
                    >
                      {sentence.name}
                      <SpeechButton text={sentence.name} />
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
