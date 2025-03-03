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

  // Get the English translation for the word title
  const wordTitle =
    currentWord.translations.find((t) => t.language === 'EN')?.content ||
    'Untitled';

  // Find audio URL in translations
  const audioTranslation = currentWord.translations.find(
    (t) => t.language === 'EN'
  );
  const newWordAudio = audioTranslation?.audioUrl
    ? new Audio(audioTranslation.audioUrl)
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
        content:
          word.translations.find((t) => t.language === 'EN')?.content ||
          'Unknown',
      })),
      { id: currentWord.id, content: wordTitle },
    ].sort(() => Math.random() - 0.5);

    setAnswers(newAnswers);
  }, [currentWord, wordTitle]);

  const isCorrect = correctAnswerId === currentWord.id;

  // Get the use case title and sentence
  const useCaseTitle =
    currentWord.useCases[0]?.titleTranslations.find((t) => t.language === 'EN')
      ?.content || '';
  const sentenceText =
    currentWord.useCases[0]?.sentences[0]?.translations.find(
      (t) => t.language === 'EN'
    )?.content || '';

  // Replace the word in the sentence with underscores
  const maskedSentence = sentenceText.replace(
    new RegExp(wordTitle, 'gi'),
    '_'.repeat(wordTitle.length)
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center">
        <div className="font-semibold text-3xl text-white">{wordTitle}</div>
        <div className="text-purple-200">{useCaseTitle}</div>
      </div>

      <div className="text-white text-4xl font-medium grow">
        {maskedSentence}{' '}
      </div>

      <div className="flex flex-col gap-3 mt-auto">
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
  );
}
