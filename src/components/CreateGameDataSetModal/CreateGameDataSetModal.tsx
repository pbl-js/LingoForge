"use client";
import React from "react";
import { DialogTrigger } from "@/components/ui/dialog";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import { Word } from "@/db/getWords";
import { getMatchTranslation } from "@/lib/getMatchTranslation";
import { WordListItem } from "../WordList/WordListItem";

export const CreateGameDataSetModal = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="h-[100px] w-[150px] rounded-xl bg-purple-900 p-3 font-bold">
        Created by you
      </DialogTrigger>

      <DialogContent variant="fullContent">
        {open && <CreateGameDataSetModalContent />}
      </DialogContent>
    </Dialog>
  );
};

const CreateGameDataSetModalContent = () => {
  const [wordList, setWordList] = React.useState<Word[] | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(null);
    startTransition(() => {
      fetch("/api/word-list", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Failed to fetch word");
          }
          return res.json();
        })
        .then((data) => {
          return setWordList(data.wordList);
        })
        .catch((err) => setError(err.message));
    });
  }, []);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold capitalize">Words created by you</DialogTitle>
      </DialogHeader>
      {(() => {
        if (isPending) {
          return <div>Loading...</div>;
        }

        if (error) {
          return <div>{error}</div>;
        }

        if (!wordList) {
          return <div>No word list found</div>;
        }

        return (
          <div className="flex flex-col gap-3">
            {wordList.map((word) => {
              const { content } = getMatchTranslation(word.translations, "EN");
              return <WordListItem key={word.id} id={word.id} title={content} />;
            })}
          </div>
        );
      })()}
    </>
  );
};
