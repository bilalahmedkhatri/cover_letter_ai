import React from 'react';
import { UserData, JobDetails, AdmissionInfo } from '../types';
import { generateAnalysisReportPdf } from '../services/pdfService';
import SmallLoadingSpinner from './icons/SmallLoadingSpinner';
import InfoIcon from './icons/InfoIcon';
import DownloadIcon from './icons/DownloadIcon';
import ExternalLinkIcon from './icons/ExternalLinkIcon';


interface UserInputFormProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  jobDetails: JobDetails;
  setJobDetails: React.Dispatch<React.SetStateAction<JobDetails>>;
  onSubmit: () => void;
  isLoading: boolean;
  onAnalyzeUrl: () => void;
  isAnalyzing: boolean;
  analysisError: string;
  admissionInfo: AdmissionInfo | null;
  foundCourses: string[];
  analysisNotes: string;
}

const UserInputForm: React.FC<UserInputFormProps> = ({
  userData,
  setUserData,
  jobDetails,
  setJobDetails,
  onSubmit,
  isLoading,
  onAnalyzeUrl,
  isAnalyzing,
  analysisError,
  admissionInfo,
  foundCourses,
  analysisNotes,
}) => {

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleJobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJobDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      if (name === 'resume') {
        setUserData(prev => ({ ...prev, resume: files[0] }));
      }
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            const base64String = reader.result.split(',')[1];
            setJobDetails(prev => ({ ...prev, screenshot: base64String }));
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleDownloadAnalysisPdf = () => {
    if (!admissionInfo) return;
    generateAnalysisReportPdf(admissionInfo, foundCourses);
  };
  
  const renderBulletedText = (text: string) => {
    if (!text || text.toLowerCase() === 'information not found' || text.trim() === '') {
      return <p className="text-slate-400 italic">Information not found</p>;
    }
    const items = text.split('\n').filter(line => line.trim() !== '');
    return (
      <ul className="list-disc list-inside space-y-1 text-slate-300">
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    );
  };

  const languages = [
    "English", "Bulgarian", "Hungarian", "Spanish", "French", 
    "Arabic", "Dutch", "Russian", "Portuguese", "Slovak", "Polish"
  ];

  const emailReasonsForUniversity = [
    "Inquire about my application status.",
    "Ask a question about specific admission requirements.",
    "Inquire about available scholarship opportunities and the application process.",
    "Ask about the admission process for international students.",
    "Request to connect with a professor or faculty member in my department of interest.",
    "Inquire about scheduling a campus tour or virtual visit.",
    "Ask for more details about a specific course or program curriculum.",
    "Request information on application fee waivers.",
    "Inquire about the possibility of deferring my admission if accepted.",
    "Report a technical issue I'm experiencing with the application portal."
  ];

  const inputStyle = "w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";
  const inputFileStyle = "w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600/20 file:text-indigo-300 hover:file:bg-indigo-600/30 cursor-pointer";
  const mainButtonSpinner = <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;


  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step 1 */}
      <section>
        <h2 className="text-xl font-bold text-cyan-300 mb-4 border-b border-slate-700 pb-2">Step 1: Your Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">What kind of letter do you need?</label>
            <div className="flex gap-2 rounded-md bg-slate-900 p-1">
              <button type="button" onClick={() => setUserData(p => ({...p, letterType: 'job'}))} className={`w-full py-2 text-sm rounded transition-colors ${userData.letterType === 'job' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-slate-700/50'}`}>Job Application</button>
              <button type="button" onClick={() => setUserData(p => ({...p, letterType: 'university'}))} className={`w-full py-2 text-sm rounded transition-colors ${userData.letterType === 'university' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-slate-700/50'}`}>University Admission</button>
            </div>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Your Full Name</label>
            <input type="text" id="name" name="name" value={userData.name} onChange={handleUserChange} required className={inputStyle} placeholder="e.g., Jane Doe" />
          </div>
        </div>
      </section>

      {/* Step 2 */}
      <section>
        <h2 className="text-xl font-bold text-cyan-300 mb-4 border-b border-slate-700 pb-2">Step 2: Your Background</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-slate-300 mb-2">Key Skills (Optional)</label>
            <textarea id="skills" name="skills" value={userData.skills} onChange={handleUserChange} rows={5} className={inputStyle} placeholder="e.g., Project Management, React, Data Analysis..."></textarea>
          </div>
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-slate-300 mb-2">Work Experience Summary (Optional)</label>
            <textarea id="experience" name="experience" value={userData.experience} onChange={handleUserChange} rows={5} className={inputStyle} placeholder="Summarize your key roles and achievements."></textarea>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="resume" className="block text-sm font-medium text-slate-300 mb-2">Upload Resume (Optional)</label>
            <input type="file" id="resume" name="resume" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" className={inputFileStyle} />
            <p className="text-xs text-slate-400 mt-1">Providing a resume helps the AI tailor the letter more accurately.</p>
          </div>
        </div>
      </section>
      
      {/* Step 3 */}
      <section>
        <h2 className="text-xl font-bold text-cyan-300 mb-4 border-b border-slate-700 pb-2">
            Step 3: {userData.letterType === 'job' ? 'Job Details' : 'University Program Details'}
        </h2>
        {userData.letterType === 'job' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
                <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-2">Job Posting URL (Optional)</label>
                <input type="url" id="url" name="url" value={jobDetails.url} onChange={handleJobChange} className={inputStyle} placeholder="https://example.com/job-posting" />
            </div>
            <div>
                <label htmlFor="screenshot" className="block text-sm font-medium text-slate-300 mb-2">Job Description Screenshot (Optional)</label>
                <input type="file" id="screenshot" name="screenshot" onChange={handleScreenshotChange} accept="image/*" className={inputFileStyle} />
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="universityUrl" className="block text-sm font-medium text-slate-300 mb-2">University Program URL</label>
                    <input type="url" id="universityUrl" name="universityUrl" value={userData.universityUrl} onChange={handleUserChange} required className={inputStyle} placeholder="https://university.edu/program-page" />
                </div>
                 <div>
                    <label htmlFor="courseName" className="block text-sm font-medium text-slate-300 mb-2">Specific Course Name (Optional)</label>
                    {foundCourses && foundCourses.length > 0 ? (
                      <select
                        id="courseName"
                        name="courseName"
                        value={userData.courseName}
                        onChange={handleUserChange}
                        className={inputStyle}
                        aria-label="Select from courses found on the page"
                      >
                        <option value="">-- Select a course --</option>
                        {foundCourses.map(course => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        id="courseName"
                        name="courseName"
                        value={userData.courseName}
                        onChange={handleUserChange}
                        className={inputStyle}
                        placeholder="e.g., B.S. in Computer Science"
                      />
                    )}
                </div>
            </div>
            <div>
                <label htmlFor="universityAnalysisInstruction" className="block text-sm font-medium text-slate-300 mb-2">Analysis Instructions (Optional)</label>
                <textarea
                    id="universityAnalysisInstruction"
                    name="universityAnalysisInstruction"
                    value={userData.universityAnalysisInstruction}
                    onChange={handleUserChange}
                    rows={3}
                    className={inputStyle}
                    placeholder="e.g., 'Focus on finding the scholarship deadlines' or 'Check if they accept international students and find the language requirements.'"
                />
            </div>
            <button type="button" onClick={onAnalyzeUrl} disabled={isAnalyzing || !userData.universityUrl} className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {isAnalyzing && <SmallLoadingSpinner />}
              {isAnalyzing ? 'Analyzing...' : 'Analyze URL for Admission Info'}
            </button>
            {analysisError && <p className="text-sm text-red-400 mt-4">{analysisError}</p>}
            {analysisNotes && !analysisError && (
              <div className="mt-4 bg-amber-900/50 border border-amber-700 text-amber-300 text-sm rounded-lg p-3 flex items-start gap-3" role="alert">
                <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Analysis Note</h4>
                  <p className="leading-relaxed mt-1">{analysisNotes}</p>
                </div>
              </div>
            )}
            {admissionInfo && (
                <div className="mt-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg text-cyan-400">Analysis Results</h3>
                      <button
                        type="button"
                        onClick={handleDownloadAnalysisPdf}
                        className="flex items-center gap-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors text-xs font-medium"
                        aria-label="Download analysis as PDF"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                    <div>
                        <strong className="font-medium text-slate-300 flex items-center gap-2 mb-1">
                           Requirements
                           {admissionInfo.admissionRequirements.sourceUrl && <a href={admissionInfo.admissionRequirements.sourceUrl} target="_blank" rel="noopener noreferrer" title="View Source" className="text-indigo-400 hover:text-indigo-300"><ExternalLinkIcon className="w-4 h-4" /></a>}
                        </strong> 
                        {renderBulletedText(admissionInfo.admissionRequirements.text)}
                    </div>
                    <div>
                        <strong className="font-medium text-slate-300 flex items-center gap-2 mb-1">
                            Deadlines
                            {admissionInfo.deadlines.sourceUrl && <a href={admissionInfo.deadlines.sourceUrl} target="_blank" rel="noopener noreferrer" title="View Source" className="text-indigo-400 hover:text-indigo-300"><ExternalLinkIcon className="w-4 h-4" /></a>}
                        </strong> 
                        {renderBulletedText(admissionInfo.deadlines.text)}
                    </div>
                    {admissionInfo.scholarships && (
                      <div>
                        <strong className="font-medium text-slate-300 flex items-center gap-2 mb-1">
                            Scholarships
                            {admissionInfo.scholarships.sourceUrl && <a href={admissionInfo.scholarships.sourceUrl} target="_blank" rel="noopener noreferrer" title="View Source" className="text-indigo-400 hover:text-indigo-300"><ExternalLinkIcon className="w-4 h-4" /></a>}
                        </strong> 
                        {renderBulletedText(admissionInfo.scholarships.text)}
                      </div>
                    )}
                    {admissionInfo.emails && admissionInfo.emails.list.length > 0 && (
                      <div>
                        <strong className="font-medium text-slate-300 flex items-center gap-2 mb-1">
                            Contact Emails
                             {admissionInfo.emails.sourceUrl && <a href={admissionInfo.emails.sourceUrl} target="_blank" rel="noopener noreferrer" title="View Source" className="text-indigo-400 hover:text-indigo-300"><ExternalLinkIcon className="w-4 h-4" /></a>}
                        </strong>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                            {admissionInfo.emails.list.map((email, index) => (
                                <li key={index}>
                                    <a href={`mailto:${email.address}`} className="text-indigo-400 hover:underline">{email.address}</a>
                                    <span className="text-slate-400 text-sm"> ({email.description})</span>
                                </li>
                            ))}
                        </ul>
                      </div>
                    )}
                </div>
            )}
            {foundCourses.length > 0 && !admissionInfo && (
                <div className="mt-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="font-semibold text-lg text-cyan-400 mb-2">Found Courses</h3>
                    <p className="text-sm text-slate-400 mb-2">We found multiple courses. Select one from your details or enter a name above and analyze again for specific details.</p>
                    <ul className="list-disc list-inside text-slate-300 text-sm">{foundCourses.map(c => <li key={c}>{c}</li>)}</ul>
                </div>
            )}
          </div>
        )}
      </section>

      {/* Step 4 */}
      <section>
        <h2 className="text-xl font-bold text-cyan-300 mb-4 border-b border-slate-700 pb-2">Step 4: Customization (Optional)</h2>
        <div className="space-y-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Document Type</label>
              <div className="flex gap-2 rounded-md bg-slate-900 p-1">
                <button type="button" onClick={() => setUserData(p => ({...p, documentType: 'letter'}))} className={`w-full py-2 text-sm rounded transition-colors ${userData.documentType === 'letter' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-slate-700/50'}`}>Letter</button>
                <button type="button" onClick={() => setUserData(p => ({...p, documentType: 'email'}))} className={`w-full py-2 text-sm rounded transition-colors ${userData.documentType === 'email' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-slate-700/50'}`}>Email</button>
              </div>
            </div>

            {userData.documentType === 'email' && (
              <div className="bg-blue-900/50 border border-blue-700 text-blue-300 text-sm rounded-lg p-3 flex items-start gap-3" role="alert">
                <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Generate a high-quality email!</h4>
                  <p className="leading-relaxed mt-1">For the best results, please ensure you've filled out the previous steps. Use the "Additional Instructions" box below to describe the purpose of the email (e.g., "Write a follow-up email asking about the status of my application.").</p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="language" className="block text-sm font-medium text-slate-300 mb-2">Language</label>
                    <select id="language" name="language" value={userData.language} onChange={handleUserChange} className={inputStyle}>
                        {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                </div>
                
                {userData.letterType === 'university' && userData.documentType === 'email' && (
                  <div>
                    <label htmlFor="emailReason" className="block text-sm font-medium text-slate-300 mb-2">Common University Email Reasons</label>
                    <select 
                        id="emailReason" 
                        name="emailReason" 
                        onChange={(e) => {
                            if (e.target.value) {
                                setUserData(prev => ({ ...prev, customInstruction: e.target.value }));
                            }
                             e.target.value = ""; // Reset dropdown after selection
                        }}
                        className={inputStyle}
                        aria-label="Select a common reason to pre-fill the instructions below"
                    >
                        <option value="">-- Select to auto-fill instructions --</option>
                        {emailReasonsForUniversity.map((reason, index) => (
                            <option key={index} value={reason}>{reason}</option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="md:col-span-2">
                    <label htmlFor="customInstruction" className="block text-sm font-medium text-slate-300 mb-2">Additional Instructions</label>
                    <textarea id="customInstruction" name="customInstruction" value={userData.customInstruction} onChange={handleUserChange} rows={3} className={inputStyle} placeholder="e.g., 'Mention my passion for their company culture.' or 'Keep the tone more formal.'"></textarea>
                </div>
                {userData.documentType === 'letter' && (
                  <>
                    <div>
                        <label htmlFor="headerInfo" className="block text-sm font-medium text-slate-300 mb-2">Custom Header</label>
                        <textarea id="headerInfo" name="headerInfo" value={userData.headerInfo} onChange={handleUserChange} rows={4} className={inputStyle} placeholder="Your Name&#10;Your Address&#10;Your Contact Info"></textarea>
                    </div>
                    <div>
                        <label htmlFor="footerInfo" className="block text-sm font-medium text-slate-300 mb-2">Custom Footer</label>
                        <textarea id="footerInfo" name="footerInfo" value={userData.footerInfo} onChange={handleUserChange} rows={4} className={inputStyle} placeholder="e.g., Best regards," ></textarea>
                    </div>
                  </>
                )}
                 {userData.documentType === 'email' && (
                    <div className="md:col-span-2">
                        <label htmlFor="footerInfo" className="block text-sm font-medium text-slate-300 mb-2">Custom Closing</label>
                        <textarea id="footerInfo" name="footerInfo" value={userData.footerInfo} onChange={handleUserChange} rows={2} className={inputStyle} placeholder="e.g., Best regards," ></textarea>
                    </div>
                )}
            </div>
        </div>
      </section>

      {/* Submit */}
      <div className="pt-6 border-t border-slate-700">
        <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-3 text-lg font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? mainButtonSpinner : null}
            {isLoading ? 'Generating...' : `Generate ${userData.documentType === 'letter' ? 'Letter' : 'Email'}`}
        </button>
      </div>
    </form>
  );
};

export default UserInputForm;