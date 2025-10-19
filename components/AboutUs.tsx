import React from 'react';
import { useLocale } from '../contexts/LocaleContext';

const AboutUs: React.FC = () => {
  const { t } = useLocale();
  return (
    <div className="space-y-4 text-text-primary">
      <h1 className="text-3xl font-bold text-accent mb-4">{t('about')}</h1>
      
      <h2 className="text-xl font-semibold text-accent pt-4">Our Mission</h2>
      <p>
        Our mission at AI Letter Generator is to empower job seekers and students by providing them with a powerful, easy-to-use tool for creating professional and effective application letters. We believe that a great letter can open doors, and we want to make that accessible to everyone.
      </p>

      <h2 className="text-xl font-semibold text-accent pt-4">How It Works</h2>
      <p>
        We leverage the cutting-edge capabilities of Google's Gemini Pro model to understand your unique background and the specifics of the opportunity you're pursuing. By analyzing your skills, experience, resume, and the details of the job or university program, our AI crafts a tailored letter designed to make you stand out.
      </p>

      <h2 className="text-xl font-semibold text-accent pt-4">Our Commitment to Privacy</h2>
      <p>
        We take your privacy seriously. Your data is used only for the purpose of generating your letter during your active session. We do not store your personal information on our servers. For more details, please see our Privacy Policy.
      </p>

      <h2 className="text-xl font-semibold text-accent pt-4">Feedback</h2>
      <p>
        This is a tool built for you. If you have any feedback, suggestions, or questions, please don't hesitate to reach out to us.
      </p>

      <div className="mt-8 pt-6 border-t border-border text-center">
        <a href="/dashboard" className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors font-medium">
            {t('backToGenerator')}
        </a>
      </div>
    </div>
  );
};

export default AboutUs;
