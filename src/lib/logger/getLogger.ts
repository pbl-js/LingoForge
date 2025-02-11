import type { pino } from 'pino';
import { headers } from 'next/headers';
// import * as Sentry from '@sentry/nextjs';
// import { getAppVersion } from '@/utils/version/version';
import { logger } from './logger';
import { LoggerRoutesUnion } from './loggerRoutes';

type LoggerOptions = {
  source: LoggerRoutesUnion;
  [key: string]: unknown | undefined;
};

export type Logger = pino.Logger;

export const getLogger = async (
  options: LoggerOptions,
  renderLog?: boolean
) => {
  const headerList = await headers();
  console.log(headerList);
  const childLogger = logger.child({
    // locale: headerList.get('locale'),
    userId: headerList.get('oxla-org-id'),
    ...options,
  });

  if (renderLog) {
    childLogger.debug('Render');
  }

  return childLogger;
};

export const logError = (logger: Logger, msg: unknown) => {
  logger.error(msg);
  //   Sentry.captureException(msg);
};
