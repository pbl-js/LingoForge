import { AddWordButton } from '@/components/AddWordButton/AddWordButton';
import { GenerateSentenceButton } from '@/components/GenerateSentenceButton/GenerateSentenceButton';
import { currentUser } from '@clerk/nextjs/server';

export default async function Home() {
  const user = await currentUser();

  console.log(user?.id);

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
          adsfadsf
        </div>
      </div>
      <div className="flex flex-col gap-3 items-start">
        <div className="flex w-full justify-between min-h-[40px]">
          <h1 className="text-2xl font-bold text-center text-white">
            Sentences list
          </h1>
        </div>
        <div className="flex flex-col p-3 rounded-xl bg-purple-900 gap-3 grow w-full">
          adsfadsf
        </div>
      </div>
      {/* <GenerateSentenceButton /> */}
    </main>
  );
}
