import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AdmissionInfo, ExtractedKeyword } from '../types';
import { FriendlyError } from '../services/errorService';

interface GenerationContextType {
  coverLetter: string;
  setCoverLetter: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: FriendlyError | null;
  setError: React.Dispatch<React.SetStateAction<FriendlyError | null>>;
  
  isAnalyzing: boolean;
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
  analysisError: FriendlyError | null;
  setAnalysisError: React.Dispatch<React.SetStateAction<FriendlyError | null>>;
  admissionInfo: AdmissionInfo | null;
  setAdmissionInfo: React.Dispatch<React.SetStateAction<AdmissionInfo | null>>;
  foundCourses: string[];
  setFoundCourses: React.Dispatch<React.SetStateAction<string[]>>;
  analysisNotes: string;
  setAnalysisNotes: React.Dispatch<React.SetStateAction<string>>;
  
  extractedKeywords: ExtractedKeyword[];
  setExtractedKeywords: React.Dispatch<React.SetStateAction<ExtractedKeyword[]>>;
  isExtractingKeywords: boolean;
  setIsExtractingKeywords: React.Dispatch<React.SetStateAction<boolean>>;
  keywordError: FriendlyError | null;
  setKeywordError: React.Dispatch<React.SetStateAction<FriendlyError | null>>;
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export const GenerationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<FriendlyError | null>(null);
  const [admissionInfo, setAdmissionInfo] = useState<AdmissionInfo | null>(null);
  const [foundCourses, setFoundCourses] = useState<string[]>([]);
  const [analysisNotes, setAnalysisNotes] = useState('');

  const [extractedKeywords, setExtractedKeywords] = useState<ExtractedKeyword[]>([]);
  const [isExtractingKeywords, setIsExtractingKeywords] = useState(false);
  const [keywordError, setKeywordError] = useState<FriendlyError | null>(null);

  return (
    <GenerationContext.Provider
      value={{
        coverLetter, setCoverLetter,
        isLoading, setIsLoading,
        error, setError,
        isAnalyzing, setIsAnalyzing,
        analysisError, setAnalysisError,
        admissionInfo, setAdmissionInfo,
        foundCourses, setFoundCourses,
        analysisNotes, setAnalysisNotes,
        extractedKeywords, setExtractedKeywords,
        isExtractingKeywords, setIsExtractingKeywords,
        keywordError, setKeywordError
      }}
    >
      {children}
    </GenerationContext.Provider>
  );
};

export const useGeneration = () => {
  const context = useContext(GenerationContext);
  if (!context) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
};
