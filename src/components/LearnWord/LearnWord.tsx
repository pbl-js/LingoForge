'use client';

import React from 'react';
import { WordForLearning, WordsForLearning } from '@/db/getWordsForLearning';
import { GuessWordInSentence } from './GuessWordInSentence';

export function LearnWord({ wordsList }: { wordsList: WordsForLearning }) {
  if (wordsList.length === 0) {
    throw new Error('LearnWord component must be used with wordsList');
  }

  const firstWord = wordsList[0] as WordForLearning;
  const [currentWordId, setCurrentWordId] = React.useState<number>(
    firstWord.id
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
  }

  return (
    <GuessWordInSentence
      key={currentWord.id}
      currentWord={currentWord}
      nextRound={nextRound}
    />
  );
}
