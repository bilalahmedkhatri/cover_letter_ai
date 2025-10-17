import React from 'react';
import { SavedLetter } from '../types';

interface SavedLettersDisplayProps {
  letters: SavedLetter[];
  onRestore: (content: string) => void;
  onRemove: (id: number) => void;
}

const SavedLettersDisplay: React.FC<SavedLettersDisplayProps> = ({ letters, onRestore, onRemove }) => {
  if (letters.length === 0) {
    return null; // Don't render anything if there are no saved letters
  }

  return (
    <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-cyan-300 mb-4">Saved Letters</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {letters.map((letter) => (
          <div key={letter.id} className="bg-slate-900/70 p-4 rounded-lg flex items-center justify-between gap-4">
            <div className="flex-grow min-w-0">
              <p className="text-slate-300 truncate">{letter.content}</p>
              <p className="text-xs text-slate-500 mt-1">
                Saved on: {new Date(letter.date).toLocaleString()}
              </p>
            </div>
            <div className="flex-shrink-0 flex gap-2">
              <button
                onClick={() => onRestore(letter.content)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors text-xs font-medium"
                aria-label={`Restore letter saved on ${new Date(letter.date).toLocaleString()}`}
              >
                Restore
              </button>
              <button
                onClick={() => onRemove(letter.id)}
                className="px-3 py-1 bg-red-800/50 hover:bg-red-800/80 text-red-300 rounded-md transition-colors text-xs font-medium"
                aria-label={`Remove letter saved on ${new Date(letter.date).toLocaleString()}`}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedLettersDisplay;
