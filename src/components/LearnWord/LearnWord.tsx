'use client';

import React from 'react';
import { WordsForLearning } from '@/db/getWordsForLearning';

export function LearnWord({
  wordsList,
  currentWordId,
}: {
  wordsList: WordsForLearning;
  currentWordId: number;
}) {
  const currentWord = wordsList.find((word) => word.id === currentWordId);

  const [] = React.useState<'intro' | 'meanings' | 'learning'>();

  if (!currentWord) throw new Error('Word not found');

  return (
    <div className="flex flex-col w-[400px]">
      <div className="font-semibold text-xl text-white">
        {currentWord.title}
      </div>
      <div className="text-purple-200">
        <div>{currentWord.useCases[0]?.title}</div>
        {currentWord.useCases[0]?.sentences[0]?.content.replace(
          new RegExp(currentWord.title, 'gi'),
          '_'.repeat(currentWord.title.length)
        )}
      </div>
    </div>
  );
}
