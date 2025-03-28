import React from "react";
import { currentUser, User } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { getWordById } from "@/db/getWordById";
import { getWords } from "@/db/getWords";
import { NoWord } from "./NoWord";
import { WordDetailsHeader } from "@/components/WordDetailsHeader/WordDetailsHeader";
import { getMatchTranslation } from "@/lib/getMatchTranslation";
import { SentenceItem } from "@/components/SentenceItem/SentenceItem";
import { FloatingSelectionBar } from "@/components/FloatingSelectionBar/FloatingSelectionBar";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ ["word-id"]: number }> }) {
  const routeParams = await params;

  const user = (await currentUser()) as User;
  const prisma = new PrismaClient();

  const word = await (async () => {
    if (!routeParams["word-id"]) {
      const words = await getWords(prisma, { userId: user.id });
      if (words.length === 0 || !words[0]) {
        return null;
      }

      const word = await getWordById(prisma, {
        userId: user.id,
        wordId: words[0].id,
      });

      return word;
    }

    const word = await getWordById(prisma, {
      userId: user.id,
      wordId: Number(routeParams["word-id"]),
    });

    return word;
  })();

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
}
