import { getElevenLabsClient } from '@/lib/elevenLabs/getElevenLabsClient';
import { Translation } from '@prisma/client';
import internal from 'stream';

const elevenLabs = getElevenLabsClient();

export const genAudioForTranslation = async (translation: Translation) => {
  // Add ElevenLabs audio generation
  const audioStream = await elevenLabs.textToSpeech.convert(
    'ThT5KcBeYPX3keUQqHPh', // Using "Bella" voice which has a happier tone
    {
      text: translation.content,
      model_id: 'eleven_multilingual_v2',
      output_format: 'mp3_44100_128',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.7, // Increases expressiveness for a happier tone
        use_speaker_boost: true,
      },
    }
  );

  return audioStream;
};

export type AudioGenerationResult = {
  translation: Translation;
  audioStream: internal.Readable | null;
  success: boolean;
  error?: unknown;
};

export const genAudioForTranslations = async (
  translations: Translation[]
): Promise<AudioGenerationResult[]> => {
  // Create an array of promises for each translation
  const audioPromises = translations.map((translation) =>
    genAudioForTranslation(translation).then((audioStream) => ({
      translation,
      audioStream,
    }))
  );

  // Execute all promises in parallel and wait for all to settle (complete or fail)
  const results = await Promise.allSettled(audioPromises);

  // Convert the standardized results to our custom format
  return results.map((result, index) => {
    const translation = translations[index];

    if (!translation) {
      throw new Error('Translation not found');
    }

    if (result.status === 'fulfilled') {
      return {
        translation,
        audioStream: result.value.audioStream,
        success: true,
      };
    } else {
      console.error(
        `Error generating audio for translation ${translation.id}:`,
        result.reason
      );
      return {
        translation,
        audioStream: null,
        success: false,
        error: result.reason,
      };
    }
  });
};
