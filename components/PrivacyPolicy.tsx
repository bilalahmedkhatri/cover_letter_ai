import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="space-y-4 text-slate-300">
      <h1 className="text-3xl font-bold text-cyan-300 mb-4">Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2 className="text-xl font-semibold text-cyan-400 pt-4">1. Introduction</h2>
      <p>
        Welcome to AI Letter Generator. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
      </p>

      <h2 className="text-xl font-semibold text-cyan-400 pt-4">2. Information We Collect</h2>
      <p>
        We may collect information that you provide directly to us. This includes:
      </p>
      <ul className="list-disc list-inside pl-4">
        <li>Personal details you enter into the form (e.g., name, skills, experience).</li>
        <li>Files you upload (e.g., your resume).</li>
        <li>Information related to job or university applications (e.g., URLs, screenshots).</li>
      </ul>
      <p>
        All data you provide is processed in-memory for the duration of your request to generate a letter. We do not store your personal data, resumes, or generated letters on our servers after your session ends.
      </p>

      <h2 className="text-xl font-semibold text-cyan-400 pt-4">3. How We Use Your Information</h2>
      <p>
        We use the information we collect solely to:
      </p>
      <ul className="list-disc list-inside pl-4">
        <li>Provide, operate, and maintain our services.</li>
        <li>Generate a personalized cover or admission letter based on your inputs.</li>
        <li>Analyze URLs for admission information as requested.</li>
      </ul>

      <h2 className="text-xl font-semibold text-cyan-400 pt-4">4. Data Security</h2>
      <p>
        We use administrative, technical, and physical security measures to help protect your information. While we have taken reasonable steps to secure the information you provide to us, please be aware that no security measures are perfect or impenetrable.
      </p>

      <h2 className="text-xl font-semibold text-cyan-400 pt-4">5. Third-Party Services</h2>
      <p>
        Our service uses Google's Gemini API to process your data and generate content. Your data is sent to Google for this purpose. We recommend you review Google's Privacy Policy to understand how they handle data. We are not responsible for the data practices of third-party services.
      </p>

      <h2 className="text-xl font-semibold text-cyan-400 pt-4">6. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
      </p>

      <h2 className="text-xl font-semibold text-cyan-400 pt-4">7. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us at support@ailettergen.com.
      </p>
      
      <div className="mt-8 pt-6 border-t border-slate-700 text-center">
        <a href="/dashboard" className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors font-medium">
            Back to Generator
        </a>
      </div>
    </div>
  );
};

export default PrivacyPolicy;