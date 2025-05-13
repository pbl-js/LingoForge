import { currentUser } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const schema = z.object({
      words: z.array(z.number()),
    });
    const parseResult = schema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: parseResult.error.issues },
        { status: 400 }
      );
    }
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }
    // Placeholder response, update with actual logic as needed
    // return NextResponse.json({ message: "Validated and user found" }, { status: 200 });

    const { words: wordsId } = parseResult.data;

    const prisma = new PrismaClient();
    const words = await prisma.word.findMany({
      where: { userId: user.id, id: { in: wordsId } },
      include: {
        translations: true,
        useCases: { include: { sentences: { include: { translations: true } } } },
      },
    });

    console.log(words);

    // return NextResponse.json({ word }, { status: 200 });
  } catch (err) {
    console.error("POST /api/game-data-set", err);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
