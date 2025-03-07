'use client';

import { AUDIO_SOUNDS } from '@/consts/game-config';
import { WordForLearning } from '@/db/getWordsForLearning';
import { cn } from '@/lib/utils';
import { getMatchTranslation } from '@/lib/getMatchTranslation';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KaraokeText } from '@/components/KaraokeText/KaraokeText';
import { WavyText } from '@/components/WavyText/WavyText';
import { Check } from 'lucide-react';
import { parseTimestampsJson } from '@/lib/parseTimestampsJson';
import { ElevenLabsTimestamps } from '@/services/genAudioForTranslation/genAudioWithTimestampsForTranslation';

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
  const { content: wordTitle } = getMatchTranslation(
    currentWord.translations,
    'EN'
  );

  // Get the sentence audio and timestamps
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isPlayingSentence, setIsPlayingSentence] = React.useState(false);
  const [timestamps, setTimestamps] =
    React.useState<ElevenLabsTimestamps | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const [correctAnswerId, setCorrectAnswerId] = React.useState<number | null>(
    null
  );
  const [mistakeList, setMistakeList] = React.useState<number[]>([]);
  const [isExiting, setIsExiting] = React.useState(false);
  const [showKaraoke, setShowKaraoke] = React.useState(false);
  const [showWavySentence, setShowWavySentence] = React.useState(false);
  const [showCheckmark, setShowCheckmark] = React.useState(false);
  const [gamePhase, setGamePhase] = React.useState<
    'question' | 'checkmark' | 'karaoke' | 'transition'
  >('question');

  const handleTimeUpdate = React.useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleAudioEnded = React.useCallback(() => {
    setIsPlayingSentence(false);
    setCurrentTime(0);

    // Hide karaoke and transition to next round
    setGamePhase('transition');
    setIsExiting(true);

    setTimeout(() => {
      nextRound();
      setIsExiting(false);
      setGamePhase('question');
    }, 1000);
  }, [nextRound]);

  const handleAnswerClick = (answerId: number) => {
    const isCorrect = answerId === currentWord.id;

    if (isCorrect) {
      correctAnswerAudio.play();
      setCorrectAnswerId(answerId);

      // Start the transition sequence - immediately begin exit animations
      setIsExiting(true);

      // Use a much shorter timeout to ensure elements are hidden before checkmark appears
      setTimeout(() => {
        // First completely hide the question phase
        setGamePhase('checkmark');
        setShowCheckmark(true);

        // After checkmark animation, show karaoke
        setTimeout(() => {
          setGamePhase('karaoke');
          setShowKaraoke(true);

          // Play sentence audio
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current
              .play()
              .then(() => setIsPlayingSentence(true))
              .catch((err) =>
                console.error('Error playing sentence audio:', err)
              );
          }
        }, 1500); // Time for checkmark to display
      }, 200); // Much shorter time for exit animations
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
    setShowKaraoke(false);
    setIsPlayingSentence(false);
    setCurrentTime(0);
    setShowCheckmark(false);
    setGamePhase('question');
    setShowWavySentence(false);

    setTimeout(() => {
      setShowWavySentence(true);
    }, 300);

    // Reset audio state
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.removeEventListener('ended', handleAudioEnded);
      audioRef.current = null;
    }

    // Get sentence audio and timestamps if available
    if (currentWord.useCases[0]?.sentences[0]) {
      const sentenceTranslation = getMatchTranslation(
        currentWord.useCases[0].sentences[0].translations,
        'EN'
      );

      if (sentenceTranslation.audioUrl) {
        const audio = new Audio(sentenceTranslation.audioUrl);
        audioRef.current = audio;

        // Set up event listeners
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleAudioEnded);
      }

      // Parse timestamps if available
      if (sentenceTranslation.timestampsJson) {
        const result = parseTimestampsJson(sentenceTranslation.timestampsJson);

        if (!result.success) throw new Error(result.error);

        setTimestamps(result.data);
      }
    }

    return () => {
      // Clean up audio resources
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handleAudioEnded);
      }
    };
  }, [currentWord, wordTitle, handleTimeUpdate, handleAudioEnded]);

  const isCorrect = correctAnswerId === currentWord.id;

  if (!currentWord.useCases[0]) throw new Error('No use case found');
  if (!currentWord.useCases[0].sentences[0])
    throw new Error('No use case found');

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
        duration: 0.25, // Slightly longer for smoother exit
        when: 'beforeChildren',
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
      y: -10, // Less movement on exit
      scale: 0.95, // Less scaling on exit
      transition: {
        duration: 0.25, // Slightly longer for smoother exit
        delay: i * 0.03, // Smaller delay for faster overall exit
      },
    }),
  };

  // Checkmark animation variants
  const checkmarkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="flex flex-col h-full relative">
      <AnimatePresence mode="wait">
        {gamePhase === 'checkmark' && showCheckmark && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-10"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={checkmarkVariants}
            key="checkmark"
          >
            <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center">
              <Check className="h-20 w-20 text-green-500" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {(gamePhase === 'question' || gamePhase === 'transition') && (
          <motion.div
            className="flex flex-col h-full"
            initial="hidden"
            animate={isExiting ? 'exit' : 'visible'}
            exit="exit"
            variants={containerVariants}
            key="question-phase"
          >
            <div className="flex flex-col text-white text-4xl font-medium grow items-center">
              <AnimatePresence mode="wait">
                <WavyText
                  text={maskedSentence}
                  isAnimating={showWavySentence && !isExiting}
                  delay={0.0}
                  duration={0.01}
                  className="text-white text-4xl font-medium"
                />
              </AnimatePresence>
            </div>

            <motion.div
              className="flex flex-col gap-3 mt-auto"
              variants={containerVariants}
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
                  whileTap={
                    !mistakeList.includes(answer.id) ? { scale: 0.98 } : {}
                  }
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
                  disabled={mistakeList.includes(answer.id) || showKaraoke}
                  aria-label={`Answer option: ${answer.content}`}
                  tabIndex={mistakeList.includes(answer.id) ? -1 : 0}
                  onKeyDown={(e) => {
                    if (
                      (e.key === 'Enter' || e.key === ' ') &&
                      !mistakeList.includes(answer.id) &&
                      !showKaraoke
                    ) {
                      handleAnswerClick(answer.id);
                    }
                  }}
                >
                  {answer.content}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}

        {gamePhase === 'karaoke' && (
          <motion.div
            className="flex flex-col h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="karaoke-phase"
          >
            <div className="text-white text-4xl font-medium grow flex items-center justify-center">
              {timestamps?.normalized_alignment || timestamps?.alignment ? (
                <KaraokeText
                  text={sentenceText}
                  timestamps={
                    timestamps.normalized_alignment || timestamps.alignment
                  }
                  isPlaying={isPlayingSentence}
                  currentTime={currentTime}
                  highlightColor="text-green-400"
                />
              ) : (
                <div>{sentenceText}</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
