import React, { useState } from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';
import { useLocale } from '../contexts/LocaleContext';

// --- Reusable Icon Component ---
const FeatureIcon: React.FC<{ path: string; className?: string }> = ({ path, className }) => (
    <div className={`flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white ${className}`}>
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path} />
        </svg>
    </div>
);

// --- FAQ Item Component ---
const FaqItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-border">
            <button
                className="flex justify-between items-center w-full py-5 text-left rtl:text-right text-lg font-medium text-text-primary"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span>{question}</span>
                <ChevronDownIcon className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="pb-5 pr-4 text-text-secondary">{children}</div>
            </div>
        </div>
    );
};


const LandingPage: React.FC = () => {
    const { t } = useLocale();

    return (
        <div className="space-y-20 sm:space-y-32">
            {/* --- Hero Section --- */}
            <section className="text-center pt-16 pb-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight">
                    {t('landingHeroTitle').replace(t('landingHeroTitleAccent'), '')}
                    <span className="text-accent">{t('landingHeroTitleAccent')}</span>.
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-text-secondary">
                    {t('landingHeroSubtitle')}
                </p>
                <div className="mt-8 flex justify-center">
                    <a href="/dashboard" className="inline-block bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out">
                        {t('landingHeroButton')}
                    </a>
                </div>
                 <p className="mt-4 text-sm text-text-muted">{t('landingHeroHint')}</p>
            </section>
            
            {/* --- How It Works Section --- */}
            <section>
                <h2 className="text-3xl font-bold text-center text-accent mb-12">{t('landingStepsTitle')}</h2>
                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
                     <div className="relative flex flex-col items-center">
                        <div className="text-6xl font-extrabold text-card-secondary">01</div>
                        <h3 className="mt-2 text-xl font-semibold text-text-primary">{t('landingStep1Title')}</h3>
                        <p className="mt-2 text-text-secondary">{t('landingStep1Text')}</p>
                    </div>
                     <div className="relative flex flex-col items-center">
                        <div className="text-6xl font-extrabold text-card-secondary">02</div>
                        <h3 className="mt-2 text-xl font-semibold text-text-primary">{t('landingStep2Title')}</h3>
                        <p className="mt-2 text-text-secondary">{t('landingStep2Text')}</p>
                    </div>
                     <div className="relative flex flex-col items-center">
                        <div className="text-6xl font-extrabold text-card-secondary">03</div>
                        <h3 className="mt-2 text-xl font-semibold text-text-primary">{t('landingStep3Title')}</h3>
                        <p className="mt-2 text-text-secondary">{t('landingStep3Text')}</p>
                    </div>
                </div>
            </section>

            {/* --- Features Section --- */}
            <section className="bg-card/50 p-8 rounded-lg shadow-lg">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-accent mb-12">{t('landingFeaturesTitle')}</h2>
                    <div className="grid md:grid-cols-3 gap-10 text-center">
                        <div className="flex flex-col items-center">
                            <FeatureIcon path="M13 10V3L4 14h7v7l9-11h-7z" />
                            <h3 className="mt-5 text-lg font-semibold text-text-primary">{t('landingFeature1Title')}</h3>
                            <p className="mt-2 text-text-secondary">{t('landingFeature1Text')}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <FeatureIcon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            <h3 className="mt-5 text-lg font-semibold text-text-primary">{t('landingFeature2Title')}</h3>
                            <p className="mt-2 text-text-secondary">{t('landingFeature2Text')}</p>
                        </div>
                         <div className="flex flex-col items-center">
                            <FeatureIcon path="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <h3 className="mt-5 text-lg font-semibold text-text-primary">{t('landingFeature3Title')}</h3>
                            <p className="mt-2 text-text-secondary">{t('landingFeature3Text')}</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* --- Who Is This For? --- */}
            <section>
                <h2 className="text-3xl font-bold text-center text-accent mb-12">{t('landingForWhoTitle')}</h2>
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                    <div className="bg-card/50 p-6 rounded-lg shadow-lg border border-border">
                        <FeatureIcon path="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="bg-cyan-500" />
                        <h3 className="mt-4 text-lg font-semibold text-text-primary">{t('landingForJobSeekers')}</h3>
                        <p className="mt-2 text-text-secondary">{t('landingForJobSeekersText')}</p>
                    </div>
                    <div className="bg-card/50 p-6 rounded-lg shadow-lg border border-border">
                         <FeatureIcon path="M12 6.253v11.494m-9-5.747h18" className="bg-cyan-500" />
                        <h3 className="mt-4 text-lg font-semibold text-text-primary">{t('landingForStudents')}</h3>
                        <p className="mt-2 text-text-secondary">{t('landingForStudentsText')}</p>
                    </div>
                    <div className="bg-card/50 p-6 rounded-lg shadow-lg border border-border">
                         <FeatureIcon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="bg-cyan-500" />
                        <h3 className="mt-4 text-lg font-semibold text-text-primary">{t('landingForProfessionals')}</h3>
                        <p className="mt-2 text-text-secondary">{t('landingForProfessionalsText')}</p>
                    </div>
                </div>
            </section>


            {/* --- Testimonials Section --- */}
            <section>
                <h2 className="text-3xl font-bold text-center text-accent mb-12">{t('landingTestimonialsTitle')}</h2>
                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="bg-card/50 p-6 rounded-lg shadow-lg">
                        <p className="text-text-primary">{t('landingTestimonial1')}</p>
                        <p className="mt-4 font-bold text-text-primary">{t('landingTestimonial1Author')}</p>
                    </div>
                    <div className="bg-card/50 p-6 rounded-lg shadow-lg">
                        <p className="text-text-primary">{t('landingTestimonial2')}</p>
                        <p className="mt-4 font-bold text-text-primary">{t('landingTestimonial2Author')}</p>
                    </div>
                     <div className="bg-card/50 p-6 rounded-lg shadow-lg">
                        <p className="text-text-primary">{t('landingTestimonial3')}</p>
                        <p className="mt-4 font-bold text-text-primary">{t('landingTestimonial3Author')}</p>
                    </div>
                </div>
            </section>

             {/* --- FAQ Section --- */}
            <section>
                <h2 className="text-3xl font-bold text-center text-accent mb-12">{t('landingFAQTitle')}</h2>
                <div className="max-w-3xl mx-auto">
                    <FaqItem question={t('landingFAQ1Title')}>
                        <p>{t('landingFAQ1Text')}</p>
                    </FaqItem>
                    <FaqItem question={t('landingFAQ2Title')}>
                        <p>{t('landingFAQ2Text')}</p>
                    </FaqItem>
                    <FaqItem question={t('landingFAQ3Title')}>
                        <p>{t('landingFAQ3Text')}</p>
                    </FaqItem>
                    <FaqItem question={t('landingFAQ4Title')}>
                        <p>{t('landingFAQ4Text')}</p>
                    </FaqItem>
                </div>
            </section>

            {/* --- Final CTA Section --- */}
            <section className="text-center py-16">
                <h2 className="text-3xl font-bold text-text-primary">{t('landingCTATitle')}</h2>
                <p className="mt-4 max-w-xl mx-auto text-text-secondary">{t('landingCTASubtitle')}</p>
                <a href="/dashboard" className="mt-8 inline-block bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out">
                    {t('landingCTAButton')}
                </a>
            </section>
        </div>
    );
};

export default LandingPage;
