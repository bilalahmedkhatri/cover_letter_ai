import React from 'react';
import { SavedSession } from '../types';
import { useLocale } from '../contexts/LocaleContext';

interface SavedLettersDisplayProps {
  sessions: SavedSession[];
  onRestore: (session: SavedSession) => void;
  onRemove: (id: number) => void;
}

const SavedLettersDisplay: React.FC<SavedLettersDisplayProps> = ({ sessions, onRestore, onRemove }) => {
  const { t } = useLocale();

  if (sessions.length === 0) {
    return null; // Don't render anything if there are no saved letters
  }

  return (
    <div className="bg-card/50 p-4 sm:p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-accent mb-4">{t('savedTitle')}</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {sessions.map((session) => (
          <div key={session.id} className="bg-card p-4 rounded-lg flex flex-col items-start sm:flex-row sm:items-center gap-3">
            <div className="flex-grow min-w-0 w-full">
              <p className="text-text-primary truncate">{session.coverLetter}</p>
              <p className="text-xs text-text-muted mt-1">
                {t('savedOn')} {new Date(session.date).toLocaleString()}
              </p>
            </div>
            <div className="flex-shrink-0 flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => onRestore(session)}
                className="w-1/2 sm:w-auto text-center px-3 py-1 bg-card-secondary hover:bg-button-secondary-hover-bg rounded-md transition-colors text-xs font-medium"
                aria-label={`Restore session saved on ${new Date(session.date).toLocaleString()}`}
              >
                {t('savedRestore')}
              </button>
              <button
                onClick={() => onRemove(session.id)}
                className="w-1/2 sm:w-auto text-center px-3 py-1 bg-red-800/50 hover:bg-red-800/80 text-red-300 rounded-md transition-colors text-xs font-medium"
                aria-label={`Remove session saved on ${new Date(session.date).toLocaleString()}`}
              >
                {t('savedRemove')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedLettersDisplay;