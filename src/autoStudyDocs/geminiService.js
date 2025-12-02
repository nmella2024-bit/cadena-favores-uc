import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates content using Google Gemini API.
 * @param {string} apiKey - The user's API key.
 * @param {string} prompt - The full prompt including system instructions.
 * @returns {Promise<string>} - The generated text.
 */
export const callGeminiAI = async (apiKey, prompt) => {
    if (!apiKey) throw new Error("API Key is required for Gemini.");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error(`Gemini Error: ${error.message}`);
    }
};
