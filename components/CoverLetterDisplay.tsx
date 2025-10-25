import React, { useState, useEffect, useRef } from 'react';
import { FriendlyError } from '../services/errorService';
import { loadScript } from '../services/scriptLoader';
import { useLocale } from '../contexts/LocaleContext';
import LoadingSpinner from './icons/LoadingSpinner';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';
import DownloadIcon from './icons/DownloadIcon';
import ErrorIcon from './icons/ErrorIcon';
import LinkedInIcon from './icons/LinkedInIcon';
import TwitterIcon from './icons/TwitterIcon';
import FacebookIcon from './icons/FacebookIcon';

const JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

interface CoverLetterDisplayProps {
  coverLetter: string;
  setCoverLetter: (value: string) => void;
  isLoading: boolean;
  error: FriendlyError | null;
  onSubmit: () => void;
}

const CoverLetterDisplay: React.FC<CoverLetterDisplayProps> = ({ coverLetter, setCoverLetter, isLoading, error, onSubmit }) => {
  const [copied, setCopied] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const { t } = useLocale();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // This effect will automatically resize the textarea based on its content.
  useEffect(() => {
    if (textareaRef.current) {
      // We reset the height to 'auto' to ensure the scrollHeight is calculated correctly
      // based on the content, not the current height.
      textareaRef.current.style.height = 'auto';
      // We then set the height to the scrollHeight, which is the minimum height required
      // to display the content without a scrollbar.
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [coverLetter]); // This effect runs whenever the coverLetter content changes.


  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
  };

  const handleDownloadPdf = async () => {
    setPdfError(null);
    try {
      await loadScript(JSPDF_URL);
      if (!window.jspdf || !window.jspdf.jsPDF) {
        throw new Error("PDF library failed to load. Please refresh and try again.");
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      
      const textLines = doc.splitTextToSize(coverLetter, 180); // 180mm width on A4 page
      doc.text(textLines, 15, 20); // 15mm from left, 20mm from top

      doc.save('professional-letter.pdf');
    } catch (e) {
      console.error("Failed to download PDF:", e);
      const message = e instanceof Error ? e.message : "An unknown error occurred.";
      if (isMounted.current) {
        setPdfError(message);
      }
    }
  };
  
  const handleSocialShare = (platform: 'linkedin' | 'twitter' | 'facebook') => {
    const url = 'https://ailettergen.com';
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        const twitterText = encodeURIComponent(t('shareTwitter'));
        shareUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${url}`;
        break;
      case 'linkedin':
        // LinkedIn does not reliably use the 'summary' parameter, so we don't include it.
        // The main goal is sharing the URL.
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'facebook':
        const facebookQuote = encodeURIComponent(t('shareFacebook'));
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${facebookQuote}`;
        break;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
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
              ref={textareaRef}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full bg-transparent border-none outline-none resize-none text-text-primary font-sans text-base leading-relaxed whitespace-pre-wrap overflow-hidden p-2 -m-2"
              aria-label="Editable cover letter content"
              rows={1}
            />
          
            {/* Share Section */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm font-medium text-text-secondary">{t('displayShareSuccess')}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleSocialShare('linkedin')} title={t('displayShareOnLinkedIn')} aria-label={t('displayShareOnLinkedIn')} className="p-2 bg-button-secondary-bg hover:bg-button-secondary-hover-bg rounded-full transition-colors"><LinkedInIcon className="w-5 h-5 text-text-primary" /></button>
                  <button onClick={() => handleSocialShare('twitter')} title={t('displayShareOnTwitter')} aria-label={t('displayShareOnTwitter')} className="p-2 bg-button-secondary-bg hover:bg-button-secondary-hover-bg rounded-full transition-colors"><TwitterIcon className="w-5 h-5 text-text-primary" /></button>
                  <button onClick={() => handleSocialShare('facebook')} title={t('displayShareOnFacebook')} aria-label={t('displayShareOnFacebook')} className="p-2 bg-button-secondary-bg hover:bg-button-secondary-hover-bg rounded-full transition-colors"><FacebookIcon className="w-5 h-5 text-text-primary" /></button>
                </div>
              </div>
            </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-4 flex-shrink-0">
            <button 
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-button-secondary-bg hover:bg-button-secondary-hover-bg rounded-md transition-colors text-sm font-medium w-full sm:w-auto"
              aria-label="Copy to clipboard"
            >
              {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5 text-text-primary" />}
              <span>{copied ? t('displayCopied') : t('displayCopy')}</span>
            </button>
            <div className="w-full sm:w-auto">
              <button 
                onClick={handleDownloadPdf}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors text-sm font-medium w-full"
                aria-label="Download as PDF"
              >
                <DownloadIcon className="w-5 h-5" />
                <span>{t('displayDownload')}</span>
              </button>
              {pdfError && <p className="text-xs text-red-400 mt-1 sm:text-right">{pdfError}</p>}
            </div>
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