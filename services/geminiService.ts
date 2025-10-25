import { GoogleGenAI, Part, Type } from "@google/genai";
import { UserData, JobDetails, AdmissionInfo, ExtractedKeyword } from '../types';
import { loadScript } from './scriptLoader';

const MAMMOTH_URL = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.7.0/mammoth.browser.min.js';
const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js';
const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

// NOTE: Your API key should be securely managed and not hardcoded.
// This implementation assumes the API key is available in the environment variables.
const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});

/**
 * Extracts text content from a .docx file.
 * @param file The .docx file.
 * @returns A promise that resolves to the extracted text.
 */
const getTextFromDocx = async (file: File): Promise<string> => {
  await loadScript(MAMMOTH_URL);
  if (!window.mammoth) {
    throw new Error("Document parser library failed to load. Please try a different file format or refresh the page.");
  }
  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

/**
 * Extracts text content from a .pdf file.
 * @param file The .pdf file.
 * @returns A promise that resolves to the extracted text.
 */
const getTextFromPdf = async (file: File): Promise<string> => {
    await loadScript(PDFJS_URL);
    if (!window.pdfjsLib) {
      throw new Error("PDF parser library failed to load. Please try a different file format or refresh the page.");
    }
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map((item: any) => item.str).join(' ');
    }
    return text;
};


/**
 * Converts a File object to a GoogleGenAI.Part object for image files.
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
 * Parses a LinkedIn profile PDF to extract skills and work experience.
 * @param file The PDF file of the LinkedIn profile.
 * @returns A promise that resolves to an object containing skills and experience strings.
 */
export const importLinkedInProfile = async (file: File): Promise<{ skills: string; experience:string; }> => {
    const profileText = await getTextFromPdf(file);
    
    const prompt = `You are an expert HR data processor. Your task is to parse the unstructured text from a LinkedIn profile PDF and extract key information. The user wants to populate their 'skills' and 'experience' fields.

Analyze the following text and return a single, valid JSON object with two keys: "skills" and "experience".

1.  **skills**: Create a single comma-separated string of all the skills listed in the "Skills" section of the profile.
2.  **experience**: Create a well-formatted string summarizing the work experience. For each job, include the title, company, dates, and a brief summary of responsibilities or achievements. Use new lines to separate different job entries.

Do not include any text, explanation, or markdown formatting like \`\`\`json\`\`\` before or after the JSON.

Text to parse:
---
${profileText}
---
`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        skills: { 
                            type: Type.STRING,
                            description: 'A comma-separated string of skills.'
                        },
                        experience: { 
                            type: Type.STRING,
                            description: 'A summary of work experience, with new lines separating job entries.'
                        }
                    },
                    required: ['skills', 'experience']
                }
            }
        });
        
        let jsonString = response.text.trim();
        // Basic sanitization
        const firstBrace = jsonString.indexOf('{');
        const lastBrace = jsonString.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonString = jsonString.substring(firstBrace, lastBrace + 1);
        }
        
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error parsing LinkedIn profile:", error);
        throw new Error("The AI could not process the LinkedIn PDF. Please ensure it is a standard LinkedIn profile export and try again.");
    }
};


/**
 * Extracts relevant keywords from a job description URL or screenshot.
 * @param jobDetails The details of the job, including URL and/or screenshot.
 * @returns A promise that resolves to an array of keyword objects with explanations.
 */
export const extractKeywordsFromJob = async (jobDetails: JobDetails): Promise<ExtractedKeyword[]> => {
  if (!jobDetails.url && !jobDetails.screenshot) {
    return [];
  }

  const parts: Part[] = [];
  let prompt = `Act as an expert recruitment consultant. Your task is to analyze the provided job description and extract a concise list of the most important keywords. These keywords should represent key skills, technologies, qualifications, and responsibilities mentioned.

For each keyword, provide a brief, insightful explanation for why it was chosen, citing which aspect of the job description it relates to (e.g., "core responsibility", "required skill", "preferred qualification").

Return the result as a single, valid JSON array of objects. Do not include any text, explanation, or markdown formatting like \`\`\`json\`\`\` before or after the JSON. Each object in the array must have two keys: "keyword" and "explanation".

Example format:
[
  { "keyword": "Project Management", "explanation": "Identified as a core responsibility for overseeing project timelines and deliverables." },
  { "keyword": "Agile", "explanation": "The job description specifies experience with Agile methodologies as a key requirement." },
  { "keyword": "Data Analysis", "explanation": "Listed under 'preferred qualifications', indicating a valuable skill for this role." }
]

Analyze the following job description:\n`;

  if (jobDetails.url) {
    prompt += `- Job Posting URL: ${jobDetails.url}\n`;
  }
  if (jobDetails.screenshot) {
    prompt += `A screenshot of the job description is also provided for context.\n`;
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: jobDetails.screenshot
      }
    });
  }

  parts.unshift({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { 
                type: Type.STRING,
                description: 'A key skill, technology, or qualification.'
              },
              explanation: { 
                type: Type.STRING,
                description: 'A brief explanation of why this keyword is important for the job.'
              }
            },
            required: ['keyword', 'explanation']
          }
        },
        tools: jobDetails.url ? [{ googleSearch: {} }] : undefined,
      }
    });
    
    let jsonString = response.text.trim();
    // It's good practice to sanitize, even with schema, in case of minor non-compliance.
    const firstBracket = jsonString.indexOf('[');
    const lastBracket = jsonString.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        jsonString = jsonString.substring(firstBracket, lastBracket + 1);
    }
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error extracting keywords:", error);
    // Re-throw to be handled by the UI layer
    throw error;
  }
};


