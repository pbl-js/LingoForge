import React from "react";
import { PrismaClient } from "@prisma/client";
import { currentUser, User } from "@clerk/nextjs/server";
import { LearnWord } from "@/components/LearnWord/LearnWord";
import { getWordsForLearning } from "@/db/getWordsForLearning";
import { LearnHeader } from "@/components/LearnHeader/LearnHeader";

export default async function LearnPage() {
  const prisma = new PrismaClient();
  const user = (await currentUser()) as User;
  const words = await getWordsForLearning(prisma, { userId: user.id });

  return (
    <div className="flex h-dvh max-w-[400px] flex-col gap-8 p-4">
      <LearnHeader />
      {words.length < 2 ? (
        <div className="flex grow flex-col text-center text-white">
          Minimal words number to learn is 2. Please add more words
        </div>
      ) : (
        <LearnWord wordsList={words} />
      )}
    </div>
  );
}
