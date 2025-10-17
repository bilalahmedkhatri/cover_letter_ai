import { GoogleGenAI, Part } from "@google/genai";
import { UserData, JobDetails, AdmissionInfo } from '../types';

// NOTE: Your API key should be securely managed and not hardcoded.
// This implementation assumes the API key is available in the environment variables.
const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});

/**
 * Translates a generic error into a user-friendly, actionable message.
 * @param error The error object.
 * @returns A string containing a user-friendly error message.
 */
const getFriendlyErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('api key not valid') || message.includes('api_key')) {
      return "There's an issue with the AI service configuration. Please try again later or contact support if the problem persists.";
    }

    if (message.includes('rate limit') || message.includes('429')) {
      return "The service is currently experiencing high demand. Please wait a moment and try again.";
    }

    if (message.includes('safety') || message.includes('blocked')) {
      return "The request could not be processed due to content policies. Please adjust your input and try again, avoiding any potentially sensitive information.";
    }

    if (message.includes('failed to fetch') || message.includes('network')) {
        return "A network error occurred. Please check your internet connection and try again.";
    }
    
    // Fallback for other specific but non-actionable errors from the API
    return `An unexpected error occurred: ${error.message}. Please try again.`;
  }
  
  return "An unknown error occurred. Please refresh the page and try again.";
};


/**
 * Converts a File object to a GoogleGenAI.Part object.
 * @param file The file to convert.
 * @returns A promise that resolves to a Part object.
 */
const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // The result includes the data URL prefix, so we split it out.
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file as base64 string."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

/**
 * Generates a cover letter using the Gemini API based on user-provided data.
 * @param userData The user's personal and professional information.
 * @param jobDetails The details of the job application.
 * @returns A promise that resolves to the generated cover letter string.
 */
export const generateCoverLetter = async (userData: UserData, jobDetails: JobDetails): Promise<string> => {
  const {
    name,
    skills,
    experience,
    resume,
    language,
    customInstruction,
    letterType,
    headerInfo,
    footerInfo,
    universityUrl,
    courseName,
  } = userData;

  const parts: Part[] = [];

  // Start with a clear instruction for the model.
  let prompt = `Please act as a professional career advisor and write a compelling ${letterType === 'job' ? 'cover letter' : 'university admission letter'} in ${language}.`;
  
  prompt += `\n\nHere is information about me:\n`;
  prompt += `- Full Name: ${name}\n`;
  if (skills) prompt += `- Key Skills: ${skills}\n`;
  if (experience) prompt += `- Experience Summary: ${experience}\n`;

  if (letterType === 'job') {
    prompt += `\nI am applying for a job. Here are the details:\n`;
    if (jobDetails.url) prompt += `- Job Posting URL: ${jobDetails.url}\n`;
    if (jobDetails.screenshot) {
      prompt += `I have also provided a screenshot of the job description for more context.\n`;
      parts.push({
        inlineData: {
            mimeType: 'image/jpeg', 
            data: jobDetails.screenshot
        }
      });
    }
  } else { // university
    prompt += `\nI am applying for admission to a university. Here are the details:\n`;
    if (universityUrl) prompt += `- Program URL: ${universityUrl}\n`;
    if (courseName) prompt += `- Course Name: ${courseName}\n`;
  }
  
  if (resume) {
    prompt += `\nMy resume is attached. Please analyze it to extract relevant experiences, skills, and qualifications and incorporate them into the letter to make it as strong as possible.\n`;
    parts.push(await fileToGenerativePart(resume));
  }

  if (headerInfo) {
    prompt += `\nPlease use the following as the header/contact information section of the letter:\n${headerInfo}\n`;
  }
  if (footerInfo) {
    prompt += `\nPlease use the following for the closing of the letter:\n${footerInfo}\n`;
  } else {
    prompt += `\nPlease use a standard professional closing (e.g., "Sincerely,").\n`;
  }

  if (customInstruction) {
    prompt += `\nCrucially, follow these additional instructions: ${customInstruction}\n`;
  }

  prompt += `\nThe final letter should be tailored specifically to the opportunity, well-structured, professional, and enthusiastically highlight my suitability. Respond with only the letter text, without any extra commentary or formatting.`;
  
  parts.unshift({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: parts },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw new Error(getFriendlyErrorMessage(error));
  }
};

/**
 * Analyzes a university program webpage to extract admission details.
 * @param url The URL of the university program page.
 * @param courseName Optional specific course name to look for.
 * @param userInstruction Optional specific instructions for the analysis.
 * @returns A promise that resolves to an object containing admission details and a list of found courses.
 */
export const analyzeUniversityPage = async (url: string, courseName?: string, userInstruction?: string): Promise<{ details: AdmissionInfo | null; courses: string[] }> => {
  if (!url) {
    throw new Error("University URL is required for analysis.");
  }

  let prompt = `You are an expert admissions research assistant. Your task is to analyze the provided university URL and extract specific information.
  
  URL to analyze: ${url}
  
  Specific course of interest: "${courseName || 'General Admissions'}"
  
  Instructions:
  1.  Thoroughly browse the provided URL. If necessary, navigate to linked pages like "Admissions", "Tuition & Fees", or specific department pages to find the information.
  2.  If a specific course is named, focus your search on that. If not, analyze the general admission details.
  3.  If the page lists multiple courses, provide a list of all course names you can find.
  4.  Extract the following details for the course of interest (or general admissions):
      - program: The full, official name of the program.
      - department: The department or faculty offering the program.
      - admissionRequirements: A detailed summary of all requirements. Format this as a single string with each requirement on a new line (use '\\n').
      - deadlines: A detailed list of all relevant application deadlines. Format this as a single string with each deadline on a new line (use '\\n').`;

  if (userInstruction) {
    prompt += `\n\n**Crucially, follow these specific instructions from the user:** ${userInstruction}`;
  }
  
  prompt += `
  5.  Your final output MUST be a single, valid JSON object. Do not include any text, explanations, or markdown formatting like \`\`\`json\`\`\` before or after the JSON object.
  
  The JSON object should look like this:
  {
    "courses": ["Course Name 1", "Course Name 2"],
    "details": {
      "program": "B.S. in Computer Science",
      "department": "College of Engineering",
      "admissionRequirements": "Requirement 1...\\nRequirement 2...",
      "deadlines": "Early Action: Nov 1st...\\nRegular Decision: Jan 15th..."
    }
  }`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Using pro for better reasoning and web search
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}], 
        },
    });

    const responseText = response.text;
    
    let jsonString = responseText;
    
    const firstBracket = jsonString.indexOf('{');
    const lastBracket = jsonString.lastIndexOf('}');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        jsonString = jsonString.substring(firstBracket, lastBracket + 1);
    }
    
    const result = JSON.parse(jsonString);
    
    return {
        details: result.details || null,
        courses: result.courses || [],
    };
  } catch (error) {
    console.error("Error analyzing university page:", error);
    if (error instanceof SyntaxError) {
      throw new Error(`The AI couldn't structure the information from the URL. This can happen if the page is complex, protected (e.g., requires a login), or doesn't contain clear admission details. Please try a more specific URL, like a direct link to the program or admissions page.`);
    }
    // All other errors (API, network, etc.) go through the friendly helper
    throw new Error(getFriendlyErrorMessage(error));
  }
};