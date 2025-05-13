"use client";
import React from "react";
import { DialogTrigger } from "@/components/ui/dialog";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import { getMatchTranslation } from "@/lib/getMatchTranslation";
import { WordListItem } from "../WordList/WordListItem";
import { useMutation, useQuery } from "@tanstack/react-query";
import { WordListResponse } from "@/app/api/word-list/route";
import { Button } from "../ui/button";

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
  const { data, isPending, error } = useQuery<WordListResponse>({
    queryKey: ["word-list"],
    queryFn: () => fetch("/api/word-list").then((res) => res.json()),
  });

  const wordsIdToLearn = data?.wordList.map((word) => word.id);

  const {
    mutate: createGameDataSet,
    // data: gameDataSet,
    isPending: isCreatingGameDataSet,
  } = useMutation({
    mutationFn: () =>
      fetch("/api/game-data-set", {
        method: "POST",
        body: JSON.stringify({ words: wordsIdToLearn }),
      }),
  });
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
          return <div>{error.message}</div>;
        }

        if (!data || data.wordList.length === 0) {
          return <div>No word list found</div>;
        }

        return (
          <div className="flex h-full flex-col gap-3">
            {data.wordList.map((word) => {
              const { content } = getMatchTranslation(word.translations, "EN");
              return <WordListItem key={word.id} id={word.id} title={content} />;
            })}
            <Button className="mt-auto" onClick={() => createGameDataSet()}>
              {isCreatingGameDataSet
                ? "Creating..."
                : `Start Learning (${data.wordList.length} words)`}
            </Button>
          </div>
        );
      })()}
    </>
  );
};
