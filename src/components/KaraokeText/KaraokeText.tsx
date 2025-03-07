'use client';

import React from 'react';
import { TimestampData } from '@/services/genAudioForTranslation/genAudioWithTimestampsForTranslation';

interface KaraokeTextProps {
  text: string;
  timestamps: TimestampData;
  isPlaying: boolean;
  currentTime: number;
  highlightColor?: string;
  glowColor?: string;
}

// TODO: CR lots of ai generated code here, need to refactor
export const KaraokeText = ({
  text,
  timestamps,
  isPlaying,
  currentTime,
  glowColor = 'rgba(255, 105, 180, 0.7)', // Light magenta glow
}: KaraokeTextProps) => {
  // Extract character timestamps
  const getCharacterTimestamps = (): number[] | null => {
    if (timestamps.character_start_times_seconds) {
      return timestamps.character_start_times_seconds;
    }

    // Add support for other timestamp formats here

    return null;
  };

  const characterTimestamps = getCharacterTimestamps();

  // If no valid timestamps, just render the text normally
  if (!characterTimestamps || characterTimestamps.length === 0) {
    return <p className="flex-1 text-white/90">{text}</p>;
  }

  // Get the characters from timestamps
  const timestampChars = timestamps.characters || [];

  // Split the text into characters
  const textChars = text.split('');

  // Check if we need to adjust for leading/trailing spaces in normalized_alignment
  // This is a common issue with normalized_alignment vs alignment
  let adjustedTimestampChars = [...timestampChars];
  let adjustedTimestamps = [...characterTimestamps];

  // If character counts don't match but are close (within a few spaces difference)
  if (textChars.length !== timestampChars.length) {
    console.log('Character count mismatch, attempting to adjust');

    // If timestamp chars has leading/trailing spaces that text doesn't have
    if (timestampChars.length > textChars.length) {
      // Check for leading space
      let startOffset = 0;
      while (
        startOffset < timestampChars.length &&
        timestampChars[startOffset] === ' ' &&
        startOffset < timestampChars.length - textChars.length
      ) {
        startOffset++;
      }

      // Check for trailing space
      let endOffset = 0;
      while (
        endOffset < timestampChars.length - textChars.length - startOffset &&
        timestampChars[timestampChars.length - 1 - endOffset] === ' '
      ) {
        endOffset++;
      }

      // Adjust the arrays if we found offsets
      if (startOffset > 0 || endOffset > 0) {
        adjustedTimestampChars = timestampChars.slice(
          startOffset,
          timestampChars.length - endOffset
        );
        adjustedTimestamps = characterTimestamps.slice(
          startOffset,
          characterTimestamps.length - endOffset
        );
      }
    }
  }

  // Final check to ensure we have the right number of timestamps
  if (textChars.length !== adjustedTimestampChars.length) {
    console.warn(
      'Character count and timestamp count mismatch after adjustment',
      {
        textLength: textChars.length,
        timestampLength: adjustedTimestampChars.length,
        text,
        timestampChars: adjustedTimestampChars.join(''),
      }
    );
    return <p className="flex-1 text-white/90">{text}</p>;
  }

  // Calculate glow intensity based on character timing
  const getGlowStyle = (index: number) => {
    if (!isPlaying) return {}; // No glow when not playing

    const charTime = adjustedTimestamps[index] ?? 0;

    // Adjust current time for better synchronization
    // Reduced from 0.25 to 0.1 since we're now pre-adjusting the timestamps
    const adjustedCurrentTime = currentTime + 0.1;

    // If this character hasn't been spoken yet, no glow
    if (adjustedCurrentTime < charTime) return { textShadow: 'none' };

    // Calculate how recently this character was spoken
    const timeSinceSpoken = adjustedCurrentTime - charTime;

    // Adjusted durations for the glow effect to make it more responsive
    if (timeSinceSpoken < 0.5) {
      // Just spoken - full glow
      return {
        textShadow: `0 0 10px ${glowColor}, 0 0 15px ${glowColor}`,
        transition: 'text-shadow 0.15s ease-in-out',
      };
    } else if (timeSinceSpoken < 1.0) {
      // Spoken recently - medium glow
      return {
        textShadow: `0 0 7px ${glowColor}, 0 0 10px ${glowColor}`,
        transition: 'text-shadow 0.2s ease-in-out',
      };
    } else if (timeSinceSpoken < 1.5) {
      // Spoken a bit ago - light glow
      return {
        textShadow: `0 0 5px ${glowColor}`,
        transition: 'text-shadow 0.25s ease-in-out',
      };
    } else if (timeSinceSpoken < 2.0) {
      // Spoken a while ago - very light glow
      return {
        textShadow: `0 0 3px ${glowColor}`,
        transition: 'text-shadow 0.3s ease-in-out',
      };
    }

    // Spoken long ago - no glow
    return {
      textShadow: 'none',
      transition: 'text-shadow 0.4s ease-in-out',
    };
  };

  return (
    <p className="flex-1 text-white/90 flex flex-wrap">
      {textChars.map((char, index) => {
        const glowStyle = getGlowStyle(index);

        return (
          <span
            key={index}
            className="inline-block"
            style={{
              ...glowStyle,
              display: 'inline-block',
              marginLeft: char === ' ' ? '0.25em' : '0',
              marginRight: char === ' ' ? '0' : '0.01em',
            }}
          >
            {char}
          </span>
        );
      })}
    </p>
  );
};
