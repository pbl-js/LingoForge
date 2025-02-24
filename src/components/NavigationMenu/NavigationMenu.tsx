'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { routes } from '@/consts/routes';
import { cn } from '@/lib/utils';

const navigationItemStyle = cn(
  'group inline-flex h-10 w-full items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors',
  'bg-purple-900 text-white hover:bg-purple-800 hover:text-white',
  'focus:bg-purple-800 focus:text-white focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-50',
  'data-[active]:bg-purple-800 data-[state=open]:bg-purple-800'
);

export function MainNavigationMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-2">
        <NavigationMenuItem>
          <NavigationMenuTrigger className={navigationItemStyle}>
            Words
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 bg-purple-900 rounded-md">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-purple-800/50 to-purple-800 p-6 no-underline outline-none focus:shadow-md hover:bg-purple-700"
                    href={routes.wordList}
                  >
                    <div className="mb-2 mt-4 text-lg font-medium text-white">
                      Word List
                    </div>
                    <p className="text-sm leading-tight text-white/90">
                      View and manage your collection of words and their use
                      cases.
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={routes.promptTester} className={navigationItemStyle}>
              Prompts
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={routes.learn} className={navigationItemStyle}>
              Learn
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
