import React, { useState, useEffect } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import ArrowUpIcon from './icons/ArrowUpIcon';

const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLocale();

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label={t('backToTop')}
      title={t('backToTop')}
      className={`fixed bottom-20 right-6 z-40 bg-button-secondary-bg text-text-primary rounded-full p-3 shadow-lg hover:bg-button-secondary-hover-bg transition-all duration-300 ease-in-out transform hover:scale-110 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${!isVisible && 'pointer-events-none'}`}
    >
      <ArrowUpIcon className="w-6 h-6" />
    </button>
  );
};

export default BackToTopButton;
