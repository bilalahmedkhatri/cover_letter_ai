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


export interface SavedSession {
  id: number;
  userData: UserData;
  jobDetails: JobDetails;
  coverLetter: string;
  date: string;
}