import React from 'react';
import { Button } from './ui/button';
import { useLocale } from '../contexts/LocaleContext';
import { localizedPath } from '../services/routing';
import { legalLanguageNotice } from '../services/seo';

const PrivacyPolicy: React.FC = () => {
  const { t, locale } = useLocale();

  return (
    <div className="mx-auto max-w-3xl space-y-5 text-text-primary leading-relaxed">
      <h1 className="editorial-title mb-8">{t('privacy')}</h1>
      {locale !== 'en' && <p className="p-3 bg-amber-900/50 border border-amber-700 text-amber-300 text-sm rounded-lg italic">{legalLanguageNotice[locale]}</p>}
      <div lang="en" dir="ltr" className="space-y-4">

      <h2 className="text-xl font-semibold text-accent pt-4">1. Introduction</h2>
      <p>
        Welcome to AI Letter Generator. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
      </p>

      <h2 className="text-xl font-semibold text-accent pt-4">2. Information We Collect</h2>
      <p>
        We may collect information that you provide directly to us. This includes:
      </p>
      <ul className="list-disc list-inside ps-4">
        <li>Personal details you enter into the form (e.g., name, skills, experience).</li>
        <li>Files you upload (e.g., your resume).</li>
        <li>Information related to job or university applications (e.g., URLs, screenshots).</li>
      </ul>
      <p>
        Your writing inputs are sent to the selected AI service to prepare a response. New generation requests and responses are saved automatically to your private chat history. Editor changes remain in the current workspace until you export them. Older browser-local drafts, if present, remain on your device. Your conversation history and saved profile preferences are stored in our Neon database so you can reopen them after signing in. Login sessions are managed by Neon Auth. Payment and usage records are stored separately for billing. Reviews are stored with publication consent and appear publicly only after approval. Raw resume uploads and screenshots are not saved in chat history; extracted attachment text can be retained as part of your generation input.
      </p>

      <h2 className="text-xl font-semibold text-accent pt-4">3. How We Use Your Information</h2>
      <p>
        We use the information we collect solely to:
      </p>
      <ul className="list-disc list-inside ps-4">
        <li>Provide, operate, and maintain our services.</li>
        <li>Generate a personalized cover or admission letter based on your inputs.</li>
        <li>Analyze URLs for admission information as requested.</li>
      </ul>

      <h2 className="text-xl font-semibold text-accent pt-4">4. Data Security</h2>
      <p>
        We use administrative, technical, and physical security measures to help protect your information. While we have taken reasonable steps to secure the information you provide to us, please be aware that no security measures are perfect or impenetrable.
      </p>

      <h2 className="text-xl font-semibold text-accent pt-4">5. Third-Party Services</h2>
      <p>
        The current AI workflows may use Google Gemini. Account authentication and database storage use Neon, and the integrated crypto payment provider is NOWPayments when checkout is enabled. Information needed for each requested operation is processed by the relevant service. Review each provider’s privacy terms; we do not promise a single retention or training policy across all providers.
      </p>

      <h2 className="text-xl font-semibold text-accent pt-4">6. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
      </p>

      <h2 className="text-xl font-semibold text-accent pt-4">7. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us at support@ailettergen.com.
      </p>
      
      </div>
      <div className="mt-8 pt-6 border-t border-border text-center">
        <Button asChild><a href={localizedPath(locale, '/dashboard')}>
            {t('backToGenerator')}
        </a></Button>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
