"use client";

import * as React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { routes } from "@/consts/routes";
import { cn } from "@/lib/utils";

const navigationItemStyle = cn(
  "group inline-flex h-10 w-full items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors",
  "bg-purple-900 text-white hover:bg-purple-800 hover:text-white",
  "focus:bg-purple-800 focus:text-white focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-2",
  "disabled:pointer-events-none disabled:opacity-50",
  "data-[active]:bg-purple-800 data-[state=open]:bg-purple-800"
);

export function MainNavigationMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-2">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={routes.topics} className={navigationItemStyle}>
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={routes.wordList} className={navigationItemStyle}>
              Words
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={routes.play} className={navigationItemStyle}>
              Play
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={routes.promptTester} className={navigationItemStyle}>
              Prompts
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem> */}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
