import React, { useState } from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon';


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
                className="flex justify-between items-center w-full py-5 text-left text-lg font-medium text-text-primary"
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
    return (
        <div className="space-y-20 sm:space-y-32">
            {/* --- Hero Section --- */}
            <section className="text-center pt-16 pb-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight">
                    Craft Your Perfect Professional Letter, <span className="text-cyan-400">Instantly</span>.
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-text-secondary">
                    Whether you're applying for your dream job or a university program, our AI-powered advisor analyzes your details and the opportunity to generate a tailored, professional letter in seconds.
                </p>
                <div className="mt-8 flex justify-center">
                    <a href="/dashboard" className="inline-block bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out">
                        Start Generating for Free
                    </a>
                </div>
                 <p className="mt-4 text-sm text-text-muted">Trusted by students and professionals worldwide.</p>
            </section>
            
            {/* --- How It Works Section --- */}
            <section>
                <h2 className="text-3xl font-bold text-center text-cyan-300 mb-12">Just 3 Simple Steps</h2>
                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
                     <div className="relative flex flex-col items-center">
                        <div className="text-6xl font-extrabold text-card-secondary">01</div>
                        <h3 className="mt-2 text-xl font-semibold text-text-primary">Provide Your Details</h3>
                        <p className="mt-2 text-text-secondary">Enter your name, skills, and experience. For best results, upload your resume (PDF, DOCX, or TXT).</p>
                    </div>
                     <div className="relative flex flex-col items-center">
                        <div className="text-6xl font-extrabold text-card-secondary">02</div>
                        <h3 className="mt-2 text-xl font-semibold text-text-primary">Add Context</h3>
                        <p className="mt-2 text-text-secondary">Paste the URL to the job posting or university program page. Our AI will analyze it to find key details.</p>
                    </div>
                     <div className="relative flex flex-col items-center">
                        <div className="text-6xl font-extrabold text-card-secondary">03</div>
                        <h3 className="mt-2 text-xl font-semibold text-text-primary">Generate & Refine</h3>
                        <p className="mt-2 text-text-secondary">Click generate! Your tailored letter appears in seconds. Edit it on the spot and download as a PDF.</p>
                    </div>
                </div>
            </section>

            {/* --- Features Section --- */}
            <section className="bg-card/50 p-8 rounded-lg shadow-lg">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-cyan-300 mb-12">A Smarter Way to Write</h2>
                    <div className="grid md:grid-cols-3 gap-10 text-center">
                        <div className="flex flex-col items-center">
                            <FeatureIcon path="M13 10V3L4 14h7v7l9-11h-7z" />
                            <h3 className="mt-5 text-lg font-semibold text-text-primary">Beat The System</h3>
                            <p className="mt-2 text-text-secondary">Our AI reads job descriptions to include relevant keywords, helping your application get past automated screening tools (ATS).</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <FeatureIcon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            <h3 className="mt-5 text-lg font-semibold text-text-primary">Instant Research Assistant</h3>
                            <p className="mt-2 text-text-secondary">Provide a university program URL, and our AI finds admission requirements, deadlines, and contact emails for you.</p>
                        </div>
                         <div className="flex flex-col items-center">
                            <FeatureIcon path="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <h3 className="mt-5 text-lg font-semibold text-text-primary">Total Control & Customization</h3>
                            <p className="mt-2 text-text-secondary">Provide custom instructions, control the tone, switch between formal letters and professional emails, and edit the final output freely.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* --- Who Is This For? --- */}
            <section>
                <h2 className="text-3xl font-bold text-center text-cyan-300 mb-12">Perfect For Every Professional Need</h2>
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                    <div className="bg-card/50 p-6 rounded-lg shadow-lg border border-border">
                        <FeatureIcon path="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="bg-cyan-500" />
                        <h3 className="mt-4 text-lg font-semibold text-text-primary">Job Seekers</h3>
                        <p className="mt-2 text-text-secondary">Craft tailored cover letters that catch the eye of recruiters and highlight your unique qualifications for any role.</p>
                    </div>
                    <div className="bg-card/50 p-6 rounded-lg shadow-lg border border-border">
                         <FeatureIcon path="M12 6.253v11.494m-9-5.747h18" className="bg-cyan-500" />
                        <h3 className="mt-4 text-lg font-semibold text-text-primary">Students</h3>
                        <p className="mt-2 text-text-secondary">Write compelling admission letters, scholarship applications, and formal inquiries to university departments with ease.</p>
                    </div>
                    <div className="bg-card/50 p-6 rounded-lg shadow-lg border border-border">
                         <FeatureIcon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="bg-cyan-500" />
                        <h3 className="mt-4 text-lg font-semibold text-text-primary">Professionals</h3>
                        <p className="mt-2 text-text-secondary">Quickly draft professional emails for networking, follow-ups, inquiries, or any formal communication you need.</p>
                    </div>
                </div>
            </section>


            {/* --- Testimonials Section --- */}
            <section>
                <h2 className="text-3xl font-bold text-center text-cyan-300 mb-12">What Our Users Say</h2>
                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <div className="bg-card/50 p-6 rounded-lg shadow-lg">
                        <p className="text-text-primary">"This tool saved me hours. I pasted my resume and a job link, and it produced a fantastic, relevant cover letter that I barely had to edit. Landed an interview the next day!"</p>
                        <p className="mt-4 font-bold text-text-primary">- Alex J., Software Engineer</p>
                    </div>
                    <div className="bg-card/50 p-6 rounded-lg shadow-lg">
                        <p className="text-text-primary">"The university analysis feature is a game-changer. It pulled all the application deadlines and requirements from a messy website in seconds. Highly recommend for any student."</p>
                        <p className="mt-4 font-bold text-text-primary">- Priya K., Prospective Student</p>
                    </div>
                     <div className="bg-card/50 p-6 rounded-lg shadow-lg">
                        <p className="text-text-primary">"As a freelancer, I need to send professional emails constantly. The email generation feature is amazing for drafting quick, well-worded inquiries and follow-ups. A huge time-saver."</p>
                        <p className="mt-4 font-bold text-text-primary">- Marco R., Freelance Designer</p>
                    </div>
                </div>
            </section>

             {/* --- FAQ Section --- */}
            <section>
                <h2 className="text-3xl font-bold text-center text-cyan-300 mb-12">Frequently Asked Questions</h2>
                <div className="max-w-3xl mx-auto">
                    <FaqItem question="Is my data safe and private?">
                        <p>Absolutely. Your privacy is our top priority. All the information you provide is processed in-memory for the sole purpose of generating your document. We do not store your personal data, resumes, or generated letters on our servers. Your session is private and ephemeral.</p>
                    </FaqItem>
                    <FaqItem question="Is this service really free?">
                        <p>Yes, the AI Letter Generator is completely free to use. Our goal is to provide a powerful tool that is accessible to everyone, from students to seasoned professionals.</p>
                    </FaqItem>
                    <FaqItem question="How accurate is the AI-generated content?">
                        <p>Our tool uses a state-of-the-art AI model to generate highly relevant and well-written content. However, it's an assistant, not a replacement for human oversight. We strongly recommend you review and personalize the generated letter to ensure it perfectly reflects your voice and meets the specific requirements of your application.</p>
                    </FaqItem>
                    <FaqItem question="What file types can I upload for my resume?">
                        <p>For the best analysis, you can upload your resume in .pdf, .docx, or .txt format. This allows our AI to extract the text and use it to tailor your letter with the highest accuracy.</p>
                    </FaqItem>
                </div>
            </section>

            {/* --- Final CTA Section --- */}
            <section className="text-center py-16">
                <h2 className="text-3xl font-bold text-text-primary">Ready to Elevate Your Application?</h2>
                <p className="mt-4 max-w-xl mx-auto text-text-secondary">Stop staring at a blank page. Let our AI be your personal career and admissions assistant.</p>
                <a href="/dashboard" className="mt-8 inline-block bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out">
                    Create My Letter Now
                </a>
            </section>
        </div>
    );
};

export default LandingPage;