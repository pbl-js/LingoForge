import { getElevenLabsClient } from "@/lib/elevenLabs/getElevenLabsClient";
import { Translation } from "@prisma/client";
import internal from "stream";
import { Readable } from "stream";

const elevenLabs = getElevenLabsClient();

export interface TimestampData {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

export interface ElevenLabsTimestamps {
  // This is the primary timestamp data that maps each character in the original text to its precise start and end times in the generated audio.
  alignment: TimestampData;
  // Same as alignment, but more precised with things like pauses, intonations, etc.
  normalized_alignment?: TimestampData;
}

// These types have to be statically typed, because the ElevenLabs SDK has unknown types
interface ElevenLabsTimestampResponse {
  audio_base64: string;
  alignment: TimestampData;
  normalized_alignment?: TimestampData;
}

export const genAudioWithTimestampsForTranslation = async (translation: Translation) => {
  const response = (await elevenLabs.textToSpeech.convertWithTimestamps(
    "ThT5KcBeYPX3keUQqHPh", // Using "Bella" voice which has a happier tone
    {
      text: translation.content,
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.7, // Increases expressiveness for a happier tone
        use_speaker_boost: true,
      },
    }
  )) as ElevenLabsTimestampResponse;

  // Convert base64 to buffer and then to stream
  // Its to achieve consistency between convertWithTimestamps and convert
  const audioBuffer = Buffer.from(response.audio_base64, "base64");
  const audioStream = Readable.from(audioBuffer);

  return {
    audioStream,
    timestamps: {
      alignment: response.alignment,
      normalized_alignment: response.normalized_alignment,
    },
  };
};

export type AudioGenerationResult = {
  translation: Translation;
  audioStream: internal.Readable | null;
  timestamps?: ElevenLabsTimestamps;
  success: boolean;
  error?: unknown;
};

export const genAudioWithTimestampsForTranslations = async (
  translations: Translation[]
): Promise<AudioGenerationResult[]> => {
  console.log("genAudioWithTimestampsForTranslations runs");
  const audioPromises = translations.map((translation) =>
    genAudioWithTimestampsForTranslation(translation).then((result) => ({
      translation,
      audioStream: result.audioStream,
      timestamps: result.timestamps,
    }))
  );

  // Execute all promises in parallel and wait for all to settle (complete or fail)
  const results = await Promise.allSettled(audioPromises);

  // Convert the standardized results to our custom format
  return results.map((result, index) => {
    const translation = translations[index];

    if (!translation) {
      throw new Error("Translation not found");
    }

    if (result.status === "fulfilled") {
      return {
        translation,
        audioStream: result.value.audioStream,
        timestamps: result.value.timestamps,
        success: true,
      };
    } else {
      console.error(`Error generating audio for translation ${translation.id}:`, result.reason);
      return {
        translation,
        audioStream: null,
        success: false,
        error: result.reason,
      };
    }
  });
};
