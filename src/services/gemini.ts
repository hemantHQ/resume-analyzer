import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please set it in your environment variables.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export interface AnalysisResult {
  // Free & Pro
  score: number;
  detectedSkills: string[];
  extractedKeywords: string[];
  suggestions: string[];

  // Pro Only
  matchPercentage?: number;
  missingSkills?: string[];
  advancedSuggestions?: { section: string; original: string; improved: string }[];
  sectionScores?: { section: string; score: number; feedback: string }[];
  atsCompatibility?: { score: number; feedback: string; issues: string[] };
  bestWebsitesToApply?: { name: string; url: string; reason: string }[];
}

export async function analyzeResume(
  fileBase64: string,
  mimeType: string,
  jobDescription: string,
  isPro: boolean = false
): Promise<AnalysisResult> {
  const prompt = isPro 
    ? `You are an expert technical recruiter and resume analyzer.
I have attached a candidate's resume.
Analyze the resume against the following Job Description and provide:
1. An overall match score (0-100).
2. A match percentage vs the job description.
3. A list of detected skills in the resume.
4. A list of missing skills (critical skills or requirements in the JD that are missing from the resume).
5. A list of extracted keywords from the resume.
6. Basic suggestions for improvement.
7. Advanced AI suggestions (rewrite/improve content), providing the section, original text, and improved text.
8. Section-wise scoring (e.g., Experience, Education, Skills) with a score (0-100) and feedback for each.
9. ATS compatibility check with a score (0-100), feedback, and a list of issues.
10. Tell which websites are best to apply for this specific job (provide name, url, and reason).

Job Description:
${jobDescription}`
    : `You are an expert technical recruiter and resume analyzer.
I have attached a candidate's resume.
Analyze the resume and provide:
1. A basic resume score (out of 100).
2. A list of detected skills.
3. A list of extracted keywords.
4. 3-5 basic suggestions for improvement.`;

  try {
    const ai = getAIClient();
    
    const schemaProperties: any = {
      score: { type: Type.NUMBER, description: "Overall match score out of 100" },
      detectedSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Skills detected in the resume" },
      extractedKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords extracted from the resume" },
      suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Basic suggestions for improvement" }
    };

    const requiredFields = ["score", "detectedSkills", "extractedKeywords", "suggestions"];

    if (isPro) {
      schemaProperties.matchPercentage = { type: Type.NUMBER, description: "Match percentage vs job description" };
      schemaProperties.missingSkills = { type: Type.ARRAY, items: { type: Type.STRING }, description: "Important skills missing from the resume" };
      schemaProperties.advancedSuggestions = { 
        type: Type.ARRAY, 
        items: { 
          type: Type.OBJECT, 
          properties: {
            section: { type: Type.STRING },
            original: { type: Type.STRING },
            improved: { type: Type.STRING }
          }
        } 
      };
      schemaProperties.sectionScores = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            section: { type: Type.STRING },
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING }
          }
        }
      };
      schemaProperties.atsCompatibility = {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          issues: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      };
      schemaProperties.bestWebsitesToApply = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            url: { type: Type.STRING },
            reason: { type: Type.STRING }
          }
        }
      };
      requiredFields.push("matchPercentage", "missingSkills", "advancedSuggestions", "sectionScores", "atsCompatibility", "bestWebsitesToApply");
    }

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
