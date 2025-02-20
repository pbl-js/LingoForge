'use client';

import { routes } from '@/consts/routes';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import { deleteWordAction } from '@/actions/deleteWord';
import { useTransition } from 'react';

type WordListItemProps = {
  id: number;
  title: string;
};

export function WordListItem({ id, title }: WordListItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteWordAction(id);
      if (result.error) {
        console.error(result.error);
      }
    });
  };

  return (
    <div className="flex justify-between items-center py-3 px-5 pr-3 rounded-xl bg-purple-900 w-full">
      <Link
        href={routes.wordListDetails(id)}
        className="text-white hover:text-purple-300 transition-colors capitalize"
      >
        {title}
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="text-purple-300 hover:text-white hover:bg-purple-800 transition-colors"
        onClick={handleDelete}
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
