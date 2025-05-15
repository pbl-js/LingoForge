import { ElevenLabsTimestamps } from "@/services/genAudioForTranslation/types";
import { z } from "zod";

type ParseResult =
  | { success: true; data: ElevenLabsTimestamps }
  | { success: false; error: string };

export function parseTimestampsJson(timestamps: string): ParseResult {
  try {
    const timestampsJson = JSON.parse(timestamps);

    if (!timestampsJson) {
      return {
        success: false,
        error: "Invalid timestamps: Empty or null JSON",
      };
    }

    const timestampDataSchema = z.object({
      characters: z.array(z.string()),
      character_start_times_seconds: z.array(z.number()),
      character_end_times_seconds: z.array(z.number()),
    });

    const parsedTimestamps = z
      .object({
        alignment: timestampDataSchema,
        normalized_alignment: timestampDataSchema.optional(),
      })
      .parse(timestampsJson) satisfies ElevenLabsTimestamps;
    console.log("parsedTimestamps", parsedTimestamps);
    return { success: true, data: parsedTimestamps };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Invalid timestamps format: ${error.message}`,
      };
    } else if (error instanceof SyntaxError) {
      return { success: false, error: `Invalid JSON: ${error.message}` };
    } else if (error instanceof Error) {
      return { success: false, error: error.message };
    } else {
      return {
        success: false,
        error: `Failed to parse timestamps: ${String(error)}`,
      };
    }
  }
}
