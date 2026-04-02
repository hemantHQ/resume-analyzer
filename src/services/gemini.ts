/// <reference types="vite/client" />
import { GoogleGenAI, Type, GenerateContentParameters } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  if (!aiClient) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("VITE_GEMINI_API_KEY is missing. Please set it in your environment variables.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function generateWithRetry(request: GenerateContentParameters, maxRetries = 3) {
  const ai = getAIClient();
  let attempt = 0;
  let currentModel = request.model;

  while (attempt < maxRetries) {
    try {
      request.model = currentModel;
      return await ai.models.generateContent(request);
    } catch (error: any) {
      attempt++;
      const errorMessage = error.message || String(error);
      const isOverloaded = errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE");
      const isRateLimited = errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED");

      if ((isOverloaded || isRateLimited) && attempt < maxRetries) {
        // Fallback to a lighter model if the main one is overloaded
        if (isOverloaded && currentModel === 'gemini-3-flash-preview') {
          currentModel = 'gemini-3.1-flash-lite-preview';
        }
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(`Gemini API Error (Attempt ${attempt}): ${errorMessage}. Retrying in ${Math.round(delay/1000)}s with model ${currentModel}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed after multiple retries due to high API demand.");
}

export interface AnalysisResult {
  score: number;
  detectedSkills: string[];
  extractedKeywords: string[];
  suggestions: string[];
  matchPercentage: number;
  missingSkills: string[];
  advancedSuggestions: { section: string; original: string; improved: string }[];
  sectionScores: { section: string; score: number; feedback: string }[];
  atsCompatibility: { score: number; feedback: string; issues: string[] };
  bestWebsitesToApply: { name: string; url: string; reason: string }[];
}

export async function analyzeResume(
  fileBase64: string,
  mimeType: string
): Promise<AnalysisResult> {
  const prompt = `You are an expert technical recruiter and resume analyzer.
I have attached a candidate's resume.
Analyze the resume and provide:
1. An overall resume quality score (0-100).
2. An industry match percentage (how well it fits standard industry expectations).
3. A list of detected skills in the resume.
4. A list of recommended missing skills (critical skills that are typically expected but missing).
5. A list of extracted keywords from the resume.
6. Basic suggestions for improvement.
7. Advanced AI suggestions (rewrite/improve content), providing the section, original text, and improved text.
8. Section-wise scoring (e.g., Experience, Education, Skills) with a score (0-100) and feedback for each.
9. ATS compatibility check with a score (0-100), feedback, and a list of issues.
10. Tell which websites or job boards are best to apply for based on this resume (provide name, url, and reason).`;

  try {
    const schemaProperties: any = {
      score: { type: Type.NUMBER, description: "Overall match score out of 100" },
      detectedSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Skills detected in the resume" },
      extractedKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords extracted from the resume" },
      suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Basic suggestions for improvement" },
      matchPercentage: { type: Type.NUMBER, description: "Industry match percentage" },
      missingSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Important skills missing from the resume" },
      advancedSuggestions: { 
        type: Type.ARRAY, 
        items: { 
          type: Type.OBJECT, 
          properties: {
            section: { type: Type.STRING },
            original: { type: Type.STRING },
            improved: { type: Type.STRING }
          }
        } 
      },
      sectionScores: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            section: { type: Type.STRING },
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING }
          }
        }
      },
      atsCompatibility: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          issues: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      },
      bestWebsitesToApply: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            url: { type: Type.STRING },
            reason: { type: Type.STRING }
          }
        }
      }
    };

    const requiredFields = [
      "score", "detectedSkills", "extractedKeywords", "suggestions",
      "matchPercentage", "missingSkills", "advancedSuggestions", 
      "sectionScores", "atsCompatibility", "bestWebsitesToApply"
    ];

    const response = await generateWithRetry({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: fileBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: schemaProperties,
          required: requiredFields
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Failed to generate analysis.");
    }

    return JSON.parse(text) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to analyze resume.");
  }
}

export interface ImprovedResumeData {
  name: string;
  profession: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: { company: string; role: string; duration: string; description: string }[];
  education: { school: string; degree: string; year: string }[];
  projects: { name: string; link: string; description: string }[];
}

export async function extractAndImproveResume(
  fileBase64: string,
  mimeType: string
): Promise<ImprovedResumeData> {
  const prompt = `You are an expert technical recruiter and resume writer.
I have attached a candidate's resume.
Extract the information from this resume and rewrite the professional summary, experience descriptions, and project descriptions to be highly impactful, ATS-friendly, and results-oriented. Use strong action verbs, quantify achievements where possible, and ensure the tone is highly professional to guarantee a high resume score.
Return a JSON object with the extracted and improved data.
For any missing fields (like profession or phone), leave them empty or infer a reasonable default.
Format the descriptions (summary, experience description, project description) using basic HTML tags like <b>, <i>, <u>, and <ul>/<li> for bullet points.`;

  try {
    const response = await generateWithRetry({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: fileBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            profession: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            summary: { type: Type.STRING },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company: { type: Type.STRING },
                  role: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  school: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  year: { type: Type.STRING }
                }
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  link: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            }
          },
          required: ["name", "profession", "email", "phone", "summary", "skills", "experience", "education", "projects"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Failed to generate improved resume.");
    }

    return JSON.parse(text) as ImprovedResumeData;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to improve resume.");
  }
}
