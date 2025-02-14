import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

export type PrismaInstance = PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  DefaultArgs
>;
