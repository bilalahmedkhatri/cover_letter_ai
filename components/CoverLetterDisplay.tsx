
import React, { useState, useEffect } from 'react';
import LoadingSpinner from './icons/LoadingSpinner';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';
import DownloadIcon from './icons/DownloadIcon';

// Add jsPDF to the window interface to avoid TypeScript errors
declare global {
  interface Window {
    jspdf: any;
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
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <LoadingSpinner />
          <p className="mt-4 text-lg">Generating your letter...</p>
          <p className="text-sm">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-bold">An error occurred</p>
          <p className="text-sm text-center">{error}</p>
        </div>
      );
    }

    if (coverLetter) {
      return (
        <div className="relative h-full">
          <div className="absolute top-0 right-0 flex gap-2">
            <button 
              onClick={handleCopy}
              className="p-2 bg-slate-700/50 hover:bg-slate-600 rounded-md transition-colors"
              aria-label="Copy to clipboard"
            >
              {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5 text-slate-300" />}
            </button>
             <button 
              onClick={handleDownloadPdf}
              className="p-2 bg-slate-700/50 hover:bg-slate-600 rounded-md transition-colors"
              aria-label="Download as PDF"
            >
              <DownloadIcon className="w-5 h-5 text-slate-300" />
            </button>
          </div>
          <div className="h-full overflow-y-auto pr-4">
             <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full h-full bg-transparent border-none outline-none resize-none text-slate-300 font-sans text-base leading-relaxed"
              aria-label="Editable cover letter content"
            />
          </div>
        </div>
      );
    }

    return (
       <div className="flex flex-col items-center justify-center h-full text-slate-500">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        <p>Your generated letter will appear here.</p>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold text-cyan-300 mb-6 flex-shrink-0">Generated Letter</h2>
      <div className="bg-slate-900/70 rounded-lg p-6 flex-grow min-h-[300px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default CoverLetterDisplay;