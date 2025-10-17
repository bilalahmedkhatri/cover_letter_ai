import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <section className="bg-slate-800/50 rounded-xl p-6 md:p-8 shadow-2xl border border-slate-700 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300 mb-6 inline-block">&larr; Back to Generator</a>
        <h2 className="text-3xl font-bold text-cyan-300 mb-6 border-b border-slate-700 pb-3">About Our Tool</h2>
        
        <div className="space-y-6 text-slate-300 prose prose-invert max-w-none">
            <h3 className="text-xl font-semibold text-slate-200">Our Mission</h3>
            <p>
                Our mission is to bridge the gap between talented individuals and their dream opportunities. We believe that a well-crafted letter can make all the difference, but we also know that it can be a source of stress and a time-consuming task. This tool was created to empower you to create compelling, personalized, and professional letters in minutes, so you can focus on what truly matters: preparing for your interview or your first day of class.
            </p>

            <h3 className="text-xl font-semibold text-slate-200">Who We Are</h3>
            <p>
                I am Bilal Ahmed, a software developer and career enthusiast passionate about using technology to solve real-world problems. This project was born from the desire to help job seekers and students present their best selves on paper, removing the writer's block that so many of us face.
            </p>
            
            <h3 className="text-xl font-semibold text-slate-200">Key Features &amp; Benefits</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-100">Dual-Purpose Generation</h4>
                <p>Whether you're applying for a new job or seeking admission to a university, our tool adapts. Simply select your goal, and the AI will tailor its tone, structure, and content to fit the appropriate context, ensuring your letter resonates with its intended audience.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-100">Intelligent Contextual Analysis</h4>
                <p>Provide a URL to a job posting or a screenshot of the description. Our AI reads and understands the requirements, keywords, and company culture, then seamlessly weaves this context into your letter to make it highly relevant and targeted.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-100">Unique University Program Analyzer</h4>
                <p>Applying to a university? Just provide the program URL. Our AI will visit the page, extract key details like program name, department, admission requirements, and deadlines, and use that information to craft a knowledgeable and specific admission letter. This saves you hours of research and ensures you don't miss critical details.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-100">Deep Customization and Control</h4>
                <p>Your voice matters. Use the "Additional Instructions" field to guide the AI's tone, specify points to emphasize, or request a particular format. You can also provide custom headers and footers to ensure the final document perfectly matches your personal brand.</p>
              </div>
               <div>
                <h4 className="font-semibold text-slate-100">Privacy-First Design</h4>
                <p>We respect your privacy. All the information you enter, including your personal details and resume, is processed directly in your browser. Your data is not stored on our servers, and your session is saved to your computer's local storage for your convenience only.</p>
              </div>
            </div>


            <h3 className="text-xl font-semibold text-slate-200">Contact Us</h3>
            <p>
                We are always looking to improve. If you have any feedback, questions, or suggestions, please feel free to reach out.
            </p>
            <p>
                You can contact us via email at <a href="mailto:bilalahmedkhatri@outlook.com">bilalahmedkhatri@outloo.com</a> or connect with me on <a href="https://www.linkedin.com/in/bilalahmeddev/" target="_blank" rel="noopener noreferrer">LinkedIn</a>.
            </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
