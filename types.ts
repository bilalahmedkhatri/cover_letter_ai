export type LetterTone = 'Professional' | 'Formal' | 'Enthusiastic' | 'Concise';
export type Locale = 'en' | 'es' | 'fr' | 'ru' | 'nl' | 'pt' | 'ar';

export interface UserData {
  name: string;
  skills: string;
  experience: string;
  resume: File | null;
  language: string;
  customInstruction: string;
  letterType: 'job' | 'university';
  documentType: 'letter' | 'email';
  headerInfo: string;
  footerInfo: string;
  universityUrl: string;
  courseName: string;
  universityAnalysisInstruction: string;
  tone: LetterTone;
}

export interface JobDetails {
  url: string;
  screenshot: string | null; // base64 encoded string
}

export interface DetailWithSource {
  text: string;
  sourceUrl?: string;
}

export interface AdmissionInfo {
  admissionRequirements: DetailWithSource;
  deadlines: DetailWithSource;
  scholarships?: DetailWithSource;
  emails?: {
    list: { address: string; description: string }[];
    sourceUrl?: string;
  };
}


// New interfaces for structured, savable user data
export interface SavedStep1 {
  letterType: 'job' | 'university';
  name: string;
}

export interface SavedStep2 {
  skills: string;
  experience: string;
}

export interface SavedStep3 {
  jobDetails: JobDetails;
  universityDetails: {
    url: string;
    courseName: string;
    analysisInstruction: string;
  };
}

export interface SavedStep4 {
  tone: LetterTone;
  language: string;
  documentType: 'letter' | 'email';
  customInstruction: string;
  headerInfo: string;
  footerInfo: string;
}

export interface StructuredUserData {
    step1: SavedStep1;
    step2: SavedStep2;
    step3: SavedStep3;
    step4: SavedStep4;
}

// Updated SavedSession to use the new structured format
export interface SavedSession {
  id: number;
  structuredUserData: StructuredUserData;
  coverLetter: string;
  date: string;
}