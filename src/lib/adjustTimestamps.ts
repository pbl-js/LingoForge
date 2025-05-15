import { ElevenLabsTimestamps, TimestampData } from "@/services/genAudioForTranslation/types";

// Default timing adjustment configuration
export const DEFAULT_TIMING_CONFIG = {
  // Make highlighting appear 15% faster (0.85 speed factor)
  speedFactor: 0.8,
  // Start highlighting 150ms earlier
  offsetSeconds: 0, // -0.15
};

/**
 * Adjusts timestamp data to improve synchronization between audio and visual effects
 *
 * @param timestamps The original timestamps data
 * @param config Optional configuration for timing adjustments
 * @returns Adjusted timestamps data
 */
export function adjustTimestamps(
  timestamps: ElevenLabsTimestamps,
  config = DEFAULT_TIMING_CONFIG
): ElevenLabsTimestamps {
  const { speedFactor, offsetSeconds } = config;

  const result: ElevenLabsTimestamps = {
    alignment: adjustTimestampData(timestamps.alignment, speedFactor, offsetSeconds),
  };

  if (timestamps.normalized_alignment) {
    result.normalized_alignment = adjustTimestampData(
      timestamps.normalized_alignment,
      speedFactor,
      offsetSeconds
    );
  }

  return result;
}

/**
 * Adjusts a single TimestampData object
 */
function adjustTimestampData(
  data: TimestampData,
  speedFactor: number,
  offsetSeconds: number
): TimestampData {
  // Create a deep copy to avoid mutating the original data
  const adjustedData: TimestampData = {
    characters: [...data.characters],
    character_start_times_seconds: data.character_start_times_seconds.map(
      (time) => time * speedFactor + offsetSeconds
    ),
    character_end_times_seconds: data.character_end_times_seconds.map(
      (time) => time * speedFactor + offsetSeconds
    ),
  };

  return adjustedData;
}
