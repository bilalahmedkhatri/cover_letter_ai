import { SavedSession, UserData, JobDetails, StructuredUserData } from '../types';

const STORAGE_KEY = 'ai-letter-generator-saved-sessions';

/**
 * Retrieves all saved sessions from localStorage with robust error handling.
 * @returns An array of SavedSession objects, or an empty array if storage is inaccessible or corrupted.
 */
export const getSavedSessions = (): SavedSession[] => {
  try {
    const savedItems = localStorage.getItem(STORAGE_KEY);
    if (savedItems) {
      // The parse call can also fail if data is corrupted
      return JSON.parse(savedItems);
    }
    return [];
  } catch (error) {
    console.warn("Could not access or parse localStorage. Saved sessions will not be available.", error);
    // If the error is due to corrupted data, try to clear it.
    if (error instanceof SyntaxError) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (removeError) {
        console.warn("Also failed to remove corrupted item from localStorage.", removeError);
      }
    }
    return [];
  }
};

/**
 * Saves a new session to localStorage with a structured, step-based format.
 * @param userData The user's input data.
 * @param jobDetails The job details input.
 * @param coverLetter The generated cover letter.
 * @returns The updated array of all saved sessions.
 */
export const saveSession = (userData: UserData, jobDetails: JobDetails, coverLetter: string): SavedSession[] => {
  const sessions = getSavedSessions();

  // Restructure the flat app state into the step-based format for storage.
  const structuredData: StructuredUserData = {
    step1: {
      letterType: userData.letterType,
      name: userData.name,
    },
    step2: {
      skills: userData.skills,
      experience: userData.experience,
    },
    step3: {
      jobDetails: jobDetails,
      universityDetails: {
        url: userData.universityUrl,
        courseName: userData.courseName,
        analysisInstruction: userData.universityAnalysisInstruction,
      },
    },
    step4: {
      tone: userData.tone,
      language: userData.language,
      documentType: userData.documentType,
      customInstruction: userData.customInstruction,
      headerInfo: userData.headerInfo,
      footerInfo: userData.footerInfo,
    },
  };

  const newSession: SavedSession = {
    id: Date.now(),
    structuredUserData: structuredData,
    coverLetter,
    date: new Date().toISOString(),
  };

  // Add the new session to the beginning of the array
  const updatedSessions = [newSession, ...sessions];
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.warn("Failed to save session to localStorage. Session will not persist.", error);
  }

  return updatedSessions;
};

/**
 * Removes a session from localStorage by its ID.
 * @param id The ID of the session to remove.
 * @returns The updated array of remaining saved sessions.
 */
export const removeSession = (id: number): SavedSession[] => {
  const sessions = getSavedSessions();
  const updatedSessions = sessions.filter(session => session.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.warn("Failed to update sessions in localStorage after removal. Change will not persist.", error);
  }

  return updatedSessions;
};