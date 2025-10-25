// services/errorService.ts

export interface FriendlyError {
  message: string;
  isRetryable: boolean;
}

/**
 * Translates a generic error into a user-friendly, actionable message based on its type and content.
 * This function centralizes error message logic for consistency across the application.
 * @param error The error object, which can be of any type.
 * @returns An object containing a user-friendly error message and a retry flag.
 */
export const getFriendlyErrorMessage = (error: unknown): FriendlyError => {
  // Handle specific error types first, like JSON parsing errors
  if (error instanceof SyntaxError) {
    return {
      message: `The AI couldn't structure the information from the URL. This can happen if the page is complex, protected (e.g., requires a login), or doesn't contain clear admission details. Please try a more specific URL, like a direct link to the program or admissions page.`,
      isRetryable: false,
    };
  }

  // Handle general Error objects by inspecting their message
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Custom error for LinkedIn parsing
    if (message.includes('could not process the linkedin pdf')) {
        return {
            message: error.message, // This message is already user-friendly
            isRetryable: true,
        };
    }

    // Location-based errors
    if (message.includes('user location is not supported')) {
      return {
        message: "It seems your current location is not supported for API use. We recommend trying again with a VPN.",
        isRetryable: false,
      };
    }
    
    // API Key or configuration issues
    if (message.includes('api key not valid') || message.includes('api_key')) {
      return {
        message: "There's an issue with the AI service configuration. Please try again later or contact support if the problem persists.",
        isRetryable: false,
      };
    }

    // Rate limiting or service overload
    if (message.includes('rate limit') || message.includes('429')) {
      return {
        message: "The service is currently experiencing high demand. Please wait a moment and try again.",
        isRetryable: true,
      };
    }

    // Content safety filters
    if (message.includes('safety') || message.includes('blocked')) {
      return {
        message: "The request could not be processed due to content policies. Please adjust your input and try again, avoiding any potentially sensitive information.",
        isRetryable: false,
      };
    }

    // Network connectivity issues
    if (message.includes('failed to fetch') || message.includes('network')) {
        return {
            message: "A network error occurred. Please check your internet connection and try again.",
            isRetryable: true,
        };
    }
    
    // Fallback for other specific but non-actionable errors from the API
    return {
        message: `An unexpected error occurred: ${error.message}. If the issue persists, please contact support at support@ailettergen.com with a screenshot of the error.`,
        isRetryable: true,
    };
  }
  
  // Final fallback for non-Error objects or unknown issues
  return {
    message: "An unknown error occurred. Please refresh the page and try again.",
    isRetryable: true,
  };
};