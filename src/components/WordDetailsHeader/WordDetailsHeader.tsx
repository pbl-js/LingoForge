'use client';
import { GenerateSentenceButton } from '../GenerateSentenceButton/GenerateSentenceButton';
import React from 'react';

type WordDetailsHeaderProps = {
  title: string;
  wordId: number;
};

export function WordDetailsHeader({ title, wordId }: WordDetailsHeaderProps) {
  return (
    <div className="flex w-full justify-between min-h-[40px]">
      <h1 className="text-2xl font-bold text-center text-white">{title}</h1>
      <GenerateSentenceButton wordId={wordId} />
    </div>
  );
}
