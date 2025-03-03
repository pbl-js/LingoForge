'use client';
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LearnHeaderProps = {
  onBack?: () => void;
};

export const LearnHeader = ({
  onBack = () => window.history.back(),
}: LearnHeaderProps) => {
  const handleBack = () => {
    onBack();
  };

  return (
    <div>
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-purple-800/50 transition-colors rounded-full hover:text-white border-4 border-purple-800/50 hover:border-transparent"
        onClick={handleBack}
        aria-label="Go back"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
    </div>
  );
};
