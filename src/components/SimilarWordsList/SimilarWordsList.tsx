import React from "react";
import Link from "next/link";
import { SimilarWord, Translation } from "@prisma/client";

type SimilarWordWithTranslations = SimilarWord & {
  translations: Translation[];
};

type SimilarWordsListProps = {
  similarWords: SimilarWordWithTranslations[];
};

export const SimilarWordsList = ({ similarWords }: SimilarWordsListProps) => {
  if (!similarWords || similarWords.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <h3 className="mb-2 font-medium text-white">Similar Words</h3>
      <ul className="pl-4">
        {similarWords.map((similarWord) => (
          <li key={similarWord.id} className="list-inside list-disc text-sm text-gray-400">
            <Link
              href={`/word-list/${similarWord.id}`}
              className="transition-colors hover:text-gray-200"
            >
              {similarWord.translations.find((t) => t.language === "EN")?.content || "Unknown"}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
