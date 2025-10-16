import React from 'react';
import { UserData, JobDetails, AdmissionInfo } from '../types';
import LoadingSpinner from './icons/LoadingSpinner';

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
  
  const renderBulletedText = (text: string) => {
    if (!text || text.toLowerCase() === 'not specified' || text.trim() === '') {
        return <p className="text-slate-400">Not specified</p>;
    }

    const items = text
        .split('\n')
        .map(line => line.trim().replace(/^[-*]\s*/, ''))
        .filter(line => line.length > 0);

    if (items.length <= 1 && !text.includes('\n')) {
         return <p className="text-slate-300">{text}</p>
    }

    return (
        <ul className="list-disc list-outside pl-5 space-y-1 text-slate-300">
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-cyan-300 border-b border-slate-700 pb-3">Your Information</h2>
      
      <div>
        <label htmlFor="letterType" className="block text-sm font-medium text-slate-300 mb-2">What kind of letter do you need?</label>
        <select
          id="letterType"
          name="letterType"
          value={userData.letterType}
          onChange={handleUserChange}
          className="w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="job">Job Application Cover Letter</option>
          <option value="university">University Admission Letter</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300">Full Name</label>
          <input type="text" name="name" id="name" value={userData.name} onChange={handleUserChange} className="mt-1 block w-full bg-slate-900/50 border-slate-700 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-slate-300">Language</label>
          <input type="text" name="language" id="language" value={userData.language} onChange={handleUserChange} className="mt-1 block w-full bg-slate-900/50 border-slate-700 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>
       <div>
        <label htmlFor="skills" className="block text-sm font-medium text-slate-300">Key Skills (comma separated)</label>
        <textarea id="skills" name="skills" rows={3} value={userData.skills} onChange={handleUserChange} className="mt-1 block w-full bg-slate-900/50 border-slate-700 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div>
        <label htmlFor="experience" className="block text-sm font-medium text-slate-300">Work Experience Summary</label>
        <textarea id="experience" name="experience" rows={5} value={userData.experience} onChange={handleUserChange} className="mt-1 block w-full bg-slate-900/50 border-slate-700 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div>
        <label htmlFor="resume" className="block text-sm font-medium text-slate-300">Resume (Optional)</label>
        <input type="file" name="resume" id="resume" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" className="mt-1 block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600" />
      </div>
      
      {userData.letterType === 'job' && (
        <div className="space-y-6 pt-6 border-t border-slate-700">
          <h3 className="text-xl font-semibold text-cyan-300">Job Details</h3>
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-slate-300">Job Posting URL</label>
            <input type="url" name="url" id="url" value={jobDetails.url} onChange={handleJobChange} className="mt-1 block w-full bg-slate-900/50 border-slate-700 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="screenshot" className="block text-sm font-medium text-slate-300">Job Description Screenshot (Optional)</label>
            <input type="file" name="screenshot" id="screenshot" onChange={handleScreenshotChange} accept="image/png, image/jpeg" className="mt-1 block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600" />
             {jobDetails.screenshot && <img src={`data:image/png;base64,${jobDetails.screenshot}`} alt="Screenshot preview" className="mt-2 rounded-md max-h-40" />}
          </div>
        </div>
      )}

      {userData.letterType === 'university' && (
        <div className="space-y-6 pt-6 border-t border-slate-700">
          <h3 className="text-xl font-semibold text-cyan-300">University Details</h3>
          <div>
            <label htmlFor="universityUrl" className="block text-sm font-medium text-slate-300">University Program URL</label>
            <div className="flex gap-2 mt-1">
              <input type="url" name="universityUrl" id="universityUrl" value={userData.universityUrl} onChange={handleUserChange} className="block w-full bg-slate-900/50 border-slate-700 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              <button type="button" onClick={onAnalyzeUrl} disabled={isAnalyzing || !userData.universityUrl} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {isAnalyzing ? <LoadingSpinner /> : 'Analyze'}
              </button>
            </div>
          </div>

          {analysisError && <p className="text-sm text-red-400">{analysisError}</p>}

          {foundCourses.length > 0 && (
             <div>
                <label htmlFor="courseName" className="block text-sm font-medium text-slate-300">Select a Course</label>
                <select id="courseName" name="courseName" value={userData.courseName} onChange={handleUserChange} className="mt-1 block w-full bg-slate-900/50 border-slate-700 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  {foundCourses.map(course => <option key={course} value={course}>{course}</option>)}
                </select>
             </div>
          )}

          {admissionInfo && (
            <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700 space-y-3 text-sm">
                <h4 className="font-bold text-slate-200">Analysis Results for: <span className="text-cyan-400">{admissionInfo.program || 'N/A'}</span></h4>
                <div>
                    <p><strong className="text-slate-400">Department:</strong> {admissionInfo.department || 'Not specified'}</p>
                </div>
                <div>
                    <strong className="text-slate-400 block mb-1">Requirements:</strong> 
                    {renderBulletedText(admissionInfo.admissionRequirements)}
                </div>
                <div>
                    <strong className="text-slate-400 block mb-1">Deadlines:</strong>
                    {renderBulletedText(admissionInfo.deadlines)}
                </div>
            </div>
          )}
          
        </div>
      )}

      <div className="space-y-6 pt-6 border-t border-slate-700">
         <h3 className="text-xl font-semibold text-cyan-300">Advanced Options</h3>
         <div>
            <label htmlFor="headerInfo" className="block text-sm font-medium text-slate-300">Header / Contact Info</label>
            <textarea id="headerInfo" name="headerInfo" rows={3} value={userData.headerInfo} onChange={handleUserChange} placeholder="e.g. Your Name&#10;123 Main St, Anytown, USA&#10;your.email@example.com" className="mt-1 block w-full bg-slate-900/50 border-slate-700 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
         </div>
         <div>
            <label htmlFor="footerInfo" className="block text-sm font-medium text-slate-300">Footer / Closing</label>
            <textarea id="footerInfo" name="footerInfo" rows={2} value={userData.footerInfo} onChange={handleUserChange} placeholder="e.g. Sincerely," className="mt-1 block w-full bg-slate-900/50 border-slate-700 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
         </div>
         <div>
            <label htmlFor="customInstruction" className="block text-sm font-medium text-slate-300">Custom Instructions</label>
            <textarea id="customInstruction" name="customInstruction" rows={3} value={userData.customInstruction} onChange={handleUserChange} placeholder="e.g. 'Make the tone more casual', 'Mention my passion for AI specifically'" className="mt-1 block w-full bg-slate-900/50 border-slate-700 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
         </div>
      </div>
      
      <div className="pt-5">
        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? <><LoadingSpinner /> <span className="ml-2">Generating...</span></> : 'Generate Letter'}
        </button>
      </div>

    </form>
  );
};

export default UserInputForm;