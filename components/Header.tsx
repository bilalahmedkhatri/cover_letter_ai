import React, { useState, useEffect } from 'react';
import MenuIcon from './icons/MenuIcon';
import XIcon from './icons/XIcon';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return (
    <header className={`sticky top-0 z-20 transition-all duration-300 ${isScrolled ? 'bg-slate-900/80 backdrop-blur-sm border-b border-slate-800' : 'bg-slate-900'}`}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="text-2xl font-bold text-cyan-400">AI Letter Generator</a>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <a href="/dashboard" className="text-slate-300 hover:text-cyan-400 transition-colors">Dashboard</a>
            <a href="/about" className="text-slate-400 hover:text-cyan-400 transition-colors">About</a>
            <a href="/privacy" className="text-slate-400 hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="/terms" className="text-slate-400 hover:text-cyan-400 transition-colors">Terms</a>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-cyan-400 focus:outline-none" aria-label="Toggle mobile menu">
              {isOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} absolute w-full bg-slate-900/95 backdrop-blur-sm shadow-lg`}>
        <nav className="flex flex-col items-center space-y-4 py-4 border-t border-slate-800">
          <a href="/dashboard" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-cyan-400 transition-colors">Dashboard</a>
          <a href="/about" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-cyan-400 transition-colors">About</a>
          <a href="/privacy" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-cyan-400 transition-colors">Privacy</a>
          <a href="/terms" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-cyan-400 transition-colors">Terms</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
