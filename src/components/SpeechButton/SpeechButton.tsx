'use client';

import React from 'react';

interface SpeechButtonProps {
  text: string;
}

export const SpeechButton = ({ text }: SpeechButtonProps) => {
  const speak = () => {
    if (typeof window !== 'undefined') {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <button
      onClick={speak}
      className="ml-2 p-1 text-gray-300 hover:text-white"
      title="Play audio"
    >
      🔊
    </button>
  );
};
