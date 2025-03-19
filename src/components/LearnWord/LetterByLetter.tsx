"use client";

import React from "react";
import { WordForLearning } from "@/db/getWordsForLearning";
import { getMatchTranslation } from "@/lib/getMatchTranslation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function LetterByLetter({
  currentWord,
  nextRound,
}: {
  currentWord: WordForLearning;
  nextRound: () => void;
}) {
  const { content: wordTitle } = getMatchTranslation(currentWord.translations, "EN");

  const handleContinue = () => {
    nextRound();
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center px-4">
      <h1 className="mb-10 text-center text-3xl font-bold text-white">Learn this word</h1>

      <div className="mb-10 flex items-center justify-center text-white">{wordTitle}</div>

      <Button
        onClick={handleContinue}
        className="flex h-16 items-center justify-center gap-2 rounded-full bg-white px-8 text-lg font-semibold text-black hover:bg-white/90"
      >
        <Check className="h-6 w-6" />
        Continue
      </Button>
    </div>
  );
}
