'use client';

import React from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { AddWordRouteResponse, addWordSchema } from '@/app/api/add-word/route';
import wretch from 'wretch';

export function AddWordButton({ children }: { children: React.ReactNode }) {
  const form = useForm<z.infer<typeof addWordSchema>>({
    resolver: zodResolver(addWordSchema),
    defaultValues: {
      word: '',
    },
  });

  //   form.formState.isLoading;
  async function onSubmit(values: z.infer<typeof addWordSchema>) {
    try {
      await wretch('/api/add-word').post(values).json();
    } catch (err) {
      console.log('Problem with creating word', err);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{children}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new word</DialogTitle>
          <DialogDescription>
            You just need to add word. We will handle the rest.
          </DialogDescription>
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
                    <Input placeholder="Enter your word" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isLoading}>
              {form.formState.isLoading ? '...Adding' : 'Add word'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
