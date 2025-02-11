import pino from 'pino';
import pretty from 'pino-pretty';

const isProd = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || 'info';

export const emptyLogger = pino({
  enabled: false,
});

const logger = isProd
  ? pino(
      {
        level: logLevel,
        redact: [],
      },
      pino.destination()
    )
  : pino({ level: logLevel }, pretty());

export { logger };
