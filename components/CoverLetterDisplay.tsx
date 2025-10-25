import React, { useState, useEffect, useRef } from 'react';
import { FriendlyError } from '../services/errorService';
import { loadScript } from '../services/scriptLoader';
import { useLocale } from '../contexts/LocaleContext';
import { UserData, JobDetails } from '../types';
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
  userData: UserData;
  jobDetails: JobDetails;
}

const CoverLetterDisplay: React.FC<CoverLetterDisplayProps> = ({ 
  coverLetter, 
  setCoverLetter, 
  isLoading, 
  error, 
  onSubmit, 
  userData,
  jobDetails,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [coverLetter]);

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
  };

  const generateLetterImage = async (contextUrl?: string): Promise<HTMLCanvasElement> => {
    await loadScript(HTML2CANVAS_URL);
    if (!window.html2canvas) {
      throw new Error("Image generation library failed to load. Please refresh and try again.");
    }

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
    container.style.display = 'flex';
    container.style.flexDirection = 'column';

    const content = document.createElement('div');
    content.style.flexGrow = '1';
    content.style.lineHeight = '1.6';
    content.style.fontSize = '15px';
    content.style.whiteSpace = 'pre-wrap';
    content.style.wordWrap = 'break-word';
    content.innerText = coverLetter;

    const footer = document.createElement('div');
    footer.style.marginTop = 'auto';
    footer.style.paddingTop = '40px';
    footer.style.fontSize = '12px';
    footer.style.color = '#666';
    footer.style.textAlign = 'center';
    footer.style.flexShrink = '0';
    
    const siteText = document.createElement('p');
    siteText.innerText = `Generated with AI Letter Generator - ailettergen.com`;
    footer.appendChild(siteText);

    if (contextUrl) {
      const contextText = document.createElement('p');
      contextText.innerText = `In reference to: ${contextUrl}`;
      contextText.style.marginTop = '4px';
      contextText.style.fontSize = '10px';
      contextText.style.wordBreak = 'break-all';
      footer.appendChild(contextText);
    }
    
    container.appendChild(content);
    container.appendChild(footer);
    
    document.body.appendChild(container);

    const canvas = await window.html2canvas(container, {
      scale: 2,
      useCORS: true, // This is crucial for handling cross-origin resources like fonts
    });

    document.body.removeChild(container);
    return canvas;
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    setPdfError(null);
    try {
      const canvas = await generateLetterImage();
      const imgData = canvas.toDataURL('image/png');
      
      await loadScript(JSPDF_URL);
      if (!window.jspdf || !window.jspdf.jsPDF) {
        throw new Error("PDF library failed to load. Please refresh and try again.");
      }
      const { jsPDF } = window.jspdf;
      
      // Fix: Updated the jsPDF constructor to pass an options object, matching the expected signature.
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      // Fix: Switched from getWidth()/getHeight() methods to direct property access to align with the type definition.
      const pdfWidth = pdf.internal.pageSize.width;
      const pdfHeight = pdf.internal.pageSize.height;
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      
      let imgWidth = pdfWidth;
      let imgHeight = imgWidth / ratio;
      
      if (imgHeight > pdfHeight) {
          imgHeight = pdfHeight;
          imgWidth = imgHeight * ratio;
      }
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('professional-letter.pdf');

    } catch (e) {
      console.error("Failed to download PDF:", e);
      const message = e instanceof Error ? e.message : "An unknown error occurred.";
      if (isMounted.current) {
        setPdfError(message);
      }
    } finally {
      if (isMounted.current) {
        setIsDownloadingPdf(false);
      }
    }
  };
  
  const handleSocialShare = async (platform: 'linkedin' | 'twitter' | 'facebook') => {
    setSharingPlatform(platform);
    setImageGenError(null);
    try {
        let contextUrl = '';
        if (userData.letterType === 'job' && jobDetails.url) {
            contextUrl = jobDetails.url;
        } else if (userData.letterType === 'university' && userData.universityUrl) {
            contextUrl = userData.universityUrl;
        }

        // Generate the image with the context URL in the footer
        const canvas = await generateLetterImage(contextUrl);

        // Automatically download the image for the user
        canvas.toBlob((blob) => {
            if (!blob) {
                throw new Error("Failed to create image blob from canvas.");
            }
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'professional-letter.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }, 'image/png');

        // Allow a brief moment for the download to initiate before opening the new tab
        await new Promise(resolve => setTimeout(resolve, 100));

        const siteUrl = "https://ailettergen.com";
        let shareUrl = '';

        const encodedSiteUrl = encodeURIComponent(siteUrl);

        switch (platform) {
            case 'twitter': {
                const text = t('shareTwitter');
                const encodedText = encodeURIComponent(text);
                shareUrl = `https://twitter.com/intent/tweet?url=${encodedSiteUrl}&text=${encodedText}`;
                break;
            }
            case 'facebook': {
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedSiteUrl}`;
                break;
            }
            case 'linkedin': {
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedSiteUrl}`;
                break;
            }
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'noopener,noreferrer');
        }

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
                disabled={isDownloadingPdf}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors text-sm font-medium w-full disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Download as PDF"
              >
                {isDownloadingPdf ? <SmallLoadingSpinner /> : <DownloadIcon className="w-5 h-5" />}
                <span>{isDownloadingPdf ? t('formGeneratingButton') : t('displayDownload')}</span>
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