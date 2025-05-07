import { currentUser } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { addWordSchema } from "@/components/AddWordButton/addWord.zod";
import { genMeaningsWithSentencesAction } from "@/services/genMeaningsWithSentences/genMeaningsWithSentences.action";

export type AddWordRouteResponse = {
  status: 200 | 500;
  message: string;
};

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/meaning-and-sentences runs");
    const body = addWordSchema.parse(await req.json());

    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { message: "You are not authorized to use this endpoint" },
        {
          status: 401,
        }
      );
    }

    const res = await genMeaningsWithSentencesAction(body.word);

    console.log(res);

    // const payload = (await req.json()) as QueryResourcePriceArgs;
    // let response = await queryResourcePriceService(payload, accessToken, logger);

    return NextResponse.json(
      { message: "Word created successfully", data: res },
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
