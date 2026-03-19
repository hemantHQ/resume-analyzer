import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AnalysisResult {
  score: number;
  matchedSkills: string[];
  missingKeywords: string[];
  feedback: string;
}

export async function analyzeResume(
  fileBase64: string,
  mimeType: string,
  jobDescription: string
): Promise<AnalysisResult> {
  const prompt = `
You are an expert technical recruiter and resume analyzer.
I have attached a candidate's resume.
Analyze the resume against the following Job Description and provide:
1. An overall match score (0-100).
2. A list of matched skills (found in both).
3. A list of missing keywords (critical skills or requirements in the JD that are missing from the resume).
4. Brief, constructive feedback on how to improve the resume for this role.

Job Description:
${jobDescription}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
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
            score: { type: Type.NUMBER, description: "Overall match score out of 100" },
            matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Skills found in both resume and job description" },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Important keywords/skills from the job description missing in the resume" },
            feedback: { type: Type.STRING, description: "Constructive feedback on how to improve the resume for this specific role" }
          },
          required: ["score", "matchedSkills", "missingKeywords", "feedback"]
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
