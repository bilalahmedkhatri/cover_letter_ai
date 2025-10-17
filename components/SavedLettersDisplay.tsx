import React from 'react';
import { SavedSession } from '../types';

interface SavedLettersDisplayProps {
  sessions: SavedSession[];
  onRestore: (session: SavedSession) => void;
  onRemove: (id: number) => void;
}

const SavedLettersDisplay: React.FC<SavedLettersDisplayProps> = ({ sessions, onRestore, onRemove }) => {
  if (sessions.length === 0) {
    return null; // Don't render anything if there are no saved letters
  }

  return (
    <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-cyan-300 mb-4">Saved Sessions</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {sessions.map((session) => (
          <div key={session.id} className="bg-slate-900/70 p-4 rounded-lg flex items-center justify-between gap-4">
            <div className="flex-grow min-w-0">
              <p className="text-slate-300 truncate">{session.coverLetter}</p>
              <p className="text-xs text-slate-500 mt-1">
                Saved on: {new Date(session.date).toLocaleString()}
              </p>
            </div>
            <div className="flex-shrink-0 flex gap-2">
              <button
                onClick={() => onRestore(session)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors text-xs font-medium"
                aria-label={`Restore session saved on ${new Date(session.date).toLocaleString()}`}
              >
                Restore
              </button>
              <button
                onClick={() => onRemove(session.id)}
                className="px-3 py-1 bg-red-800/50 hover:bg-red-800/80 text-red-300 rounded-md transition-colors text-xs font-medium"
                aria-label={`Remove session saved on ${new Date(session.date).toLocaleString()}`}
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