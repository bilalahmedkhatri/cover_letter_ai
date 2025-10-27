// services/analyticsService.ts

/**
 * Defines the types of events that can be tracked.
 * Using a specific type ensures consistency across the app.
 */
export type AnalyticsEvent =
  // User starts the generation process
  | { name: 'form_submit'; params: { letter_type: 'job' | 'university' } }
  // AI successfully generates a letter
  | { name: 'generate_letter_success'; params: { letter_type: 'job' | 'university', document_type: 'letter' | 'email' } }
  // AI fails to generate a letter
  | { name: 'generate_letter_failure'; params: { letter_type: 'job' | 'university', error_message: string } }
  // User downloads the generated letter as a PDF
  | { name: 'download_pdf'; params: {} }
  // User successfully analyzes a university URL
  | { name: 'analyze_url_success'; params: {} }
  // AI fails to analyze a university URL
  | { name: 'analyze_url_failure'; params: { error_message: string } }
  // User successfully extracts keywords
  | { name: 'extract_keywords_success'; params: {} }
  // AI fails to extract keywords
  | { name: 'extract_keywords_failure'; params: { error_message: string } }
  // User restores a previously saved session
  | { name: 'restore_session'; params: {} }
  // User successfully imports data from a LinkedIn PDF
  | { name: 'linkedin_import_success'; params: {} }
  // User fails to import data from a LinkedIn PDF
  | { name: 'linkedin_import_failure'; params: { error_message: string } }
  // User shares the generated letter image
  | { name: 'social_share'; params: { platform: 'linkedin' | 'twitter' | 'facebook' } };


/**
 * Sends an event to Google Analytics.
 * This function safely checks for the existence of the `gtag` function
 * before attempting to send an event, preventing errors if analytics
 * fails to load.
 *
 * @param event The event object, containing the event name and its parameters.
 */
export const trackEvent = (event: AnalyticsEvent): void => {
  // Check if the gtag function is available on the window object
  if (typeof window.gtag === 'function') {
    console.log(`[Analytics] Tracking Event: ${event.name}`, event.params);
    window.gtag('event', event.name, event.params);
  } else {
    // Log a warning if analytics is not available, which is useful for debugging.
    console.warn(`[Analytics] gtag not available. Event "${event.name}" not tracked.`);
  }
};
