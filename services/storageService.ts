import { SavedLetter } from '../types';

const STORAGE_KEY = 'ai-letter-generator-saved-letters';

/**
 * Retrieves all saved letters from localStorage.
 * @returns An array of SavedLetter objects.
 */
export const getSavedLetters = (): SavedLetter[] => {
  try {
    const savedItems = localStorage.getItem(STORAGE_KEY);
    return savedItems ? JSON.parse(savedItems) : [];
  } catch (error) {
    console.error("Failed to parse saved letters from localStorage", error);
    return [];
  }
};

/**
 * Saves a new letter to localStorage.
 * @param content The string content of the letter to save.
 * @returns The updated array of all saved letters.
 */
export const saveLetter = (content: string): SavedLetter[] => {
  const letters = getSavedLetters();
  const newLetter: SavedLetter = {
    id: Date.now(),
    content,
    date: new Date().toISOString(),
  };

  // Add the new letter to the beginning of the array
  const updatedLetters = [newLetter, ...letters];
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLetters));
  } catch (error) {
    console.error("Failed to save letter to localStorage", error);
  }

  return updatedLetters;
};

/**
 * Removes a letter from localStorage by its ID.
 * @param id The ID of the letter to remove.
 * @returns The updated array of remaining saved letters.
 */
export const removeLetter = (id: number): SavedLetter[] => {
  const letters = getSavedLetters();
  const updatedLetters = letters.filter(letter => letter.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLetters));
  } catch (error) {
    console.error("Failed to remove letter from localStorage", error);
  }

  return updatedLetters;
};
