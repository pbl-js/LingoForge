import { currentUser } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export type AddWordRouteResponse = {
  status: 200 | 500;
  message: string;
};

export const addWordSchema = z.object({
  word: z.string().min(2, {
    message: 'Word must be at least 2 characters.',
  }),
});

export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/add-word runs');

    const body = addWordSchema.parse(await req.json());

    console.log('body: ', body);
    // const user = await currentUser();

    // const payload = (await req.json()) as QueryResourcePriceArgs;
    // let response = await queryResourcePriceService(payload, accessToken, logger);

    return NextResponse.json(
      { message: 'Word created successfully' },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.log('POST /api/add-word', err);

    return NextResponse.json(
      { message: 'Something went wrong' },
      {
        status: 500,
      }
    );
  }
}
