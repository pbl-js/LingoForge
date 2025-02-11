import React from 'react';

export function AddWordButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-4 py-2 bg-blue-400 rounded-xl font-bold">
      {children}
    </button>
  );
}
