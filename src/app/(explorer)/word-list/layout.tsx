import { AddWordButton } from "@/components/AddWordButton/AddWordButton";
import { WordListItem } from "@/components/WordList/WordListItem";
import { getWords } from "@/db/getWords";
import { getMatchTranslation } from "@/lib/getMatchTranslation";
import { currentUser, User } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = (await currentUser()) as User;

  const prisma = new PrismaClient();
  const wordList = await getWords(prisma, { userId: user.id });

  return (
    <main className="grid h-full w-full grow grid-cols-[1fr_3fr] gap-8">
      <div className="flex flex-col items-start gap-3">
        <div className="flex min-h-[40px] w-full justify-between">
          <h1 className="text-center text-2xl font-bold text-white">Words list</h1>
          <AddWordButton>Add Word</AddWordButton>
        </div>
        <div className="flex w-full grow flex-col gap-3">
          {wordList.map((word) => {
            return (
              <WordListItem
                key={word.id}
                id={word.id}
                title={getMatchTranslation(word.translations, "EN").content}
              />
            );
          })}
        </div>
      </div>
      {children}
    </main>
  );
}
