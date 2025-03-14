import { currentUser } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { addWordSchema } from "@/components/AddWordButton/addWord.zod";

export type AddWordRouteResponse = {
  status: 200 | 500;
  message: string;
};

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/add-word runs");
    const body = addWordSchema.parse(await req.json());

    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        {
          status: 400,
        }
      );
    }

    const prisma = new PrismaClient();

    // Check if word already exists by looking for a word with the same English translation
    const existingWord = await prisma.word.findFirst({
      where: {
        userId: user.id,
        translations: {
          some: {
            language: "EN",
            content: body.word,
          },
        },
      },
    });

    if (existingWord) {
      return NextResponse.json(
        { message: "Word already created" },
        {
          status: 400,
        }
      );
    }

    // Create a new word with an English translation
    await prisma.word.create({
      data: {
        userId: user.id,
        translations: {
          create: [
            {
              language: "EN",
              content: body.word,
            },
          ],
        },
      },
    });

    // const payload = (await req.json()) as QueryResourcePriceArgs;
    // let response = await queryResourcePriceService(payload, accessToken, logger);

    return NextResponse.json(
      { message: "Word created successfully" },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.log("POST /api/add-word", err);

    return NextResponse.json(
      { message: "Something went wrong" },
      {
        status: 500,
      }
    );
  }
}
