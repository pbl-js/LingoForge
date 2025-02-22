import { AUDIO_SOUNDS } from '@/consts/game-config';
import { WordForLearning } from '@/db/getWordsForLearning';
import { cn } from '@/lib/utils';
import React from 'react';

export function GuessWordInSentence({
  currentWord,
  nextRound,
}: {
  currentWord: WordForLearning;
  nextRound: () => void;
}) {
  const correctAnswerAudio = new Audio(AUDIO_SOUNDS.correctAnswer);
  const wrongAnswerAudio = new Audio(AUDIO_SOUNDS.wrongAnswer);
  const newWordAudio = currentWord.audioUrl
    ? new Audio(currentWord.audioUrl)
    : undefined;
  const [correctAnswerId, setCorrectAnswerId] = React.useState<number | null>(
    null
  );
  const [mistakeList, setMistakeList] = React.useState<number[]>([]);

  function onClickAnswer(answerId: number) {
    const isCorrect = answerId === currentWord.id;

    if (isCorrect) {
      correctAnswerAudio.play();
      setCorrectAnswerId(answerId);

      if (newWordAudio) {
        setTimeout(() => {
          newWordAudio?.play();
        }, 800);
      }

      setTimeout(() => {
        nextRound();
      }, 2000);
    } else {
      wrongAnswerAudio.play();
      setMistakeList((prev) => [...prev, answerId]);
    }
  }

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
        content: word.content,
      })),
      { id: currentWord.id, content: currentWord.title },
    ].sort(() => Math.random() - 0.5);

    setAnswers(newAnswers);
  }, [currentWord]);

  const isCorrect = correctAnswerId === currentWord.id;

  return (
    <div className="flex flex-col min-h-full max-w-[400px] mt-8 gap-8 grow">
      <div className="flex flex-col items-center">
        <div className="font-semibold text-3xl text-white">
          {currentWord.title}
        </div>
        <div className="text-purple-200">{currentWord.useCases[0]?.title}</div>
      </div>

      <div className="text-white text-4xl font-medium grow">
        {currentWord.useCases[0]?.sentences[0]?.name.replace(
          new RegExp(currentWord.title, 'gi'),
          '_'.repeat(currentWord.title.length)
        )}
      </div>
      <div className="">
        <div className="flex flex-col gap-3">
          {answers.map((answer) => (
            <button
              onClick={() => onClickAnswer(answer.id)}
              key={answer.id}
              className={cn(
                'w-full px-4 text-lg rounded-full transition-colors border-white border-2 font-medium text-center py-3 capitalize',
                correctAnswerId === answer.id
                  ? isCorrect
                    ? 'bg-green-700 text-white'
                    : 'bg-red-700 text-white'
                  : 'text-white hover:bg-purple-300/5',
                'disabled:opacity-50 disabled:cursor-not-allowed' // Added styles for disabled status
              )}
              disabled={mistakeList.includes(answer.id)}
            >
              {answer.content}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
