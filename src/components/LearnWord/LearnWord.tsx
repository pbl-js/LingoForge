"use client";

import React from "react";
import { WordForLearning } from "@/db/getWordsForLearning";
import { GuessWordInSentence } from "./GuessWordInSentence";
import { MeaningIntroduction } from "./MeaningIntroduction";
import { LetterByLetter } from "./LetterByLetter";

// Define game variants
type GameVariant = "GuessWordInSentence" | "MeaningIntroduction" | "LetterByLetter";
const variants: GameVariant[] = [
  "GuessWordInSentence",
  // "MeaningIntroduction",
  "LetterByLetter",
];
const getRandomVariant = () => variants[Math.floor(Math.random() * variants.length)] as GameVariant;

export function LearnWord({ wordsList }: { wordsList: WordForLearning[] }) {
  if (wordsList.length === 0 || wordsList[0] === undefined) {
    throw new Error("LearnWord component must be used with wordsList");
  }

  const firstWord = wordsList[0];
  const [currentWordId, setCurrentWordId] = React.useState<number>(firstWord.id);

  const [gameVariant, setGameVariant] = React.useState<GameVariant>(getRandomVariant());

  const currentWord = wordsList.find((word) => word.id === currentWordId);
  if (!currentWord) throw new Error("Word not found");

  function nextRound() {
    const availableWords = wordsList.filter((word) => word.id !== currentWordId);
    const randomIndex = Math.floor(Math.random() * availableWords.length);

    if (!availableWords[randomIndex]) throw new Error("Random index is 0");
    setCurrentWordId(availableWords[randomIndex].id);

    setGameVariant(getRandomVariant());
  }

  return (
    <>
      {(() => {
        switch (gameVariant) {
          case "GuessWordInSentence":
            return (
              <GuessWordInSentence
                key={`guess-${currentWord.id}`}
                currentWord={currentWord}
                nextRound={nextRound}
              />
            );
          case "MeaningIntroduction":
            return (
              <MeaningIntroduction
                key={`meaning-${currentWord.id}`}
                currentWord={currentWord}
                nextRound={nextRound}
              />
            );
          case "LetterByLetter":
            return (
              <LetterByLetter
                key={`letter-${currentWord.id}`}
                currentWord={currentWord}
                nextRound={nextRound}
              />
            );
        }
      })()}
    </>
  );
}
