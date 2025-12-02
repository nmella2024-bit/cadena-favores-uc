import OpenAI from 'openai';
import { AUTO_STUDY_CONFIG, getApiKey } from '../config';

/**
 * Call OpenAI API to generate text based on prompt
 * @param {string} systemPrompt - The system instruction
 * @param {string} userPrompt - The user request including context
 * @returns {Promise<string>} - The generated text
 */
export const generateStudyContent = async (systemPrompt, userPrompt) => {
    const apiKey = getApiKey();

    if (!apiKey) {
        throw new Error('API Key no configurada. Por favor ingresa tu OpenAI API Key.');
    }

    const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Allowed for this client-side prototype
    });

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: AUTO_STUDY_CONFIG.MODEL,
            temperature: AUTO_STUDY_CONFIG.TEMPERATURE,
            max_tokens: AUTO_STUDY_CONFIG.MAX_TOKENS,
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error calling OpenAI:', error);
        throw new Error(`Error al generar contenido: ${error.message}`);
    }
};
