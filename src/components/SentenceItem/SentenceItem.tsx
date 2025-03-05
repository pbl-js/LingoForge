'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageIcon, Volume2 } from 'lucide-react';
import { useSelectedSentences } from '@/contexts/SelectedSentencesContext';
import { Translation } from '@prisma/client';

interface SentenceItemProps {
  id: number;
  translation: Translation;
}

export function SentenceItem({ id, translation }: SentenceItemProps) {
  const { isSelected, toggleSentence } = useSelectedSentences();
  const selected = isSelected(id);

  const handleCheckboxChange = () => {
    toggleSentence(translation.id);
  };

  return (
    <div className="group flex items-center gap-2 p-3 rounded-lg hover:bg-white/5">
      <Checkbox
        id={`sentence-${id}`}
        checked={selected}
        onCheckedChange={handleCheckboxChange}
        className="h-5 w-5 border-white/30 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 rounded-sm"
      />
      <p className="flex-1 text-white/90">{translation.content}</p>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {translation.audioUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/70 hover:text-pink-400 hover:bg-white/5"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/70 hover:text-pink-400 hover:bg-white/5"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
