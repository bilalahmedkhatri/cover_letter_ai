import React, { useState, useRef, useEffect } from 'react';
import { useLocale, locales } from '../contexts/LocaleContext';
import LanguageIcon from './icons/LanguageIcon';
import CheckIcon from './icons/CheckIcon';

const LanguageSelector: React.FC = () => {
    const { locale, setLocale } = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-text-secondary hover:text-accent transition-colors"
                aria-label="Select language"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <LanguageIcon className="w-6 h-6" />
                <span className="text-sm font-medium uppercase">{locale}</span>
            </button>
            {isOpen && (
                <div className="absolute end-0 mt-2 w-48 bg-card rounded-md shadow-lg z-30 border border-border">
                    <ul className="py-1" role="menu">
                        {locales.map(lang => (
                            <li key={lang.code}>
                                <button
                                    onClick={() => {
                                        setLocale(lang.code);
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left rtl:text-right px-4 py-2 text-sm text-text-primary hover:bg-card-secondary flex items-center justify-between"
                                    role="menuitem"
                                >
                                    {lang.name}
                                    {locale === lang.code && <CheckIcon className="w-5 h-5 text-accent" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;