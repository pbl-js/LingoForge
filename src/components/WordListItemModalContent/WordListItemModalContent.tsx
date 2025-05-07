"use client";
import React, { useEffect, useState, useTransition } from "react";
import { WordDetailsHeader } from "@/components/WordDetailsHeader/WordDetailsHeader";
import { getMatchTranslation } from "@/lib/getMatchTranslation";
import { SentenceItem } from "@/components/SentenceItem/SentenceItem";
import { FloatingSelectionBar } from "@/components/FloatingSelectionBar/FloatingSelectionBar";
import { Loader } from "lucide-react";
import type { Word } from "@/db/getWordById";
import { NoWord } from "../NoWord/NoWord";

export type WordListItemModalContentProps = { wordId: number };

export const WordListItemModalContent = ({ wordId }: WordListItemModalContentProps) => {
  const [word, setWord] = useState<Word | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    startTransition(() => {
      fetch("/api/word-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId }),
      })
        .then(async (res) => {
          console.log("first");
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Failed to fetch word");
          }
          return res.json();
        })
        .then((data) => setWord(data.word))
        .catch((err) => setError(err.message));
    });
  }, [wordId]);

  if (isPending || !word) {
    return (
      <div className="flex min-h-[120px] w-full items-center justify-center">
        <Loader className="animate-spin text-purple-500" aria-label="Loading" />
      </div>
    );
  }

  if (error) return <div className="text-red-500">{error}</div>;
  if (!word) return <NoWord />;

  const { content: wordTitle, audioUrl } = getMatchTranslation(word.translations, "EN");

  return (
    <div className="flex flex-col items-start gap-3">
      <WordDetailsHeader title={wordTitle} wordId={word.id} audioUrl={audioUrl || undefined} />
      <div className="flex w-full grow flex-col gap-3 rounded-xl bg-purple-900 p-3">
        {/* Display similar words */}
        {word.similarWords && word.similarWords.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 font-medium text-white">Similar Words</h3>
            <ul className="pl-4">
              {word.similarWords.map((similarWord) => (
                <li key={similarWord.id} className="list-inside list-disc text-sm text-gray-400">
                  {similarWord.translations.find((t) => t.language === "EN")?.content || "Unknown"}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Display use cases */}
        <div className="flex flex-col">
          {word.useCases.length === 0 ? (
            <p className="text-gray-400">
              No sentences generated yet. Click the button to generate some!
            </p>
          ) : (
            word.useCases.map((useCase) => (
              <div key={useCase.id} className="py-1 text-white">
                <h4>{getMatchTranslation(useCase.wordTranslations, "PL").content}</h4>
                {getMatchTranslation(useCase.titleTranslations, "EN").content}
                <p className="text-gray-400">
                  {getMatchTranslation(useCase.descriptionTranslations, "EN").content}
                </p>
                <ul className="mt-2 flex flex-col gap-1">
                  {useCase.sentences.map((sentence) => {
                    const translation = getMatchTranslation(sentence.translations, "EN");
                    return (
                      <SentenceItem key={sentence.id} id={sentence.id} translation={translation} />
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
      <FloatingSelectionBar />
    </div>
  );
};
