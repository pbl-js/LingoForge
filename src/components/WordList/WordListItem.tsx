"use client";

import { routes } from "@/consts/routes";
import Link from "next/link";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { deleteWordAction } from "@/actions/deleteWord";
import { useTransition } from "react";

type WordListItemProps = {
  id: number;
  title: string;
};

export function WordListItem({ id, title }: WordListItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteWordAction(id);
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <div className="flex w-full items-center justify-between rounded-xl bg-purple-900 px-5 py-3 pr-3">
      <Link
        href={routes.wordListDetails(id)}
        className="capitalize text-white transition-colors hover:text-purple-300"
      >
        {title}
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="text-purple-300 transition-colors hover:bg-purple-800 hover:text-white"
        onClick={handleDelete}
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
