import React from "react";

export function NoWord() {
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex min-h-[40px] w-full justify-between">
        <h1 className="text-center text-2xl font-bold text-white">Sentences list</h1>
        {/* <GenerateSentenceButton /> */}
      </div>
      <div className="flex w-full grow flex-col gap-3 rounded-xl bg-purple-900 p-3">
        {"You haven't added any words yet. Click the button below to add a word."}
      </div>
    </div>
  );
}
