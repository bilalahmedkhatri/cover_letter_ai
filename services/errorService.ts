/**
 * Translates a generic error into a user-friendly, actionable message based on its type and content.
 * This function centralizes error message logic for consistency across the application.
 * @param error The error object, which can be of any type.
 * @returns A string containing a user-friendly error message.
 */
export const getFriendlyErrorMessage = (error: unknown): string => {
  // Handle specific error types first, like JSON parsing errors
  if (error instanceof SyntaxError) {
    return `The AI couldn't structure the information from the URL. This can happen if the page is complex, protected (e.g., requires a login), or doesn't contain clear admission details. Please try a more specific URL, like a direct link to the program or admissions page.`;
  }

  // Handle general Error objects by inspecting their message
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // API Key or configuration issues
    if (message.includes('api key not valid') || message.includes('api_key')) {
      return "There's an issue with the AI service configuration. Please try again later or contact support if the problem persists.";
    }

    // Rate limiting or service overload
    if (message.includes('rate limit') || message.includes('429')) {
      return "The service is currently experiencing high demand. Please wait a moment and try again.";
    }

    // Content safety filters
    if (message.includes('safety') || message.includes('blocked')) {
      return "The request could not be processed due to content policies. Please adjust your input and try again, avoiding any potentially sensitive information.";
    }

    // Network connectivity issues
    if (message.includes('failed to fetch') || message.includes('network')) {
        return "A network error occurred. Please check your internet connection and try again.";
    }
    
    // Fallback for other specific but non-actionable errors from the API
    return `An unexpected error occurred: ${error.message}. Please try again.`;
  }
  
  // Final fallback for non-Error objects or unknown issues
  return "An unknown error occurred. Please refresh the page and try again.";
};
