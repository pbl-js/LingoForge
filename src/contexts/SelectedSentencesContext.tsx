'use client';

import * as React from 'react';

type SelectedSentencesContextType = {
  selectedSentenceIds: string[];
  toggleSentence: (id: string) => void;
  selectSentence: (id: string) => void;
  unselectSentence: (id: string) => void;
  clearSelectedSentences: () => void;
  isSelected: (id: string) => boolean;
};

const SelectedSentencesContext = React.createContext<
  SelectedSentencesContextType | undefined
>(undefined);

function SelectedSentencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedSentenceIds, setSelectedSentenceIds] = React.useState<
    string[]
  >([]);

  // Toggle selection status of a sentence
  const toggleSentence = React.useCallback((id: string) => {
    setSelectedSentenceIds((prevIds) =>
      prevIds.includes(id)
        ? prevIds.filter((sentenceId) => sentenceId !== id)
        : [...prevIds, id]
    );
  }, []);

  // Select a sentence
  const selectSentence = React.useCallback((id: string) => {
    setSelectedSentenceIds((prevIds) =>
      prevIds.includes(id) ? prevIds : [...prevIds, id]
    );
  }, []);

  // Unselect a sentence
  const unselectSentence = React.useCallback((id: string) => {
    setSelectedSentenceIds((prevIds) =>
      prevIds.filter((sentenceId) => sentenceId !== id)
    );
  }, []);

  // Clear all selected sentences
  const clearSelectedSentences = React.useCallback(() => {
    setSelectedSentenceIds([]);
  }, []);

  // Check if a sentence is selected
  const isSelected = React.useCallback(
    (id: string) => selectedSentenceIds.includes(id),
    [selectedSentenceIds]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const value = React.useMemo(
    () => ({
      selectedSentenceIds,
      toggleSentence,
      selectSentence,
      unselectSentence,
      clearSelectedSentences,
      isSelected,
    }),
    [
      selectedSentenceIds,
      toggleSentence,
      selectSentence,
      unselectSentence,
      clearSelectedSentences,
      isSelected,
    ]
  );

  return (
    <SelectedSentencesContext.Provider value={value}>
      {children}
    </SelectedSentencesContext.Provider>
  );
}

function useSelectedSentences() {
  const context = React.useContext(SelectedSentencesContext);
  if (context === undefined) {
    throw new Error(
      'useSelectedSentences must be used within a SelectedSentencesProvider'
    );
  }
  return context;
}

export { SelectedSentencesProvider, useSelectedSentences };
