import { buttonVariants } from '@/components/ui/button';
import { routes } from '@/consts/routes';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

export default function Page() {
  return (
    <Link
      href={routes.wordList}
      className={cn(buttonVariants({ variant: 'outline' }), 'mx-auto')}
    >
      Click here
    </Link>
  );
}
