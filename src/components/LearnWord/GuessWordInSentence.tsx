import { WordForLearning } from '@/db/getWordsForLearning';
import React from 'react';

export function GuessWordInSentence({
  currentWord,
}: {
  currentWord: WordForLearning;
}) {
  const [correctAnswerId, setCorrectAnswerId] = React.useState<number | null>(
    null
  );

  function onClickAnswer(answerId: number) {
    // trigger callback
    setCorrectAnswerId(answerId);
  }

  const [answers, setAnswers] = React.useState<
    { id: number; content: string }[]
  >([]);

  // This effect is needed to prevent hydration error
  React.useEffect(() => {
    const shuffledSimilarWords = currentWord.similarWords
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
    <div className="flex flex-col w-[400px]">
      <div className="font-semibold text-xl text-white">
        {currentWord.title}
      </div>
      <div className="text-purple-200">
        <div>{currentWord.useCases[0]?.title}</div>
        {currentWord.useCases[0]?.sentences[0]?.name.replace(
          new RegExp(currentWord.title, 'gi'),
          '_'.repeat(currentWord.title.length)
        )}
        <div className="mt-4">
          <div className="flex flex-col gap-2">
            {answers.map((answer) => (
              <button
                onClick={() => onClickAnswer(answer.id)}
                key={answer.id}
                className={`w-full text-left px-4 py-2 text-sm ${
                  correctAnswerId === answer.id
                    ? isCorrect
                      ? 'bg-green-700 text-white'
                      : 'bg-red-700 text-white'
                    : 'text-purple-200 bg-purple-900 hover:bg-purple-800'
                } rounded-lg transition-colors`}
                disabled={correctAnswerId !== null}
              >
                {answer.content}
              </button>
            ))}
          </div>
          {correctAnswerId !== null && (
            <div className="mt-4 text-center">
              {isCorrect ? (
                <div className="text-green-400">Correct!</div>
              ) : (
                <div className="text-red-400">Incorrect. Try again!</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
