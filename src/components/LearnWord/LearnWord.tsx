'use client';

import React from 'react';
import { WordsForLearning } from '@/db/getWordsForLearning';
import { GuessWordInSentence } from './GuessWordInSentence';

// Add onClick to select answer
// State active answer
// If answer is correct, add to learned words

export function LearnWord({
  wordsList,
  currentWordId,
}: {
  wordsList: WordsForLearning;
  currentWordId: number;
}) {
  const currentWord = wordsList.find((word) => word.id === currentWordId);
  if (!currentWord) throw new Error('Word not found');

  // const [correctAnswerId, setCorrectAnswerId] = React.useState<number | null>(
  //   null
  // );

  return <GuessWordInSentence currentWord={currentWord} />;
}
