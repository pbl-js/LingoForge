'use client';

import React from 'react';
import { WordForLearning } from '@/db/getWordsForLearning';
import { getMatchTranslation } from '@/lib/getMatchTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check, X } from 'lucide-react';

export function MeaningIntroduction({
  currentWord,
  nextRound,
}: {
  currentWord: WordForLearning;
  nextRound: () => void;
}) {
  const [isExiting, setIsExiting] = React.useState(false);

  // Get the English translation for the word title
  const { content: wordTitle } = getMatchTranslation(
    currentWord.translations,
    'EN'
  );

  // Get the first useCase if available
  const firstUseCase = currentWord.useCases[0];

  if (!firstUseCase) {
    throw new Error('No use case found for this word');
  }

  // Get the title and description of the first useCase
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

    // Add logic here to track user's response if needed
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
          className="w-full max-w-md mx-auto"
        >
          <Card className="border shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                {wordTitle}
              </CardTitle>
              <CardDescription className="text-center text-lg">
                {useCaseTitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">{useCaseDescription}</p>
            </CardContent>
            <CardFooter className="flex justify-between gap-4">
              <Button
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => handleResponse(false)}
              >
                <X className="h-5 w-5" />
                <span>Skip</span>
              </Button>
              <Button
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => handleResponse(true)}
              >
                <Check className="h-5 w-5" />
                <span>Learn</span>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
