import { AddWordButton } from '@/components/AddWordButton/AddWordButton';
import { routes } from '@/consts/routes';
import { getWords } from '@/db/getWords';
import { currentUser, User } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = (await currentUser()) as User;
  const prisma = new PrismaClient();
  const wordList = await getWords(prisma, { userId: user.id });

  return (
    <main className="grid grid-cols-[1fr_3fr] w-full grow h-full gap-8">
      <div className="flex flex-col gap-3 items-start">
        <div className="flex w-full justify-between min-h-[40px]">
          <h1 className="text-2xl font-bold text-center text-white">
            Words list
          </h1>
          <AddWordButton>Add Word</AddWordButton>
        </div>
        <div className="flex flex-col p-3 rounded-xl bg-purple-900 gap-3 grow w-full">
          {wordList.map((el) => (
            <Link href={routes.wordListDetails(el.id)} key={el.id}>
              {el.title}
            </Link>
          ))}
        </div>
      </div>
      {children}
    </main>
  );
}
