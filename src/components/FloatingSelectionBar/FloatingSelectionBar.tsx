'use client';

import React from 'react';
import { useSelectedSentences } from '@/contexts/SelectedSentencesContext';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function FloatingSelectionBar() {
  const { selectedSentenceIds, clearSelectedSentences } =
    useSelectedSentences();

  const hasSelectedSentences = selectedSentenceIds.length > 0;

  if (!hasSelectedSentences) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="mx-auto max-w-screen-xl">
        <div className="bg-purple-900 border border-purple-800 rounded-lg shadow-lg p-4 flex justify-between items-center">
          <span className="text-white font-medium">
            {selectedSentenceIds.length} sentence
            {selectedSentenceIds.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={clearSelectedSentences}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
