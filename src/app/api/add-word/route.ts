import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  //   const logger = getLogger({ source: loggerRoutes.queryMetricEndpoint });
  //   const { accessToken } = await assertSession(logger);

  try {
    // const payload = (await req.json()) as QueryResourcePriceArgs;
    // let response = await queryResourcePriceService(payload, accessToken, logger);

    return NextResponse.json(response, {
      status: 200,
    });
  } catch (error) {
    // logError(logger, error);

    return NextResponse.json(
      { message: 'Something went wrong' },
      {
        status: 500,
      }
    );
  }
}
