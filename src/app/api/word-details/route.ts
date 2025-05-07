import { currentUser } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getWordById } from "@/db/getWordById";
import { getWords } from "@/db/getWords";

export async function POST(req: NextRequest) {
  try {
    const { wordId } = await req.json();
    if (!wordId) {
      return NextResponse.json({ message: "Missing wordId" }, { status: 400 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }

    const prisma = new PrismaClient();
    let word;
    if (!wordId) {
      const words = await getWords(prisma, { userId: user.id });
      if (words.length === 0 || !words[0]) {
        return NextResponse.json({ message: "No words found" }, { status: 404 });
      }
      word = await getWordById(prisma, {
        userId: user.id,
        wordId: words[0].id,
      });
    } else {
      word = await getWordById(prisma, {
        userId: user.id,
        wordId,
      });
    }

    if (!word) {
      return NextResponse.json({ message: "Word not found" }, { status: 404 });
    }

    return NextResponse.json({ word }, { status: 200 });
  } catch (err) {
    console.error("POST /api/getMeaningsAndSentences", err);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
