import React from 'react';

export function NoWord() {
  return (
    <div className="flex flex-col gap-3 items-start">
      <div className="flex w-full justify-between min-h-[40px]">
        <h1 className="text-2xl font-bold text-center text-white">
          Sentences list
        </h1>
        {/* <GenerateSentenceButton /> */}
      </div>
      <div className="flex flex-col p-3 rounded-xl bg-purple-900 gap-3 grow w-full">
        {
          "You haven't added any words yet. Click the button below to add a word."
        }
      </div>
    </div>
  );
}
