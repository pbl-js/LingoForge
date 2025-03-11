'use client';

import React from 'react';
import { WordForLearning } from '@/db/getWordsForLearning';
import { getMatchTranslation } from '@/lib/getMatchTranslation';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { MeaningCard } from './MeaningCard';

export function MeaningIntroduction({
  currentWord,
  nextRound,
}: {
  currentWord: WordForLearning;
  nextRound: () => void;
}) {
  const { content: wordTitle } = getMatchTranslation(
    currentWord.translations,
    'EN'
  );

  const handleResponse = (wantsToLearn: boolean) => {
    console.log(
      `User ${
        wantsToLearn ? 'wants' : 'does not want'
      } to learn the word: ${wordTitle}`
    );

    setTimeout(() => {
      nextRound();
    }, 300);
  };

  const [cards, setCards] = React.useState(currentWord.useCases);

  const firstToLast = () => {
    setCards((prev) => {
      console.log('Works');

      if (prev.length < 2)
        throw new Error('Minimum 2 cards required to move one to the end');

      const lastCard = prev.slice(-1)[0];
      const restCards = prev.slice(0, -1);
      console.log(lastCard);
      console.log(restCards);

      if (!lastCard) throw new Error('Last card not found');

      return [lastCard, ...restCards];
    });
  };

  console.log('cards: ', cards);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-full px-4">
      <h1 className="text-3xl font-bold text-center text-white mb-5">
        {wordTitle}
      </h1>
      <div className="flex flex-col flex-1 relative">
        <AnimatePresence>
          {cards.map((item, index) => {
            const { content: title } = getMatchTranslation(
              item.titleTranslations,
              'EN'
            );
            const { content: description } = getMatchTranslation(
              item.descriptionTranslations,
              'EN'
            );

            return (
              <MeaningCard
                key={item.id}
                length={cards.length}
                index={index}
                onDragEnd={firstToLast}
              >
                <div className="text-white p-8 py-10 flex flex-col items-center justify-center">
                  <h2 className="text-xl font-bold text-center">{title}</h2>
                  <div className="my-4 border-t border-white opacity-20 w-full" />
                  <p className="text-base text-center">{description}</p>
                </div>
              </MeaningCard>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="flex text-white items-center gap-2 justify-between">
        <Button
          variant="outline"
          className="rounded-full h-20 w-20 justify-center p-0 bg-transparent border border-white hover:bg-white/10"
          onClick={() => handleResponse(false)}
        >
          <X size={36} color="white" />
        </Button>
        Learn?
        <Button
          variant="outline"
          className="rounded-full h-20 w-20 justify-center p-0 bg-transparent border border-white hover:bg-white/10"
          onClick={() => handleResponse(true)}
        >
          <Check size={36} color="white" />
        </Button>
      </div>
    </div>
  );
}
