"use client";

import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { deleteWordAction } from "@/actions/deleteWord";
import { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

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
    <Dialog>
      <div className="relative w-full md:w-auto">
        <DialogTrigger className="group flex w-full items-center justify-between gap-3 rounded-xl bg-purple-900 px-5 py-4 pr-[60px] md:w-auto">
          <div className="capitalize text-white transition-colors group-hover:text-purple-300">
            {title}
          </div>
        </DialogTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 text-purple-300 transition-colors hover:bg-purple-800 hover:text-white"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new word</DialogTitle>
          <DialogDescription>
            You just need to add a word. We will handle the rest.
          </DialogDescription>
        </DialogHeader>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
        <div>fsdfsdfsdfsdfsdf</div>
      </DialogContent>
    </Dialog>
  );
}
