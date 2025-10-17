import { SavedSession, UserData, JobDetails } from '../types';

const STORAGE_KEY = 'ai-letter-generator-saved-sessions';

/**
 * Retrieves all saved sessions from localStorage.
 * @returns An array of SavedSession objects.
 */
export const getSavedSessions = (): SavedSession[] => {
  try {
    const savedItems = localStorage.getItem(STORAGE_KEY);
    // When parsing, we need to handle the fact that `resume` is a File object
    // and won't be in the JSON. We reset it to null.
    const sessions = savedItems ? JSON.parse(savedItems) : [];
    return sessions.map((session: SavedSession) => ({
        ...session,
        userData: {
            ...session.userData,
            resume: null, // File objects cannot be stringified/parsed from JSON
        }
    }));
  } catch (error) {
    console.error("Failed to parse saved sessions from localStorage", error);
    return [];
  }
};

/**
 * Saves a new session to localStorage.
 * @param userData The user's input data.
 * @param jobDetails The job details input.
 * @param coverLetter The generated cover letter.
 * @returns The updated array of all saved sessions.
 */
export const saveSession = (userData: UserData, jobDetails: JobDetails, coverLetter: string): SavedSession[] => {
  const sessions = getSavedSessions();
  const newSession: SavedSession = {
    id: Date.now(),
    // Create a copy of userData without the File object for safe stringification
    userData: { ...userData, resume: null },
    jobDetails,
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