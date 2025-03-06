'use client';

import React from 'react';

interface TimestampData {
  character_start_times_seconds?: number[];
  // Add other possible timestamp formats here as needed
}

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
  highlightColor = 'text-blue-400',
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

  const characters = text.split('');

  // Ensure we have the right number of timestamps
  if (characters.length !== characterTimestamps.length) {
    console.warn('Character count and timestamp count mismatch');
    return <p className="flex-1 text-white/90">{text}</p>;
  }

  // Find the index of the currently active character
  let activeIndex = -1;
  if (isPlaying) {
    for (let i = 0; i < characterTimestamps.length; i++) {
      if (currentTime >= (characterTimestamps[i] ?? 0)) {
        activeIndex = i;
      } else {
        // We've found the first character that hasn't been reached yet
        break;
      }
    }
  }

  // Calculate glow intensity based on character timing
  const getGlowStyle = (index: number) => {
    if (!isPlaying) return {}; // No glow when not playing

    const charTime = characterTimestamps[index] ?? 0;

    // If this character hasn't been spoken yet, no glow
    if (currentTime < charTime) return { textShadow: 'none' };

    // Calculate how recently this character was spoken
    const timeSinceSpoken = currentTime - charTime;

    if (timeSinceSpoken < 0.2) {
      // Just spoken - full glow
      return {
        textShadow: `0 0 10px ${glowColor}, 0 0 15px ${glowColor}`,
        transition: 'text-shadow 0.2s ease-in-out',
      };
    } else if (timeSinceSpoken < 0.4) {
      // Spoken recently - medium glow
      return {
        textShadow: `0 0 7px ${glowColor}, 0 0 10px ${glowColor}`,
        transition: 'text-shadow 0.3s ease-in-out',
      };
    } else if (timeSinceSpoken < 0.6) {
      // Spoken a bit ago - light glow
      return {
        textShadow: `0 0 5px ${glowColor}`,
        transition: 'text-shadow 0.4s ease-in-out',
      };
    } else if (timeSinceSpoken < 0.8) {
      // Spoken a while ago - very light glow
      return {
        textShadow: `0 0 3px ${glowColor}`,
        transition: 'text-shadow 0.5s ease-in-out',
      };
    }

    // Spoken long ago - no glow
    return {
      textShadow: 'none',
      transition: 'text-shadow 0.6s ease-in-out',
    };
  };

  return (
    <p className="flex-1 text-white/90 flex flex-wrap">
      {characters.map((char, index) => {
        const startTime = characterTimestamps[index] ?? 0;
        const isActive = isPlaying && currentTime >= startTime;
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
