import { currentUser } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { addWordSchema } from '@/components/AddWordButton/addWord.zod';

export type AddWordRouteResponse = {
  status: 200 | 500;
  message: string;
};

export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/delete-word runs');
    const body = addWordSchema.parse(await req.json());

    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        {
          status: 400,
        }
      );
    }

    const prisma = new PrismaClient();
    const word = await prisma.word.findFirst({
      where: { title: body.word, userId: user.id },
    });

    if (word) {
      return NextResponse.json(
        { message: 'Word already created' },
        {
          status: 400,
        }
      );
    }

    await prisma.word.create({
      data: {
        title: body.word,
        userId: user.id,
      },
    });

    // const payload = (await req.json()) as QueryResourcePriceArgs;
    // let response = await queryResourcePriceService(payload, accessToken, logger);

    return NextResponse.json(
      { message: 'Word created successfully' },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.log('POST /api/delete-word', err);

    return NextResponse.json(
      { message: 'Something went wrong' },
      {
        status: 500,
      }
    );
  }
}
