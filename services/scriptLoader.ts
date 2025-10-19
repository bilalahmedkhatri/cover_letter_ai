// A cache to store promises for scripts that are loading or have been loaded.
// This prevents the same script from being requested multiple times.
const loadedScripts: Record<string, Promise<void>> = {};

/**
 * Dynamically loads a script by creating a <script> tag and appending it to the document.
 * It returns a promise that resolves when the script has loaded.
 * Caches requests to prevent re-fetching the same script.
 * @param src The URL of the script to load.
 * @returns A promise that resolves on successful load and rejects on error.
 */
export const loadScript = (src: string): Promise<void> => {
  // If the script is already in the cache, return the existing promise.
  if (loadedScripts[src]) {
    return loadedScripts[src];
  }

  // Create a new promise for this script and store it in the cache.
  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true; // Ensure non-blocking load

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      // On error, reject the promise and remove it from the cache to allow for a retry.
      reject(new Error(`Failed to load script: ${src}`));
      delete loadedScripts[src];
    };

    document.body.appendChild(script);
  });

  loadedScripts[src] = promise;
  return promise;
};
