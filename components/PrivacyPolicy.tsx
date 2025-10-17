import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <section className="bg-slate-800/50 rounded-xl p-6 md:p-8 shadow-2xl border border-slate-700 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300 mb-6 inline-block">&larr; Back to Generator</a>
        <h2 className="text-3xl font-bold text-cyan-300 mb-6 border-b border-slate-700 pb-3">Privacy Policy</h2>
        
        <div className="space-y-4 text-slate-300 prose prose-invert max-w-none">
            <p className="text-amber-300 bg-amber-900/50 border border-amber-700 rounded-lg p-3 text-sm">
                <strong>IMPORTANT:</strong> This is a template. You must replace the content below with your own accurate Privacy Policy before publishing your site.
            </p>

            <p>Last updated: Oct 17, 2025</p>

            <h3 className="text-xl font-semibold text-slate-200">Introduction</h3>
            <p>
                Welcome to cover-letter-ai-xi. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
            </p>

            <h3 className="text-xl font-semibold text-slate-200">Data We Collect</h3>
            <p>
                We may collect, use, store and transfer different kinds of personal data about you which you provide to us. This includes:
            </p>
            <ul>
                <li>Information you input into the form fields, such as your name, skills, and experience.</li>
                <li>Data related to your session, which is stored in your browser's local storage to allow you to resume your work.</li>
                <li>(If applicable) Usage Data, including information about how you use our website.</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-200">How We Use Your Data</h3>
            <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul>
                <li>To provide the core functionality of our service (generating a letter).</li>
                <li>To improve our website, services, marketing, customer relationships and experiences.</li>
            </ul>
            <p>
                All data processed by the AI model is handled according to Google's Generative AI privacy policies. We do not store the content of your generated letters on our servers.
            </p>

            <h3 className="text-xl font-semibold text-slate-200">Data Security</h3>
            <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.
            </p>

             <h3 className="text-xl font-semibold text-slate-200">Your Legal Rights</h3>
            <p>
                Depending on your location and the applicable data protection laws, you may have certain rights regarding your personal data. These can include:
            </p>
            <ul>
                <li><strong>Request access</strong> to your personal data (commonly known as a "data subject access request"). This enables you to receive a copy of the personal data we hold about you.</li>
                <li><strong>Request correction</strong> of the personal data that we hold about you. This enables you to have any incomplete or inaccurate data we hold about you corrected.</li>
                <li><strong>Request erasure</strong> of your personal data. This enables you to ask us to delete or remove personal data where there is no good reason for us continuing to process it. Since our service primarily uses your browser's local storage, you can accomplish this by clearing your browser's storage for our site.</li>
                <li><strong>Object to processing</strong> of your personal data where we are relying on a legitimate interest (or those of a third party) and there is something about your particular situation which makes you want to object to processing on this ground.</li>
                <li><strong>Request restriction of processing</strong> of your personal data. This enables you to ask us to suspend the processing of your personal data in certain scenarios.</li>
                <li><strong>Withdraw consent at any time</strong> where we are relying on consent to process your personal data.</li>
            </ul>
            <p>
              If you wish to exercise any of the rights set out above, please contact us using the contact details provided below.
            </p>

            <h3 className="text-xl font-semibold text-slate-200">Contact Us</h3>
            <p>
                If you have any questions about this privacy policy, please contact us at: <a href="mailto:bilalahmedkhatri@outlook.com">bilalahmedkhatri@outloo.com</a>.
            </p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;