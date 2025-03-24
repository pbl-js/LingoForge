"use client";

import React from "react";
import { WordForLearning } from "@/db/getWordsForLearning";
import { getMatchTranslation } from "@/lib/getMatchTranslation";
import MusicGenreBubbles from "./CircleGravityGrid";
import { cn } from "@/lib/utils";

export function WordPuzzles({
  currentWord,
  // nextRound,
}: {
  currentWord: WordForLearning;
  nextRound: () => void;
}) {
  const { content: wordTitle } = getMatchTranslation(currentWord.translations, "EN");

  // const handleContinue = () => {
  //   nextRound();
  // };

  const [inputState, setInputState] = React.useState<"idle" | "hoovered" | "correct" | "incorrect">(
    "idle"
  );

  const childrenRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center px-4">
      <div className="mb-10 flex items-center justify-center text-white">{wordTitle}</div>

      <div className="flex h-full w-full">
        <MusicGenreBubbles
          childrenRef={childrenRef}
          setInputState={setInputState}
          items={[
            { name: "App", size: 80, color: "white" },
            { name: "reh", size: 80, color: "white" },
            { name: "and", size: 80, color: "white" },
          ]}
        >
          <div
            ref={childrenRef}
            className={cn(
              "absolute bottom-4 left-3 right-3 flex items-center justify-center rounded-xl border-2 p-3 text-center text-xl font-semibold text-white",
              { "bg-white/10": inputState === "hoovered" }
            )}
          >
            Apprehand
          </div>
        </MusicGenreBubbles>
      </div>
    </div>
  );
}
