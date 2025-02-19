import React from 'react';
import { PrismaClient } from '@prisma/client';
import { currentUser, User } from '@clerk/nextjs/server';
import { LearnWord } from '@/components/LearnWord/LearnWord';
import { getWordsForLearning } from '@/db/getWordsForLearning';

export default async function LearnPage() {
  const prisma = new PrismaClient();
  const user = (await currentUser()) as User;
  const words = await getWordsForLearning(prisma, { userId: user.id });

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold text-white">Learn</h1>
      <div className="flex flex-col p-3 rounded-xl bg-purple-900 gap-3">
        <p className="text-white">Learning section coming soon...</p>
        <div className="flex flex-col gap-2">
          {words.map((word) => (
            <div
              key={word.id}
              className="flex items-center gap-2 p-2 bg-purple-800 rounded-lg"
            >
              <span className="text-white">{word.title}</span>
            </div>
          ))}
        </div>
      </div>
      <LearnWord wordsList={words} currentWordId={words[0]?.id as number} />
    </div>
  );
}
