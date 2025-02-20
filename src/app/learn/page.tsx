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
    <div className="flex flex-col grow">
      <LearnWord wordsList={words} />
    </div>
  );
}
