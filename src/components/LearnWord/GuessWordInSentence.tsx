'use client';

import { AUDIO_SOUNDS } from '@/consts/game-config';
import { WordForLearning } from '@/db/getWordsForLearning';
import { cn } from '@/lib/utils';
import { getMatchTranslation } from '@/lib/getMatchTranslation';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function GuessWordInSentence({
  currentWord,
  nextRound,
}: {
  currentWord: WordForLearning;
  nextRound: () => void;
}) {
  const correctAnswerAudio = new Audio(AUDIO_SOUNDS.correctAnswer);
  const wrongAnswerAudio = new Audio(AUDIO_SOUNDS.wrongAnswer);

  // Get the English translation for the word title
  const { content: wordTitle, audioUrl } = getMatchTranslation(
    currentWord.translations,
    'EN'
  );

  const newWordAudio = audioUrl ? new Audio(audioUrl) : undefined;

  const [correctAnswerId, setCorrectAnswerId] = React.useState<number | null>(
    null
  );
  const [mistakeList, setMistakeList] = React.useState<number[]>([]);
  const [isExiting, setIsExiting] = React.useState(false);

  const handleAnswerClick = (answerId: number) => {
    const isCorrect = answerId === currentWord.id;

    if (isCorrect) {
      correctAnswerAudio.play();
      setCorrectAnswerId(answerId);
      setIsExiting(true);

      if (newWordAudio) {
        setTimeout(() => {
          newWordAudio?.play();
        }, 800);
      }

      setTimeout(() => {
        nextRound();
        setIsExiting(false);
      }, 2000);
    } else {
      wrongAnswerAudio.play();
      setMistakeList((prev) => [...prev, answerId]);
    }
  };

  const [answers, setAnswers] = React.useState<
    { id: number; content: string }[]
  >([]);

  // This effect is needed to prevent hydration error
  React.useEffect(() => {
    const shuffledSimilarWords = currentWord.similarWords
      .filter((word) => word.id !== currentWord.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const newAnswers = [
      ...shuffledSimilarWords.map((word) => ({
        id: word.id,
        content: getMatchTranslation(word.translations, 'EN').content,
      })),
      { id: currentWord.id, content: wordTitle },
    ].sort(() => Math.random() - 0.5);

    setAnswers(newAnswers);
    setCorrectAnswerId(null);
    setMistakeList([]);
    setIsExiting(false);
  }, [currentWord, wordTitle]);

  const isCorrect = correctAnswerId === currentWord.id;

  if (!currentWord.useCases[0]) throw new Error('No use case found');
  if (!currentWord.useCases[0].sentences[0])
    throw new Error('No use case found');

  // Get the use case title and sentence
  const useCaseTitle = getMatchTranslation(
    currentWord.useCases[0]?.titleTranslations,
    'EN'
  ).content;
  const sentenceText = getMatchTranslation(
    currentWord.useCases[0]?.sentences[0]?.translations,
    'EN'
  ).content;

  // Replace the word in the sentence with underscores
  const maskedSentence = sentenceText.replace(
    new RegExp(wordTitle, 'gi'),
    '_'.repeat(wordTitle.length)
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        when: 'beforeChildren',
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
        when: 'afterChildren',
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
        delay: i * 0.1,
      },
    }),
    exit: (i: number) => ({
      opacity: 0,
      y: -20,
      scale: 0.9,
      transition: {
        duration: 0.2,
        delay: i * 0.05,
      },
    }),
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center">
        <div className="font-semibold text-3xl text-white">{wordTitle}</div>
        <div className="text-purple-200">{useCaseTitle}</div>
      </div>

      <div className="text-white text-4xl font-medium grow">
        {maskedSentence}{' '}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          className="flex flex-col gap-3 mt-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isExiting ? 'exit' : 'visible'}
          key="answers-container"
        >
          {answers.map((answer, index) => (
            <motion.button
              onClick={() => handleAnswerClick(answer.id)}
              key={answer.id}
              custom={index}
              variants={itemVariants}
              whileHover={
                !mistakeList.includes(answer.id) ? { scale: 1.02 } : {}
              }
              whileTap={!mistakeList.includes(answer.id) ? { scale: 0.98 } : {}}
              className={cn(
                'w-full px-4 text-lg rounded-full transition-colors border-white border-2 font-medium text-center py-3 capitalize',
                correctAnswerId === answer.id
                  ? isCorrect
                    ? 'bg-green-700 text-white'
                    : 'bg-red-700 text-white'
                  : mistakeList.includes(answer.id)
                  ? 'bg-gray-700/30 text-white/50 border-white/50'
                  : 'text-white hover:bg-purple-300/5',
                mistakeList.includes(answer.id) && 'cursor-not-allowed'
              )}
              disabled={mistakeList.includes(answer.id)}
              aria-label={`Answer option: ${answer.content}`}
              tabIndex={mistakeList.includes(answer.id) ? -1 : 0}
              onKeyDown={(e) => {
                if (
                  (e.key === 'Enter' || e.key === ' ') &&
                  !mistakeList.includes(answer.id)
                ) {
                  handleAnswerClick(answer.id);
                }
              }}
            >
              {answer.content}
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
