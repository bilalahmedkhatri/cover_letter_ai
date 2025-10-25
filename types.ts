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

export interface ExtractedKeyword {
  keyword: string;
  explanation: string;
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

// --- Global Type Declarations for CDN Scripts ---

// This interface defines the shape of a jsPDF *instance*.
interface jsPDF {
  internal: {
    pageSize: {
      height: number;
      width: number;
    };
  };
  splitTextToSize(text: string, maxWidth: number): string[];
  addPage(): this;
  // Fix: Added the addImage method to the jsPDF interface to match the library's API.
  addImage(imageData: string, format: string, x: number, y: number, width: number, height: number): this;
  text(text: string | string[], x: number, y: number, options?: any): this;
  setFont(fontName: string, fontStyle: string): this;
  setFontSize(size: number): this;
  save(filename: string): void;
  autoTable: (options: any) => this; // For jspdf-autotable plugin
}

// This interface defines the jsPDF *constructor*.
interface jsPDFConstructor {
    new(options?: any): jsPDF;
}

// Global window interface for all dynamically loaded scripts
declare global {
  interface Window {
    mammoth: any; // From mammoth.js for .docx parsing
    pdfjsLib: any; // From pdf.js for .pdf parsing
    jspdf: {
      jsPDF: jsPDFConstructor;
    };
    html2canvas: (element: HTMLElement, options?: Partial<any>) => Promise<HTMLCanvasElement>;
  }
}
