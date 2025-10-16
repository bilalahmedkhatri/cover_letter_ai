export interface UserData {
  name: string;
  skills: string;
  experience: string;
  resume: File | null;
  language: string;
  customInstruction: string;
  letterType: 'job' | 'university';
  headerInfo: string;
  footerInfo: string;
  universityUrl: string;
  courseName: string;
}

export interface JobDetails {
  url: string;
  screenshot: string | null; // base64 encoded string
}

export interface AdmissionInfo {
  program: string;
  department: string;
  admissionRequirements: string;
  deadlines: string;
}
