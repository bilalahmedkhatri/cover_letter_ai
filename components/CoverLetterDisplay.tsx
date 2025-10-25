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
import SmallLoadingSpinner from './icons/SmallLoadingSpinner';

const JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const HTML2CANVAS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';

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
  const [sharingPlatform, setSharingPlatform] = useState<null | 'linkedin' | 'twitter' | 'facebook'>(null);
  const [imageGenError, setImageGenError] = useState<string | null>(null);
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
  
  const handleSocialShare = async (platform: 'linkedin' | 'twitter' | 'facebook') => {
    setSharingPlatform(platform);
    setImageGenError(null);
    try {
      await loadScript(HTML2CANVAS_URL);
      if (!window.html2canvas) {
        throw new Error("Image generation library failed to load. Please refresh and try again.");
      }
  
      // Create a temporary, off-screen element for rendering
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '794px'; // A4 width at 96 DPI
      container.style.minHeight = '1123px'; // A4 height at 96 DPI
      container.style.padding = '75px'; // Approx 2cm margins
      container.style.boxSizing = 'border-box';
      container.style.backgroundColor = 'white';
      container.style.fontFamily = 'Inter, sans-serif';
      container.style.color = 'black';
      container.style.lineHeight = '1.6';
      container.style.fontSize = '15px';
      container.style.whiteSpace = 'pre-wrap';
      container.style.wordWrap = 'break-word';
      container.innerText = coverLetter;
  
      // Add a footer with branding
      const footer = document.createElement('p');
      footer.innerText = `Generated with AI Letter Generator - ailettergen.com`;
      footer.style.position = 'absolute';
      footer.style.bottom = '30px';
      footer.style.width = '100%';
      footer.style.left = '0';
      footer.style.fontSize = '12px';
      footer.style.color = '#666';
      footer.style.textAlign = 'center';
      container.appendChild(footer);
  
      document.body.appendChild(container);
  
      const canvas = await window.html2canvas(container, { scale: 2 }); // Scale for higher resolution
  
      document.body.removeChild(container); // Clean up the temporary element
  
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("Failed to create image blob from canvas.");
        }
        const file = new File([blob], 'professional-letter.png', { type: 'image/png' });
        
        const shareData = {
          files: [file],
          title: t('displayTitle'),
          text: t('shareTwitter'), // Use a generic, engaging text for sharing
        };
  
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
          } catch (shareError) {
            // Not a true error if the user cancels the share dialog.
            console.log("Share action was cancelled or failed by the user.", shareError);
          }
        } else {
          // Fallback for unsupported browsers: download the image.
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'professional-letter.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }
      }, 'image/png');
  
    } catch (err) {
      console.error("Failed to generate or share image:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      if (isMounted.current) {
        setImageGenError(`Could not generate image: ${message}`);
      }
    } finally {
      if (isMounted.current) {
        setSharingPlatform(null);
      }
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
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-secondary">{t('displayShareSuccess')}</p>
                    {sharingPlatform && <SmallLoadingSpinner />}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleSocialShare('linkedin')} disabled={sharingPlatform !== null} title={t('displayShareOnLinkedIn')} aria-label={t('displayShareOnLinkedIn')} className="p-2 bg-button-secondary-bg hover:bg-button-secondary-hover-bg rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><LinkedInIcon className="w-5 h-5 text-text-primary" /></button>
                  <button onClick={() => handleSocialShare('twitter')} disabled={sharingPlatform !== null} title={t('displayShareOnTwitter')} aria-label={t('displayShareOnTwitter')} className="p-2 bg-button-secondary-bg hover:bg-button-secondary-hover-bg rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><TwitterIcon className="w-5 h-5 text-text-primary" /></button>
                  <button onClick={() => handleSocialShare('facebook')} disabled={sharingPlatform !== null} title={t('displayShareOnFacebook')} aria-label={t('displayShareOnFacebook')} className="p-2 bg-button-secondary-bg hover:bg-button-secondary-hover-bg rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><FacebookIcon className="w-5 h-5 text-text-primary" /></button>
                </div>
              </div>
              {imageGenError && <p className="text-xs text-red-400 mt-1 sm:text-right">{imageGenError}</p>}
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