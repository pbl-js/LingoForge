"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import wretch from "wretch";
import { addWordSchema } from "./addWord.zod";
import { useRouter } from "next/navigation";
import { GenMeaningsWithSentences } from "@/services/genMeaningsWithSentences/genMeaningsWithSentences.ai";

export function AddWordButton({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof addWordSchema>>({
    resolver: zodResolver(addWordSchema),
    defaultValues: {
      word: "",
    },
  });

  //   form.formState.isLoading;
  async function onSubmit(values: z.infer<typeof addWordSchema>) {
    try {
      await wretch("/api/add-word").post(values).json();
    } catch (err) {
      console.log("Problem with creating word", err);
    } finally {
      router.refresh();
      setOpen(false);
    }
  }

  const word = form.watch("word");
  const [isLoading, setIsLoading] = React.useState(false);
  const [aiData, setAiData] = React.useState<GenMeaningsWithSentences | null>(null);
  console.log(aiData);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      if (word.length > 0) {
        setIsLoading(true);
        fetch("/api/meaning-and-sentences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word }),
        })
          .then(async (res) => {
            if (!res.ok) {
              const data = await res.json();
              throw new Error(data.message || "Failed to fetch word");
            }
            return res.json();
          })
          .then((data) => setAiData(data.data))
          .catch((err) => console.log(err.message))
          .finally(() => setIsLoading(false));
      }
    }, 400);
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [word]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{children}</Button>
      </DialogTrigger>
      <DialogContent variant="fullContent">
        <DialogHeader>
          <DialogTitle>Add new word</DialogTitle>
          <DialogDescription>You just need to add word. We will handle the rest.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="word"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Word</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" placeholder="Enter your word" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {(() => {
              if (isLoading) return <div>...Loading</div>;
              else if (aiData && aiData.isValidEnglishWord === false)
                return <div>This is not a valid english word</div>;
              else if (aiData)
                return (
                  <div className="flex flex-col gap-4">
                    To słowo ma więcej niż jedno znaczenie
                    {aiData.usagesList.map((item) => (
                      <div className="rounded-2xl bg-black/30" key={item.usageTitle.en}>
                        <div className="rounded-2xl bg-purple-900 p-3">
                          <h3 className="mb-1 font-semibold">
                            {item.usageTitle.en} | {item.usageTitle.pl}
                          </h3>
                          <p className="">{item.usageDescription.en}</p>
                        </div>
                        <ul className="p-3 text-muted-foreground">
                          {item.sentencesList.map((i) => (
                            <li className="italic" key={i.en}>{`"${i.en}"`}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                );
            })()}

            <Button
              size="lg"
              className="w-full font-bold"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "...Adding" : "ADD WORD"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
