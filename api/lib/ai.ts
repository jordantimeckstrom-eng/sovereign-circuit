import { GoogleGenAI } from "@google/genai";

export function getAI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;

  if (!apiKey) throw new Error("Missing GEMINI_API_KEY or AI_INTEGRATIONS_GEMINI_API_KEY");

  const options: any = { apiKey };
  if (baseUrl) {
    options.httpOptions = { apiVersion: "", baseUrl };
  }

  return new GoogleGenAI(options);
}
