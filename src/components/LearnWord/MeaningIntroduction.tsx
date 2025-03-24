"use client";

import React from "react";
import { WordForLearning } from "@/db/getWordsForLearning";
import { getMatchTranslation } from "@/lib/getMatchTranslation";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { MeaningCard } from "./MeaningCard";

export function MeaningIntroduction({
  currentWord,
  nextRound,
}: {
  currentWord: WordForLearning;
  nextRound: () => void;
}) {
  const { content: wordTitle } = getMatchTranslation(currentWord.translations, "EN");

  const handleResponse = (wantsToLearn: boolean) => {
    console.log(`User ${wantsToLearn ? "wants" : "does not want"} to learn the word: ${wordTitle}`);

    setTimeout(() => {
      nextRound();
    }, 300);
  };

  const [cards, setCards] = React.useState(currentWord.useCases);

  const firstToLast = () => {
    setCards((prev) => {
      console.log("Works");

      if (prev.length < 2) throw new Error("Minimum 2 cards required to move one to the end");

      const lastCard = prev.slice(-1)[0];
      const restCards = prev.slice(0, -1);
      console.log(lastCard);
      console.log(restCards);

      if (!lastCard) throw new Error("Last card not found");

      return [lastCard, ...restCards];
    });
  };

  console.log("cards: ", cards);

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col px-4">
      <h1 className="mb-5 text-center text-3xl font-bold text-white">{wordTitle}</h1>
      <div className="relative flex flex-1 flex-col">
        <AnimatePresence>
          {cards.map((item, index) => {
            const { content: enTitle } = getMatchTranslation(item.titleTranslations, "EN");
            const { content: enDescription } = getMatchTranslation(
              item.descriptionTranslations,
              "EN"
            );
            const { content: plTitle } = getMatchTranslation(item.wordTranslations, "PL");
            const { content: plDescription } = getMatchTranslation(
              item.descriptionTranslations,
              "PL"
            );

            return (
              <MeaningCard
                key={item.id}
                length={cards.length}
                index={index}
                onDragEnd={firstToLast}
                renderFront={
                  <div className="flex flex-col items-center justify-center p-8 py-10 text-white">
                    <h2 className="text-center text-xl font-bold">{enTitle}</h2>
                    <div className="my-4 w-full border-t border-white opacity-20" />
                    <p className="text-center text-base">{enDescription}</p>
                  </div>
                }
                renderBack={
                  <div
                    style={{ transform: "rotateY(180deg)" }}
                    className="flex flex-col items-center justify-center p-8 py-10 text-white"
                  >
                    <h2 className="text-center text-xl font-bold">{plTitle}</h2>
                    <div className="my-4 w-full border-t border-white opacity-20" />
                    <p className="text-center text-base">{plDescription}</p>
                  </div>
                }
              />
            );
          })}
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between gap-2 text-white">
        <Button
          variant="outline"
          className="h-20 w-20 justify-center rounded-full border border-white bg-transparent p-0 hover:bg-white/10"
          onClick={() => handleResponse(false)}
        >
          <X size={36} color="white" />
        </Button>
        Learn?
        <Button
          variant="outline"
          className="h-20 w-20 justify-center rounded-full border border-white bg-transparent p-0 hover:bg-white/10"
          onClick={() => handleResponse(true)}
        >
          <Check size={36} color="white" />
        </Button>
      </div>
    </div>
  );
}
