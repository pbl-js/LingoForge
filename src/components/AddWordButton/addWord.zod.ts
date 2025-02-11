import { z } from 'zod';

export const addWordSchema = z.object({
  word: z.string().min(2, {
    message: 'Word must be at least 2 characters.',
  }),
});
