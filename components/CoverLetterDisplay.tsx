import React, { useState, useEffect } from 'react';
import LoadingSpinner from './icons/LoadingSpinner';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';
import DownloadIcon from './icons/DownloadIcon';

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
  error: string;
}

const CoverLetterDisplay: React.FC<CoverLetterDisplayProps> = ({ coverLetter, setCoverLetter, isLoading, error }) => {
  const [copied, setCopied] = useState(false);

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

  const handleDownloadPdf = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    const textLines = doc.splitTextToSize(coverLetter, 180); // 180mm width on A4 page
    doc.text(textLines, 15, 20); // 15mm from left, 20mm from top

    doc.save('professional-letter.pdf');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-text-secondary">
          <LoadingSpinner />
          <p className="mt-4 text-lg">Generating your letter...</p>
          <p className="text-sm">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-400" role="alert">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <title>Error</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-bold text-lg">Letter Generation Failed</p>
          <p className="text-sm text-center text-text-secondary mt-2">{error}</p>
        </div>
      );
    }

    if (coverLetter) {
      return (
        <div className="flex flex-col h-full">
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full flex-grow bg-transparent border-none outline-none resize-none text-text-primary font-sans text-base leading-relaxed whitespace-pre-wrap overflow-y-auto pr-2"
              aria-label="Editable cover letter content"
            />
          <div className="flex justify-end gap-4 mt-4 flex-shrink-0">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-button-secondary-bg hover:bg-button-secondary-hover-bg rounded-md transition-colors text-sm font-medium"
              aria-label="Copy to clipboard"
            >
              {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5 text-text-primary" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
             <button 
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors text-sm font-medium"
              aria-label="Download as PDF"
            >
              <DownloadIcon className="w-5 h-5" />
              <span>Download PDF</span>
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
        <p>Your generated letter will appear here.</p>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-[36rem] my-6">
      <h2 className="text-2xl font-bold text-cyan-300 mb-6 flex-shrink-0">Generated Letter</h2>
      <div className="bg-card rounded-lg p-6 flex-grow flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
};

export default CoverLetterDisplay;