import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <section className="bg-slate-800/50 rounded-xl p-6 md:p-8 shadow-2xl border border-slate-700 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300 mb-6 inline-block">&larr; Back to Generator</a>
        <h2 className="text-3xl font-bold text-cyan-300 mb-6 border-b border-slate-700 pb-3">About Us</h2>
        
        <div className="space-y-4 text-slate-300 prose prose-invert max-w-none">
            <p className="text-amber-300 bg-amber-900/50 border border-amber-700 rounded-lg p-3 text-sm">
                <strong>IMPORTANT:</strong> This is a template. You must replace the content below with your own information before publishing your site.
            </p>

            <h3 className="text-xl font-semibold text-slate-200">Our Mission</h3>
            <p>
                At [Your App Name], our mission is to empower individuals to take the next step in their careers with confidence. We understand that crafting the perfect cover letter or admission essay can be a daunting task. Our goal is to simplify this process by leveraging the power of artificial intelligence to create personalized, professional, and impactful letters.
            </p>

            <h3 className="text-xl font-semibold text-slate-200">Who We Are</h3>
            <p>
                I am Bilal Ahmed, a software developer and career enthusiast passionate about using technology to solve real-world problems. This project was born from the desire to help job seekers and students present their best selves on paper, removing the writer's block that so many of us face.
            </p>
            
            <h3 className="text-xl font-semibold text-slate-200">How It Works</h3>
            <p>
                This tool uses Google's powerful Gemini AI model to analyze the information you provide—your skills, your experience, and the details of the opportunity you're pursuing. It then generates a letter that is not only well-written but also tailored to highlight your unique strengths in the most effective way.
            </p>

            <h3 className="text-xl font-semibold text-slate-200">Contact Us</h3>
            <p>
                We are always looking to improve. If you have any feedback, questions, or suggestions, please feel free to reach out.
            </p>
            <p>
                You can contact us via email at [Your Contact Email] or connect with me on <a href="https://www.linkedin.com/in/bilalahmeddev/" target="_blank" rel="noopener noreferrer">LinkedIn</a>.
            </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
