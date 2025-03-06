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
  maxScaleFactor?: number;
}

// TODO: CR lots of ai generated code here, need to refactor
export const KaraokeText = ({
  text,
  timestamps,
  isPlaying,
  currentTime,
  highlightColor = 'text-blue-400',
  maxScaleFactor = 1.3,
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
        break;
      }
    }
  }

  // Calculate scale factor based on distance from active character
  const getScaleFactor = (index: number): number => {
    if (activeIndex === -1) return 1; // No scaling when not playing

    const distance = Math.abs(index - activeIndex);

    if (distance === 0) return maxScaleFactor; // Active character is scaled up
    if (distance === 1) return 1 + (maxScaleFactor - 1) * 0.75; // Adjacent characters
    if (distance === 2) return 1 + (maxScaleFactor - 1) * 0.5; // Characters 2 positions away
    if (distance === 3) return 1 + (maxScaleFactor - 1) * 0.25; // Characters 3 positions away

    return 1; // Default scale for distant characters
  };

  return (
    <p className="flex-1 text-white/90 flex flex-wrap">
      {characters.map((char, index) => {
        const startTime = characterTimestamps[index] ?? 0;
        const isActive = isPlaying && currentTime >= startTime;
        const scaleFactor = getScaleFactor(index);

        return (
          <span
            key={index}
            className={`inline-block transition-all duration-200 ease-in-out ${
              isActive ? highlightColor : ''
            }`}
            style={{
              transform: `scale(${scaleFactor})`,
              transformOrigin: 'center bottom',
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
