import { SavedSession, UserData, JobDetails, StructuredUserData } from '../types';

const STORAGE_KEY = 'ai-letter-generator-saved-sessions';

/**
 * Retrieves all saved sessions from localStorage.
 * Now includes robust error handling for corrupted data.
 * @returns An array of SavedSession objects.
 */
export const getSavedSessions = (): SavedSession[] => {
  try {
    const savedItems = localStorage.getItem(STORAGE_KEY);
    // The new structure doesn't contain non-serializable objects like File.
    return savedItems ? JSON.parse(savedItems) : [];
  } catch (error) {
    console.error("Failed to parse saved sessions from localStorage. Clearing corrupted data.", error);
    // If parsing fails, it's safer to clear it to prevent the app from freezing.
    localStorage.removeItem(STORAGE_KEY);
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
    console.error("Failed to save session to localStorage", error);
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
    console.error("Failed to remove session from localStorage", error);
  }

  return updatedSessions;
};