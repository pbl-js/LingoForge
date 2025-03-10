'use client';

import React from 'react';
import { WordForLearning } from '@/db/getWordsForLearning';
import { GuessWordInSentence } from './GuessWordInSentence';
import { MeaningIntroduction } from './MeaningIntroduction';

// Define game variants
type GameVariant = 'GuessWordInSentence' | 'MeaningIntroduction';

export function LearnWord({ wordsList }: { wordsList: WordForLearning[] }) {
  if (wordsList.length === 0 || wordsList[0] === undefined) {
    throw new Error('LearnWord component must be used with wordsList');
  }

  const firstWord = wordsList[0];
  const [currentWordId, setCurrentWordId] = React.useState<number>(
    firstWord.id
  );

  // State to track the current game variant
  const [gameVariant, setGameVariant] = React.useState<GameVariant>(
    'MeaningIntroduction'
  );

  const currentWord = wordsList.find((word) => word.id === currentWordId);
  if (!currentWord) throw new Error('Word not found');

  function nextRound() {
    const availableWords = wordsList.filter(
      (word) => word.id !== currentWordId
    );
    const randomIndex = Math.floor(Math.random() * availableWords.length);

    if (!availableWords[randomIndex]) throw new Error('Random index is 0');
    setCurrentWordId(availableWords[randomIndex].id);

    // Randomly select a game variant for the next round
    const variants: GameVariant[] = [
      'GuessWordInSentence',
      'MeaningIntroduction',
    ];
    const randomVariant = variants[
      Math.floor(Math.random() * variants.length)
    ] as GameVariant;
    setGameVariant(randomVariant);
  }

  // Render the appropriate game component based on the current variant
  return (
    <>
      {gameVariant === 'GuessWordInSentence' ? (
        <GuessWordInSentence
          key={`guess-${currentWord.id}`}
          currentWord={currentWord}
          nextRound={nextRound}
        />
      ) : (
        <MeaningIntroduction
          key={`meaning-${currentWord.id}`}
          currentWord={currentWord}
          nextRound={nextRound}
        />
      )}
    </>
  );
}
