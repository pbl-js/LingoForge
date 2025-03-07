'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageIcon, Volume2 } from 'lucide-react';
import { useSelectedSentences } from '@/contexts/SelectedSentencesContext';
import { Translation } from '@prisma/client';
import { ElevenLabsTimestamps } from '@/services/genAudioForTranslation/genAudioWithTimestampsForTranslation';
import { KaraokeText } from '@/components/KaraokeText/KaraokeText';
import { parseTimestampsJson } from '@/lib/parseTimestampsJson';
import {
  adjustTimestamps,
  DEFAULT_TIMING_CONFIG,
} from '@/lib/adjustTimestamps';

// Karaoke timing configuration - adjust these values to fine-tune the synchronization
const KARAOKE_TIMING_CONFIG = {
  ...DEFAULT_TIMING_CONFIG,
  // Customize values here for testing
  // speedFactor: 0.8,  // Make highlighting appear 20% faster
  // offsetSeconds: -0.2,  // Start highlighting 200ms earlier
};

interface SentenceItemProps {
  id: number;
  translation: Translation;
}

// TODO: CR lots of ai generated code here, need to refactor
export function SentenceItem({ id, translation }: SentenceItemProps) {
  const { isSelected, toggleSentence } = useSelectedSentences();
  const selected = isSelected(id);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timestamps, setTimestamps] = useState<ElevenLabsTimestamps | null>(
    null
  );

  // Parse timestamps when component mounts
  useEffect(() => {
    // Parse timestamps if available
    if (translation.timestampsJson) {
      const result = parseTimestampsJson(translation.timestampsJson);

      if (!result.success) throw new Error(result.error);

      // Apply timing adjustments for better synchronization
      const adjustedTimestamps = adjustTimestamps(
        result.data,
        KARAOKE_TIMING_CONFIG
      );
      setTimestamps(adjustedTimestamps);
    }
  }, [translation.timestampsJson]);

  // Create audio element when component mounts
  useEffect(() => {
    if (translation.audioUrl) {
      const audio = new Audio(translation.audioUrl);
      audioRef.current = audio;

      // Set up event listeners
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleAudioEnded);
      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));

      return () => {
        // Clean up event listeners
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleAudioEnded);
        audio.removeEventListener('play', () => setIsPlaying(true));
        audio.removeEventListener('pause', () => setIsPlaying(false));
        audio.pause();
      };
    }
  }, [translation.audioUrl]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleCheckboxChange = () => {
    toggleSentence(translation.id);
  };

  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
        });
      }
    }
  };

  return (
    <div className="group flex items-center gap-2 p-3 rounded-lg hover:bg-white/5">
      <Checkbox
        id={`sentence-${id}`}
        checked={selected}
        onCheckedChange={handleCheckboxChange}
        className="h-5 w-5 border-white/30 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 rounded-sm"
      />
      {timestamps &&
      (timestamps.normalized_alignment || timestamps.alignment) ? (
        <KaraokeText
          text={translation.content}
          timestamps={timestamps.normalized_alignment || timestamps.alignment}
          isPlaying={isPlaying}
          currentTime={currentTime}
          highlightColor="text-blue-400"
        />
      ) : (
        <p className="flex-1 text-white/90">{translation.content}</p>
      )}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {translation.audioUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/70 hover:text-pink-400 hover:bg-white/5"
            onClick={handlePlayAudio}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            tabIndex={0}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/70 hover:text-pink-400 hover:bg-white/5"
          aria-label="Show image"
          tabIndex={0}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
