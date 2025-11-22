import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
// Note: In a real scenario, ensure process.env.API_KEY is set.
// The prompt logic handles the API key requirement.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getRaceAnalysis = async (score: number, speedMax: number): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Race complete. (Configure API Key for AI commentary)";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a sarcastic and witty cyberpunk racing crew chief.
      The player just finished a race.
      Score: ${score} (distance traveled).
      Top Speed: ${Math.floor(speedMax * 200)} km/h.
      
      If the score is low (< 100), roast them gently.
      If the score is medium (100-500), give constructive criticism.
      If the score is high (> 500), praise them with cyber-slang.
      
      Keep it under 2 sentences.`,
    });
    
    return response.text || "Connection lost with Crew Chief...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Crew Chief radio static...";
  }
};
