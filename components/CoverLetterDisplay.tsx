import React, { useState, useEffect } from 'react';
import { FriendlyError } from '../services/errorService';
import { loadScript } from '../services/scriptLoader';
import { useLocale } from '../contexts/LocaleContext';
import LoadingSpinner from './icons/LoadingSpinner';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';
import DownloadIcon from './icons/DownloadIcon';
import ErrorIcon from './icons/ErrorIcon';

const JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

// Fix: Corrected the global type for 'window.jspdf' to match the declaration in 'services/pdfService.ts', resolving a conflict where it was improperly typed as 'any'.
declare namespace jspdf {
  class jsPDF {
    constructor(options?: any);
    internal: {
      pageSize: {
        height: number;
        width: number;
      };
    };
    splitTextToSize(text: string, maxWidth: number): string[];
    addPage(): jsPDF;
    text(text: string | string[], x: number, y: number, options?: any): jsPDF;
    setFont(fontName: string, fontStyle: string): jsPDF;
    setFontSize(size: number): jsPDF;
    save(filename: string): void;
  }
}

declare global {
  interface Window {
    jspdf: {
      jsPDF: new (options?: any) => jspdf.jsPDF;
    };
  }
}

interface CoverLetterDisplayProps {
  coverLetter: string;
  setCoverLetter: (value: string) => void;
  isLoading: boolean;
  error: FriendlyError | null;
  onSubmit: () => void;
}

const CoverLetterDisplay: React.FC<CoverLetterDisplayProps> = ({ coverLetter, setCoverLetter, isLoading, error, onSubmit }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
  };

  const handleDownloadPdf = async () => {
    try {
      await loadScript(JSPDF_URL);
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      
      const textLines = doc.splitTextToSize(coverLetter, 180); // 180mm width on A4 page
      doc.text(textLines, 15, 20); // 15mm from left, 20mm from top

      doc.save('professional-letter.pdf');
    } catch (e) {
      console.error("Failed to download PDF:", e);
      // Optionally, show an error to the user
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-text-secondary">
          <LoadingSpinner />
          <p className="mt-4 text-lg">{t('displayGenerating')}</p>
          <p className="text-sm">{t('displayTakeMoment')}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center" role="alert">
          <ErrorIcon className="h-14 w-14 mb-4 text-red-500" />
          <p className="font-bold text-lg text-red-500">{t('displayError')}</p>
          <p className="text-sm text-text-secondary mt-2 max-w-md">{error.message}</p>
          {error.isRetryable && (
            <button
              onClick={onSubmit}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-button-secondary-bg hover:bg-button-secondary-hover-bg rounded-md transition-colors text-sm font-medium"
            >
              <span>{t('displayRetry')}</span>
            </button>
          )}
        </div>
      );
    }

    if (coverLetter) {
      return (
        <div className="flex flex-col h-full">
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full flex-grow bg-transparent border-none outline-none resize-none text-text-primary font-sans text-base leading-relaxed whitespace-pre-wrap overflow-y-auto p-2 -m-2"
              aria-label="Editable cover letter content"
            />
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-4 flex-shrink-0">
            <button 
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-button-secondary-bg hover:bg-button-secondary-hover-bg rounded-md transition-colors text-sm font-medium w-full sm:w-auto"
              aria-label="Copy to clipboard"
            >
              {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5 text-text-primary" />}
              <span>{copied ? t('displayCopied') : t('displayCopy')}</span>
            </button>
             <button 
              onClick={handleDownloadPdf}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors text-sm font-medium w-full sm:w-auto"
              aria-label="Download as PDF"
            >
              <DownloadIcon className="w-5 h-5" />
              <span>{t('displayDownload')}</span>
            </button>
          </div>
        </div>
      );
    }

    return (
       <div className="flex flex-col items-center justify-center h-full text-text-muted">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        <p>{t('displayPlaceholder')}</p>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col min-h-[30rem] my-6">
      <h2 className="text-2xl font-bold text-accent mb-6 flex-shrink-0">{t('displayTitle')}</h2>
      <div className="bg-card rounded-lg p-6 flex-grow flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
};

export default CoverLetterDisplay;