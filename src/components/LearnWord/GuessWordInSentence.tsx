'use client';

import { AUDIO_SOUNDS } from '@/consts/game-config';
import { WordForLearning } from '@/db/getWordsForLearning';
import { cn } from '@/lib/utils';
import { getMatchTranslation } from '@/lib/getMatchTranslation';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KaraokeText } from '@/components/KaraokeText/KaraokeText';
import { WavyText } from '@/components/WavyText/WavyText';

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

  // Get the sentence audio and timestamps
  const [sentenceAudio, setSentenceAudio] =
    React.useState<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isPlayingSentence, setIsPlayingSentence] = React.useState(false);
  const [timestamps, setTimestamps] = React.useState<any>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const [correctAnswerId, setCorrectAnswerId] = React.useState<number | null>(
    null
  );
  const [mistakeList, setMistakeList] = React.useState<number[]>([]);
  const [isExiting, setIsExiting] = React.useState(false);
  const [showKaraoke, setShowKaraoke] = React.useState(false);
  const [showWavySentence, setShowWavySentence] = React.useState(false);

  const handleTimeUpdate = React.useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleAudioEnded = React.useCallback(() => {
    setIsPlayingSentence(false);
    setCurrentTime(0);

    // Hide karaoke
    setShowKaraoke(false);

    // Proceed to next round after audio ends
    setTimeout(() => {
      setIsExiting(true);

      // Remove the wavy title hiding code
      setTimeout(() => {
        nextRound();
        setIsExiting(false);
      }, 1000);
    }, 500);
  }, [nextRound]);

  const handleAnswerClick = (answerId: number) => {
    const isCorrect = answerId === currentWord.id;

    if (isCorrect) {
      correctAnswerAudio.play();
      setCorrectAnswerId(answerId);

      // Hide wavy sentence to prepare for karaoke
      setShowWavySentence(false);

      // Show karaoke after correct answer
      setTimeout(() => {
        setShowKaraoke(true);
      }, 300);

      // Play sentence audio after a short delay
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current
            .play()
            .then(() => setIsPlayingSentence(true))
            .catch((err) =>
              console.error('Error playing sentence audio:', err)
            );
        }
      }, 800);
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

    // Remove wavy title animation setup
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
        setSentenceAudio(audio);

        // Set up event listeners
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleAudioEnded);
      }

      // Parse timestamps if available
      if (sentenceTranslation.timestampsJson) {
        try {
          const parsedTimestamps = JSON.parse(
            sentenceTranslation.timestampsJson
          );
          setTimestamps(parsedTimestamps);
        } catch (error) {
          console.error('Error parsing timestamps:', error);
        }
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
        {showKaraoke && timestamps?.alignment ? (
          <KaraokeText
            text={sentenceText}
            timestamps={timestamps.alignment}
            isPlaying={isPlayingSentence}
            currentTime={currentTime}
            highlightColor="text-green-400"
            maxScaleFactor={1.3}
          />
        ) : (
          <AnimatePresence mode="wait">
            <WavyText
              text={maskedSentence}
              isAnimating={showWavySentence}
              delay={0.0}
              duration={0.01}
              className="text-white text-4xl font-medium"
            />
          </AnimatePresence>
        )}
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
      </AnimatePresence>
    </div>
  );
}
