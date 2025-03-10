'use client';

import React from 'react';
import { WordForLearning } from '@/db/getWordsForLearning';
import { getMatchTranslation } from '@/lib/getMatchTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

export function MeaningIntroduction({
  currentWord,
  nextRound,
}: {
  currentWord: WordForLearning;
  nextRound: () => void;
}) {
  const [isExiting, setIsExiting] = React.useState(false);

  const { content: wordTitle } = getMatchTranslation(
    currentWord.translations,
    'EN'
  );

  // Get the first useCase if available
  const firstUseCase = currentWord.useCases[0];

  if (!firstUseCase) {
    throw new Error('No use case found for this word');
  }

  const useCaseTitle = getMatchTranslation(
    firstUseCase.titleTranslations,
    'PL'
  ).content;

  const useCaseDescription = getMatchTranslation(
    firstUseCase.descriptionTranslations,
    'PL'
  ).content;

  const handleResponse = (wantsToLearn: boolean) => {
    setIsExiting(true);

    console.log(
      `User ${
        wantsToLearn ? 'wants' : 'does not want'
      } to learn the word: ${wordTitle}`
    );

    setTimeout(() => {
      nextRound();
      setIsExiting(false);
    }, 300);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {!isExiting && (
        <motion.div
          key={currentWord.id}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-md mx-auto flex flex-col h-full px-4"
        >
          <h1 className="text-3xl font-bold text-center text-white mb-5">
            {wordTitle}
          </h1>
          <div className="flex flex-col flex-1 bg-black/20 border-none rounded-2xl mb-4 p-4">
            <div className="text-center text-white text-xl font-medium">
              {useCaseTitle}
            </div>
            <div className="border-t border-white/15 my-4" />
            <p className="text-center mb-4 text-white/80">
              {useCaseDescription}
            </p>
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
