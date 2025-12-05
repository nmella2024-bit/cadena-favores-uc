
/**
 * Service to handle all AI interactions for Study Mode Pro.
 * Wraps the /api/ai endpoint.
 */

const API_URL = '/api/ai';

/**
 * Generic function to call the AI API.
 * @param {Object} payload - The JSON payload to send.
 * @returns {Promise<Object>} - The JSON response from the AI.
 */
async function callAI(payload) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error communicating with AI');
        }

        const data = await response.json();
        // The backend returns { content: string(json) } or just json depending on implementation
        // Our current api/ai.js returns { content: string } where string is the JSON
        if (data.content) {
            try {
                return JSON.parse(data.content);
            } catch (e) {
                console.error("Failed to parse AI response as JSON:", data.content);
                throw new Error("Invalid JSON response from AI");
            }
        }
        return data;
    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
}

export const studyAI = {
    /**
     * Generates a quiz based on topic and configuration.
     * @param {string} topic - The subject to study.
     * @param {string} contextText - Optional text content to base the quiz on.
     * @param {Object} config - { numQuestions, questionType, difficulty }
     */
    generateQuiz: async (topic, contextText, config) => {
        const prompt = `
            Genera un quiz sobre el tema: "${topic}".
            ${contextText ? `Basado en el siguiente contenido:\n${contextText.substring(0, 3000)}...` : ''}
            
            Configuración:
            - Dificultad: ${config.difficulty || 'Intermedio'}
            - Enfoque: ${config.focus || 'General'}
        `;

        return callAI({
            mode: 'quiz',
            prompt,
            config: {
                numQuestions: config.numQuestions || 5,
                questionType: config.questionType || 'mixed',
                difficulty: config.difficulty
            }
        });
    },

    /**
     * Grades an open-ended answer.
     * @param {string} question - The question asked.
     * @param {string} userAnswer - The user's answer.
     */
    gradeAnswer: async (question, userAnswer) => {
        const prompt = `
            Pregunta: "${question}"
            Respuesta del estudiante: "${userAnswer}"
        `;

        return callAI({
            mode: 'grade-open-answer',
            prompt
        });
    },

    /**
     * Generates a quiz specifically focused on weak topics.
     * @param {Array<string>} weakTopics - List of weak topics.
     */
    generateWeaknessQuiz: async (weakTopics) => {
        const topicsStr = weakTopics.join(', ');
        const prompt = `
            Genera un quiz correctivo enfocado ESPECÍFICAMENTE en estos temas débiles: ${topicsStr}.
            El objetivo es reforzar estas áreas.
        `;

        return callAI({
            mode: 'quiz',
            prompt,
            config: {
                numQuestions: 5,
                questionType: 'mixed',
                difficulty: 'Intermedio' // Standard difficulty for reinforcement
            }
        });
    }
};
