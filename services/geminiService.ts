
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

export const generateStory = async (): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Tell me a new ridiculous one-sentence story.",
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 1.0,
      },
    });

    return response.text?.trim() || "The story machine is currently daydreaming.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
