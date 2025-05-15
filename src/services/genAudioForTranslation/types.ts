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

export interface ElevenLabsTimestampResponse {
  audio_base64: string;
  alignment: TimestampData;
  normalized_alignment?: TimestampData;
}
