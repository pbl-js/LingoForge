"use client";

import React from "react";
import { WordForLearning } from "@/db/getWordsForLearning";
import { getMatchTranslation } from "@/lib/getMatchTranslation";
import { splitWordIntoParts } from "@/lib/splitWordIntoParts";
import { cn } from "@/lib/utils";
import { getWordDisplay } from "@/lib/getWordDisplay";

type WordPart = {
  content: string;
  succeed: boolean;
  mistaken: boolean;
};

export function LetterByLetter({
  currentWord,
  nextRound,
}: {
  currentWord: WordForLearning;
  nextRound: () => void;
}) {
  const { content: wordTitle } = getMatchTranslation(currentWord.translations, "EN");

  const partsList = splitWordIntoParts(wordTitle);

  const [parts, setParts] = React.useState<WordPart[]>(() =>
    partsList.map((part) => ({
      content: part,
      succeed: false,
      mistaken: false,
    }))
  );
  const nextCorrectPartIndex = parts.findIndex((part) => !part.succeed);

  function handlePartClick(part: WordPart) {
    if (nextCorrectPartIndex === -1) {
      throw new Error("No more parts to correct");
    }
    const correctPart = partsList[nextCorrectPartIndex];

    if (!correctPart) {
      throw new Error("No more parts to correct");
    }

    if (part.content === correctPart) {
      const newParts: WordPart[] = parts.map((p) =>
        p.content === part.content ? { ...p, succeed: true } : { ...p, mistaken: false }
      );
      setParts(newParts);

      const allPartsSucceeded = newParts.every((part) => part.succeed);
      if (allPartsSucceeded) {
        nextRound();
      }
    } else {
      setParts((prev) =>
        prev.map((p) => (p.content === part.content ? { ...p, mistaken: true } : p))
      );
    }
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center gap-4 px-4">
      <h1 className="mb-10 text-center text-3xl font-bold text-white">Learn this word</h1>

      <div className="flex h-full items-center">
        <div className="flex gap-2">
          {parts.map(
            (part, index) =>
              !part.succeed && (
                <button
                  key={index}
                  onClick={() => handlePartClick(part)}
                  className={cn(
                    "cursor-pointer rounded-full border border-white px-8 py-4 text-lg text-white hover:bg-white/10",
                    {
                      "bg-green-500": part.succeed,
                      "bg-white/10 hover:bg-white/10": part.mistaken,
                    }
                  )}
                >
                  {part.content}
                </button>
              )
          )}
        </div>
      </div>

      <div className="flex w-full justify-center rounded-full border border-white p-4 text-white">
        <div>
          {getWordDisplay(wordTitle, parts)
            .split("")
            .map((char, index) => (
              <span key={index} className={cn("font-mono")}>
                {char}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
