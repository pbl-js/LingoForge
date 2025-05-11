"use server";

import { getWords, Word } from "@/db/getWords";
import { currentUser, User } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export type WordListResponse = NextResponse<{ wordList: Word[] }>;

export const GET = async (): Promise<WordListResponse> => {
  const user = (await currentUser()) as User;

  const prisma = new PrismaClient();
  const wordList = await getWords(prisma, { userId: user.id });

  return NextResponse.json({ wordList }, { status: 200 });
};