/**
 * Generates a cover letter using the Gemini API based on user-provided data.
 * @param userData The user's personal and professional information.
 * @param jobDetails The details of the job application.
 * @param keywords A string of comma-separated keywords extracted from the job description.
 * @returns A promise that resolves to the generated cover letter string.
 */
export const generateCoverLetter = async (userData: UserData, jobDetails: JobDetails, keywords: string): Promise<string> => {
  const {
    name,
    skills,
    experience,
    resume,
    language,
    customInstruction,
    letterType,
    documentType,
    headerInfo,
    footerInfo,
    universityUrl,
    courseName,
    tone,
  } = userData;

  const parts: Part[] = [];

  // Start with a clear instruction for the model.
  let prompt: string;
  const applicationContext = letterType === 'job' ? 'job application' : 'university admission letter';
  
  // High-priority instruction for tone.
  const toneInstruction = `The tone of the document MUST be **${tone}**. This is a strict and primary instruction. Ensure the entire response consistently reflects this tone.`;

  if (documentType === 'email') {
    prompt = `Please act as a professional career advisor and write a compelling and professional email in ${language} regarding a ${applicationContext}. ${toneInstruction} The email's specific purpose should be derived from the user's "Additional Instructions". Deeply analyze all provided context about the user and the application to make the email as effective and relevant as possible.`;
  } else { // default to 'letter'
    prompt = `Please act as a professional career advisor and write a compelling ${applicationContext} in ${language}. ${toneInstruction}`;
  }
  
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
     if (keywords) {
      prompt += `\n**Critical Requirement:** To ensure my application is optimized for Applicant Tracking Systems (ATS) and highly relevant, please strategically and naturally incorporate the following keywords throughout the letter: **${keywords}**. Do not just list them; weave them into the narrative of my skills and experience.\n`;
    }
  } else { // university
    prompt += `\nI am applying for admission to a university. Here are the details:\n`;
    if (universityUrl) prompt += `- Program URL: ${universityUrl}\n`;
    if (courseName) prompt += `- Course Name: ${courseName}\n`;
  }
  
  if (resume) {
    try {
        let resumeText = '';
        if (resume.type === 'application/pdf') {
            resumeText = await getTextFromPdf(resume);
        } else if (resume.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            resumeText = await getTextFromDocx(resume);
        } else if (resume.type === 'text/plain') {
             resumeText = await resume.text();
        }

        if (resumeText) {
             prompt += `\nHere is the full text of my resume. Please analyze it to extract relevant experiences, skills, and qualifications and incorporate them into the letter to make it as strong as possible:\n\n--- RESUME START ---\n${resumeText}\n--- RESUME END ---\n`;
        } else {
            // Fallback for unsupported file types, though less effective
            prompt += `\nMy resume is attached. Please analyze it if possible.\n`;
            parts.push(await fileToGenerativePart(resume));
        }
    } catch (e) {
         console.error("Error parsing resume file:", e);
         prompt += "\nThere was an error parsing my attached resume file.\n"
    }
  }

  if (documentType === 'email') {
      prompt += `\nRegarding the email's closing and signature:\n`;
      if (footerInfo) {
          prompt += `- Use this as the complimentary closing (the part before your name): "${footerInfo}"\n`;
      } else {
          prompt += `- Use a standard professional complimentary closing (e.g., "Best regards," or "Sincerely,").\n`;
      }
      
      prompt += `- The signature must start with the full name: ${name}.\n`;

      if (headerInfo) {
          prompt += `- Following the name, include these contact details in the signature:\n${headerInfo}\n`;
      }
  } else {
      if (headerInfo) {
        prompt += `\nPlease use the following as the header/contact information section of the letter:\n${headerInfo}\n`;
      }
      if (footerInfo) {
        prompt += `\nPlease use the following for the closing of the letter:\n${footerInfo}\n`;
      } else {
        prompt += `\nPlease use a standard professional closing (e.g., "Sincerely,").\n`;
      }
  }

  if (customInstruction) {
    prompt += `\nCrucially, follow these additional instructions: ${customInstruction}\n`;
  } else if (documentType === 'email') {
    prompt += `\n**Crucially, since no specific instructions were provided, write a general inquiry email asking about the status of the application.**\n`;
  }

  if (documentType === 'email') {
    prompt += `\nIMPORTANT: The final output must be a complete email. It must start with a subject line (e.g., "Subject: Application Follow-up - ${name}"). Respond with only the email text, without any extra commentary or formatting.`;
  } else {
    prompt += `\nThe final letter should be tailored specifically to the opportunity, well-structured, and highlight my suitability in the requested **${tone}** tone. Respond with only the letter text, without any extra commentary or formatting.`;
  }
  
  parts.unshift({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: { parts: parts },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw error;
  }
};

