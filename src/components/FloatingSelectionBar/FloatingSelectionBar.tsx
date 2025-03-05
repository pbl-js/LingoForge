'use client';

import React from 'react';
import { useSelectedSentences } from '@/contexts/SelectedSentencesContext';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Volume2 } from 'lucide-react';
import { generateAndSaveAudioForTranslations } from '@/services/genAudioForTranslation/action';
// import { toast } from '@/components/ui/use-toast';

export function FloatingSelectionBar() {
  const { selectedSentenceIds, clearSelectedSentences } =
    useSelectedSentences();
  const [isPending, startTransition] = React.useTransition();

  const hasSelectedSentences = selectedSentenceIds.length > 0;

  if (!hasSelectedSentences) {
    return null;
  }

  const handleGenerateAudio = () => {
    startTransition(async () => {
      try {
        const result = await generateAndSaveAudioForTranslations(
          selectedSentenceIds
        );
        console.log(
          'result: ',
          result,
          'selectedSentenceIds: ',
          selectedSentenceIds
        );
        if (result.success) {
          console.log('Audio generation complete');
          //   toast({
          //     title: "Audio generation complete",
          //     description: result.message,
          //     variant: "default",
          //   });
        } else {
          //   toast({
          //     title: "Audio generation failed",
          //     description: result.message,
          //     variant: "destructive",
          //   });
        }
      } catch (error) {
        // toast({
        //   title: "Error",
        //   description: "Failed to generate audio files",
        //   variant: "destructive",
        // });
        console.error('Error generating audio:', error);
      }
    });
  };

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
              variant="default"
              size="sm"
              onClick={handleGenerateAudio}
              className="flex items-center gap-1"
              aria-label="Generate audio files"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateAudio()}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Volume2 className="h-4 w-4 mr-1" />
              )}
              {isPending ? 'Generating...' : 'Generate Audio'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={clearSelectedSentences}
              className="flex items-center gap-1"
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
