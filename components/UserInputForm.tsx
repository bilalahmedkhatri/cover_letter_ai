import React from 'react';
import { UserData, JobDetails, AdmissionInfo } from '../types';
import { FriendlyError } from '../services/errorService';
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
  analysisError: FriendlyError | null;
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
      return <p className="text-text-secondary italic">Information not found</p>;
    }
    const items = text.split('\n').filter(line => line.trim() !== '');
    return (
      <ul className="list-disc list-inside space-y-1 text-text-primary">
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

  const inputStyle = "w-full bg-input-bg border border-border rounded-md px-3 py-2 text-text-primary placeholder-input-placeholder focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";
  const inputFileStyle = "w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600/20 file:text-indigo-300 hover:file:bg-indigo-600/30 cursor-pointer";
  const mainButtonSpinner = <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;


  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step 1 */}
      <section>
        <h2 className="text-xl font-bold text-accent mb-4 border-b border-border pb-2">Step 1: Your Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">What kind of letter do you need?</label>
            <div className="flex gap-2 rounded-md bg-card-secondary p-1">
              <button type="button" onClick={() => setUserData(p => ({...p, letterType: 'job'}))} className={`w-full py-2 text-sm rounded transition-colors ${userData.letterType === 'job' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-button-secondary-hover-bg/50'}`}>Job Application</button>
              <button type="button" onClick={() => setUserData(p => ({...p, letterType: 'university'}))} className={`w-full py-2 text-sm rounded transition-colors ${userData.letterType === 'university' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-button-secondary-hover-bg/50'}`}>University Admission</button>
            </div>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">Your Full Name</label>
            <input type="text" id="name" name="name" value={userData.name} onChange={handleUserChange} required className={inputStyle} placeholder="e.g., Jane Doe" />
          </div>
        </div>
      </section>

      {/* Step 2 */}
      <section>
        <h2 className="text-xl font-bold text-accent mb-4 border-b border-border pb-2">Step 2: Your Background</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-text-primary mb-2">Key Skills (Optional)</label>
            <textarea id="skills" name="skills" value={userData.skills} onChange={handleUserChange} rows={5} className={inputStyle} placeholder="e.g., Project Management, React, Data Analysis..."></textarea>
          </div>
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-text-primary mb-2">Work Experience Summary (Optional)</label>
            <textarea id="experience" name="experience" value={userData.experience} onChange={handleUserChange} rows={5} className={inputStyle} placeholder="Summarize your key roles and achievements."></textarea>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="resume" className="block text-sm font-medium text-text-primary mb-2">Upload Resume (Optional)</label>
            <input type="file" id="resume" name="resume" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" className={inputFileStyle} />
            <p className="text-xs text-text-secondary mt-1">Providing a resume helps the AI tailor the letter more accurately.</p>
          </div>
        </div>
      </section>
      
      {/* Step 3 */}
      <section>
        <h2 className="text-xl font-bold text-accent mb-4 border-b border-border pb-2">
            Step 3: {userData.letterType === 'job' ? 'Job Details' : 'University Program Details'}
        </h2>
        {userData.letterType === 'job' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
                <label htmlFor="url" className="block text-sm font-medium text-text-primary mb-2">Job Posting URL (Optional)</label>
                <input type="url" id="url" name="url" value={jobDetails.url} onChange={handleJobChange} className={inputStyle} placeholder="https://example.com/job-posting" />
            </div>
            <div>
                <label htmlFor="screenshot" className="block text-sm font-medium text-text-primary mb-2">Job Description Screenshot (Optional)</label>
                <input type="file" id="screenshot" name="screenshot" onChange={handleScreenshotChange} accept="image/*" className={inputFileStyle} />
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="universityUrl" className="block text-sm font-medium text-text-primary mb-2">University Program URL</label>
                    <input type="url" id="universityUrl" name="universityUrl" value={userData.universityUrl} onChange={handleUserChange} required className={inputStyle} placeholder="https://university.edu/program-page" />
                </div>
                 <div>
                    <label htmlFor="courseName" className="block text-sm font-medium text-text-primary mb-2">Specific Course Name (Optional)</label>
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
                <label htmlFor="universityAnalysisInstruction" className="block text-sm font-medium text-text-primary mb-2">Analysis Instructions (Optional)</label>
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
            <button type="button" onClick={onAnalyzeUrl} disabled={isAnalyzing || !userData.universityUrl} className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-button-secondary-bg hover:bg-button-secondary-hover-bg rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {isAnalyzing && <SmallLoadingSpinner />}
              {isAnalyzing ? 'Analyzing...' : 'Analyze URL for Admission Info'}
            </button>
            {analysisError && <p className="text-sm text-red-400 mt-4">{analysisError.message}</p>}
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
                <div className="mt-4 bg-card/50 p-4 rounded-lg border border-border space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg text-accent">Analysis Results</h3>
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
                        <strong className="font-medium text-text-primary flex items-center gap-2 mb-1">
                           Requirements
                           {admissionInfo.admissionRequirements.sourceUrl && <a href={admissionInfo.admissionRequirements.sourceUrl} target="_blank" rel="noopener noreferrer" title="View Source" className="text-indigo-400 hover:text-indigo-300"><ExternalLinkIcon className="w-4 h-4" /></a>}
                        </strong> 
                        {renderBulletedText(admissionInfo.admissionRequirements.text)}
                    </div>
                    <div>
                        <strong className="font-medium text-text-primary flex items-center gap-2 mb-1">
                            Deadlines
                            {admissionInfo.deadlines.sourceUrl && <a href={admissionInfo.deadlines.sourceUrl} target="_blank" rel="noopener noreferrer" title="View Source" className="text-indigo-400 hover:text-indigo-300"><ExternalLinkIcon className="w-4 h-4" /></a>}
                        </strong> 
                        {renderBulletedText(admissionInfo.deadlines.text)}
                    </div>
                    {admissionInfo.scholarships && (
                      <div>
                        <strong className="font-medium text-text-primary flex items-center gap-2 mb-1">
                            Scholarships
                            {admissionInfo.scholarships.sourceUrl && <a href={admissionInfo.scholarships.sourceUrl} target="_blank" rel="noopener noreferrer" title="View Source" className="text-indigo-400 hover:text-indigo-300"><ExternalLinkIcon className="w-4 h-4" /></a>}
                        </strong> 
                        {renderBulletedText(admissionInfo.scholarships.text)}
                      </div>
                    )}
                    {admissionInfo.emails && admissionInfo.emails.list.length > 0 && (
                      <div>
                        <strong className="font-medium text-text-primary flex items-center gap-2 mb-1">
                            Contact Emails
                             {admissionInfo.emails.sourceUrl && <a href={admissionInfo.emails.sourceUrl} target="_blank" rel="noopener noreferrer" title="View Source" className="text-indigo-400 hover:text-indigo-300"><ExternalLinkIcon className="w-4 h-4" /></a>}
                        </strong>
                        <ul className="list-disc list-inside space-y-1 text-text-primary">
                            {admissionInfo.emails.list.map((email, index) => (
                                <li key={index}>
                                    <a href={`mailto:${email.address}`} className="text-indigo-400 hover:underline">{email.address}</a>
                                    <span className="text-text-secondary text-sm"> ({email.description})</span>
                                </li>
                            ))}
                        </ul>
                      </div>
                    )}
                </div>
            )}
            {foundCourses.length > 0 && !admissionInfo && (
                <div className="mt-4 bg-card/50 p-4 rounded-lg border border-border">
                    <h3 className="font-semibold text-lg text-accent mb-2">Found Courses</h3>
                    <p className="text-sm text-text-secondary mb-2">We found multiple courses. Select one from your details or enter a name above and analyze again for specific details.</p>
                    <ul className="list-disc list-inside text-text-primary text-sm">{foundCourses.map(c => <li key={c}>{c}</li>)}</ul>
                </div>
            )}
          </div>
        )}
      </section>

      {/* Step 4 */}
      <section>
        <h2 className="text-xl font-bold text-accent mb-4 border-b border-border pb-2">Step 4: Customization (Optional)</h2>
        <div className="space-y-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Tone of Voice</label>
              <div className="flex flex-wrap gap-2 rounded-md bg-card-secondary p-1">
                {(['Professional', 'Formal', 'Enthusiastic', 'Concise'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setUserData(p => ({ ...p, tone: t }))}
                    className={`flex-1 py-2 text-sm rounded transition-colors min-w-[100px] ${userData.tone === t ? 'bg-indigo-600 text-white shadow' : 'hover:bg-button-secondary-hover-bg/50'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Document Format</label>
              <div className="flex gap-2 rounded-md bg-card-secondary p-1">
                  <button type="button" onClick={() => setUserData(p => ({...p, documentType: 'letter'}))} className={`w-full py-2 text-sm rounded transition-colors ${userData.documentType === 'letter' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-button-secondary-hover-bg/50'}`}>Formal Letter</button>
                  <button type="button" onClick={() => setUserData(p => ({...p, documentType: 'email'}))} className={`w-full py-2 text-sm rounded transition-colors ${userData.documentType === 'email' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-button-secondary-hover-bg/50'}`}>Professional Email</button>
              </div>
            </div>
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-text-primary mb-2">Language</label>
              <select id="language" name="language" value={userData.language} onChange={handleUserChange} className={inputStyle}>
                {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="customInstruction" className="block text-sm font-medium text-text-primary mb-2">
                Additional Instructions
              </label>
              <textarea
                id="customInstruction"
                name="customInstruction"
                value={userData.customInstruction}
                onChange={handleUserChange}
                rows={4}
                className={inputStyle}
                placeholder={
                  userData.documentType === 'email' && userData.letterType === 'university'
                    ? "e.g., Select from common reasons or write your own...\n" + emailReasonsForUniversity.join('\n')
                    : "e.g., 'Please highlight my experience with Agile methodologies.' or 'Keep the letter under 300 words.'"
                }
              />
            </div>
            <div>
                <label htmlFor="headerInfo" className="block text-sm font-medium text-text-primary mb-2">
                    {userData.documentType === 'email' ? 'Email Signature Details' : 'Letter Header/Contact Info'}
                </label>
                <textarea
                    id="headerInfo"
                    name="headerInfo"
                    value={userData.headerInfo}
                    onChange={handleUserChange}
                    rows={3}
                    className={inputStyle}
                    placeholder={
                        userData.documentType === 'email'
                        ? "e.g.,\nPhone: (123) 456-7890\nLinkedIn: linkedin.com/in/yourprofile"
                        : "e.g.,\n123 Main Street\nAnytown, USA 12345\n(123) 456-7890\njane.doe@email.com"
                    }
                />
            </div>
             <div>
                <label htmlFor="footerInfo" className="block text-sm font-medium text-text-primary mb-2">
                    {userData.documentType === 'email' ? 'Email Closing' : 'Letter Closing'}
                </label>
                <input
                    type="text"
                    id="footerInfo"
                    name="footerInfo"
                    value={userData.footerInfo}
                    onChange={handleUserChange}
                    className={inputStyle}
                    placeholder={
                        userData.documentType === 'email'
                        ? "e.g., Best regards,"
                        : "e.g., Sincerely,"
                    }
                />
            </div>
        </div>
      </section>

      {/* Submit Button */}
      <div className="pt-6 border-t border-border">
        <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all">
          {isLoading && mainButtonSpinner}
          {isLoading ? 'Generating...' : 'Generate My Letter'}
        </button>
      </div>
    </form>
  );
};

export default UserInputForm;