/**
 * Analyzes a university program webpage to extract admission details.
 * @param url The URL of the university program page.
 * @param courseName Optional specific course name to look for.
 * @param userInstruction Optional specific instructions for the analysis.
 * @returns A promise that resolves to an object containing admission details, a list of found courses, and any relevant notes from the analysis.
 */
export const analyzeUniversityPage = async (
    url: string, 
    courseName?: string, 
    userInstruction?: string
): Promise<{ details: AdmissionInfo | null; courses: string[]; notes?: string }> => {
  if (!url) {
    throw new Error("University URL is required for analysis.");
  }

  let prompt = `You are an expert admissions research assistant. Your task is to analyze the provided university URL and extract specific information with high accuracy, including the source URL for each piece of data.

  URL to analyze: ${url}
  
  Specific course of interest: "${courseName || 'General Admissions'}"
  
  Instructions:
  1.  Thoroughly browse the provided URL. Actively follow links that seem relevant to admissions, such as "How to Apply", "Prospective Students", "Admissions", "Tuition & Fees", "Scholarships", or specific department pages to find the information. Be persistent.
  2.  For each piece of information you find, you MUST provide the specific source URL where you found it.
  3.  **URL Validation Protocol (MANDATORY):** Before you include any URL in your final JSON response, you MUST internally verify it.
      - The URL must be publicly accessible and not behind a login wall.
      - The URL must return a successful status code (e.g., 200 OK).
      - It must NOT be a broken link (e.g., 404 Not Found).
      - It must lead directly to the page containing the specific information, not a generic homepage.
      - If a URL fails ANY of these checks, you MUST set the 'sourceUrl' value to null for that item. Do not provide broken or invalid links. This is a critical step for data quality.
  4.  If a specific course is named, focus your search on that. If not, analyze the general admission details.
  5.  If the page lists multiple courses, provide a list of all course names you can find.
  6.  Extract the following details. If a piece of information cannot be found after a thorough search, explicitly state "Information not found" in the "text" field and use null for "sourceUrl".
      - admissionRequirements: A detailed summary of all requirements. Format this as a single string with each requirement on a new line (use '\\n').
      - deadlines: A detailed list of all relevant application deadlines. Format this as a single string with each deadline on a new line (use '\\n').
      - scholarships: Find any information about scholarships available for this program. Summarize key details like eligibility and deadlines. Format as a single string with each point on a new line (use '\\n').
  7. Additionally, find all relevant contact email addresses. For each email, provide a brief description of its purpose based on the context from the website (e.g., 'Graduate Admissions', 'International Student Office', 'Computer Science Department', 'General Inquiry').`;

  if (userInstruction) {
    prompt += `\n\n**Crucially, follow these specific instructions from the user:** ${userInstruction}`;
  }
  
  prompt += `
  8.  Your final output MUST be a single, valid JSON object. Do not include any text, explanations, or markdown formatting like \`\`\`json\`\`\` before or after the JSON object.
  
  The JSON object should look like this:
  {
    "status": "success" | "partial" | "not_found",
    "notes": "A brief explanation if the status is not 'success'. For example, 'Could not find admission deadlines, but program details were clear.' or 'The page seems to be a general faculty page, not a specific program page.'",
    "courses": ["Course Name 1", "Course Name 2"],
    "details": {
      "admissionRequirements": { "text": "Requirement 1...\\nRequirement 2...", "sourceUrl": "https://university.edu/cs-requirements" },
      "deadlines": { "text": "Early Action: Nov 1st...\\nRegular Decision: Jan 15th...", "sourceUrl": "https://university.edu/cs-deadlines" },
      "scholarships": { "text": "Merit Scholarship: Details...\\nNeed-Based Grant: Details...", "sourceUrl": "https://university.edu/scholarships" },
      "emails": {
        "list": [
          { "address": "admissions@university.edu", "description": "General Inquiry" },
          { "address": "international.admissions@university.edu", "description": "International Student Office" }
        ],
        "sourceUrl": "https://university.edu/contact"
      }
    }
  }`;

  let result;
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
    
    // Sanitize the response to ensure it's valid JSON
    const firstBracket = jsonString.indexOf('{');
    const lastBracket = jsonString.lastIndexOf('}');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        jsonString = jsonString.substring(firstBracket, lastBracket + 1);
    }
    
    result = JSON.parse(jsonString);
    
  } catch (error) {
    console.error("Error analyzing university page:", error);
    throw error;
  }

  // Handle application-level "error" (i.e., AI couldn't find info) separately
  if (result.status === 'not_found') {
    throw new Error(result.notes || `The AI could not find relevant admission information on the provided URL. It might be a generic page or require a login.`);
  }

  return {
      details: result.details || null,
      courses: result.courses || [],
      notes: result.notes,
  };
};