import React from 'react';

const LogoIcon: React.FC = () => {
  return (
    <div className="flex items-center gap-2" aria-label="AI Letter Generator home">
      <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f472b6" /> 
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>

        {/* Background shape */}
        <path d="M15,0 H65 V80 H50 L45,90 L40,80 H15 C6.7,80 0,73.3 0,65 V15 C0,6.7 6.7,0 15,0 Z" fill="url(#logo-grad)" />

        {/* Paper shape */}
        <path d="M60,10 H95 C97.8,10 100,12.2 100,15 V75 C100,77.8 97.8,80 95,80 H60 V10 Z" fill="url(#logo-grad)" opacity="0.85" />
        
        {/* Paper lines */}
        <line x1="65" y1="25" x2="95" y2="25" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />
        <line x1="65" y1="35" x2="95" y2="35" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />
        <line x1="65" y1="45" x2="95" y2="45" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />
        <line x1="65" y1="55" x2="95" y2="55" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />
        <line x1="65" y1="65" x2="95" y2="65" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />

        {/* Text */}
        <text x="32" y="30" fontFamily="Inter, sans-serif" fontSize="22" fill="white" fontWeight="800" textAnchor="middle">AI</text>
        <text x="32" y="55" fontFamily="Inter, sans-serif" fontSize="16" fill="white" fontWeight="700" textAnchor="middle">Letter</text>
        <text x="32" y="75" fontFamily="Inter, sans-serif" fontSize="16" fill="white" fontWeight="700" textAnchor="middle">Gen</text>
        
        {/* Sparkles */}
        <path d="M10 10 l3 7 l3 -7 l-3 -7 z" fill="white" />
        <path d="M50 80 l3 7 l3 -7 l-3 -7 z" fill="white" />

      </svg>
      <span className="hidden sm:block text-xl font-bold text-accent">
        AI Letter Generator
      </span>
    </div>
  );
};
export default LogoIcon;
