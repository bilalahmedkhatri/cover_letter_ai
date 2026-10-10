import puter from '@heyputer/puter.js';
import { 
  generateCoverLetter as geminiGenerateCoverLetter,
  extractKeywordsFromJob as geminiExtractKeywords,
  importLinkedInProfile as geminiImportLinkedIn,
  analyzeUniversityPage as geminiAnalyzeUniversity
} from './geminiService';
import { UserData, JobDetails, ExtractedKeyword, AdmissionInfo } from '../types';

/**
 * Unified AI service that prioritizes Puter.js and falls back to Gemini.
 * Security: Errors are handled silently to avoid leaking stack traces or sensitive info.
 */

export const PROVIDERS = {
  PUTER: 'puter',
  GEMINI: 'gemini'
};

/**
 * Generates a cover letter using a multi-provider waterfall strategy.
 */
export async function generateCoverLetterUnified(
  userData: UserData,
  jobDetails: JobDetails,
  keywords: string
): Promise<string> {
  try {
    const prompt = constructPrompt(userData, jobDetails, keywords);
    const response = await puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
    
    const content = response?.message?.content;
    if (content && typeof content === 'string') {
      return content;
    }
    throw new Error();
  } catch (error) {
    try {
      return await geminiGenerateCoverLetter(userData, jobDetails, keywords);
    } catch (fallbackError) {
      throw new Error('Service Unavailable');
    }
  }
}

/**
 * Extracts keywords using a multi-provider waterfall strategy.
 */
export async function extractKeywordsFromJobUnified(jobDetails: JobDetails): Promise<ExtractedKeyword[]> {
  try {
    const prompt = `Analyze this job description and return a JSON array of keywords. 
    Each object: {"keyword": "...", "explanation": "..."}.
    Job Info: ${jobDetails.url || 'See screenshot'}
    Only return JSON.`;

    const response = await puter.ai.chat(prompt, { 
      model: 'gpt-4o-mini',
    });

    const content = response?.message?.content;
    if (content && typeof content === 'string') {
      const trimmedContent = content.trim();
      const jsonStart = trimmedContent.indexOf('[');
      const jsonEnd = trimmedContent.lastIndexOf(']');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        return JSON.parse(trimmedContent.substring(jsonStart, jsonEnd + 1));
      }
    }
    throw new Error();
  } catch (error) {
    try {
      return await geminiExtractKeywords(jobDetails);
    } catch (fallbackError) {
      return [];
    }
  }
}

/**
 * Imports LinkedIn profile using a multi-provider waterfall strategy.
 */
export async function importLinkedInProfileUnified(file: File): Promise<{ skills: string; experience: string }> {
  try {
    // Puter.js doesn't have a direct PDF parser in the chat, 
    // but geminiService.ts handles text extraction before sending to AI.
    // However, geminiImportLinkedIn in geminiService.ts does both.
    // To keep it simple, we'll try the Gemini version first as it's optimized for this, 
    // or we can try to separate the logic.
    // For now, let's just wrap the existing gemini call but we could add Puter logic here if we extract text first.
    return await geminiImportLinkedIn(file);
  } catch (error) {
    throw new Error('Import failed');
  }
}

/**
 * Analyzes a university program webpage using a multi-provider waterfall strategy.
 * Prioritizes Gemini due to its specialized Google Search tool support.
 */
export async function analyzeUniversityPageUnified(
  url: string,
  courseName?: string,
  userInstruction?: string
): Promise<{ details: AdmissionInfo | null; courses: string[]; notes?: string }> {
  try {
    // We prioritize Gemini here because it has the specialized Google Search tool
    // which is critical for accurate university page analysis.
    return await geminiAnalyzeUniversity(url, courseName, userInstruction);
  } catch (error) {
    // If Gemini fails, we could potentially fallback to Puter if we had a way to fetch the page content,
    // but since analyzeUniversityPage is designed around web search, Gemini is the primary provider.
    throw error;
  }
}

/**
 * Helper to construct the prompt
 */
function constructPrompt(userData: UserData, jobDetails: JobDetails, keywords: string): string {
  const {
    name,
    skills,
    experience,
    language,
    customInstruction,
    letterType,
    documentType,
    headerInfo,
    footerInfo,
    universityUrl,
    courseName,
    tone,
  } = userData;

  const applicationContext = letterType === 'job' ? 'job application' : 'university admission letter';
  const toneInstruction = `The tone of the document MUST be **${tone}**.`;

  let prompt = `Act as a professional career advisor. Write a compelling ${documentType === 'email' ? 'professional email' : applicationContext} in ${language}. ${toneInstruction}\n\n`;
  
  prompt += `My Info:\n- Name: ${name}\n`;
  if (skills) prompt += `- Skills: ${skills}\n`;
  if (experience) prompt += `- Experience: ${experience}\n`;

  if (letterType === 'job') {
    if (jobDetails.url) prompt += `- Job URL: ${jobDetails.url}\n`;
    if (keywords) prompt += `- Incorporate these keywords: ${keywords}\n`;
  } else {
    if (universityUrl) prompt += `- Program URL: ${universityUrl}\n`;
    if (courseName) prompt += `- Course: ${courseName}\n`;
  }

  if (headerInfo) prompt += `\nHeader: ${headerInfo}`;
  if (footerInfo) prompt += `\nClosing: ${footerInfo}`;
  if (customInstruction) prompt += `\nSpecial Instructions: ${customInstruction}`;

  prompt += `\n\nReturn ONLY the ${documentType}. No chatter.`;

  return prompt;
}
