import React, { useState, useEffect } from 'react';
import { useTheme } from '../App';
import { useLocale } from '../contexts/LocaleContext';
import MenuIcon from './icons/MenuIcon';
import XIcon from './icons/XIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import LanguageSelector from './LanguageSelector';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t } = useLocale();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close menu on navigation for SPA behavior
  useEffect(() => {
    const handleLocationChange = () => setIsOpen(false);
    window.addEventListener('popstate', handleLocationChange);
    // Also handle direct link clicks that change the page state in App.tsx
    const originalPushState = history.pushState;
    history.pushState = function() {
      originalPushState.apply(this, arguments as any);
      handleLocationChange();
    };
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      history.pushState = originalPushState;
    };
  }, []);

  const navLinks = (
      <>
        <a href="/dashboard" className="text-text-primary hover:text-accent transition-colors">{t('dashboard')}</a>
        <a href="/about" className="text-text-secondary hover:text-accent transition-colors">{t('about')}</a>
        <a href="/privacy" className="text-text-secondary hover:text-accent transition-colors">{t('privacy')}</a>
        <a href="/terms" className="text-text-secondary hover:text-accent transition-colors">{t('terms')}</a>
      </>
  );

  return (
    <header className={`sticky top-0 z-20 transition-all duration-300 ${isScrolled ? 'bg-header-bg/80 backdrop-blur-sm border-b border-border' : 'bg-header-bg'}`}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="text-xl sm:text-2xl font-bold text-accent">AI Letter Generator</a>
          
          <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {navLinks}
            </nav>

             {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="text-text-secondary hover:text-accent transition-colors"
              aria-label={t('themeSwitch', { theme: theme === 'dark' ? 'light' : 'dark' })}
            >
              {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>
            
            <LanguageSelector />

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-text-primary hover:text-accent focus:outline-none" aria-label="Toggle mobile menu">
                {isOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} absolute w-full bg-header-bg/95 backdrop-blur-sm shadow-lg`}>
        <nav className="flex flex-col items-center space-y-4 py-4 border-t border-border">
          {navLinks}
        </nav>
      </div>
    </header>
  );
};

export default Header;