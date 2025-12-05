/**
 * Service to handle AI interactions for Study Mode Pro
 * Optimized for efficiency and lightweight requests.
 */

const API_URL = '/api/ai';

export const studyAI = {
    /**
     * Generates a quiz based on topic and configuration
     * @param {string} topic - The main topic for the quiz
     * @param {object} config - Optional configuration (type, numQuestions, context)
     */
    generateQuiz: async (topic, config = {}) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'quiz',
                    prompt: `Generar quiz sobre ${topic}`, // Fallback prompt
                    config: {
                        topic,
                        type: config.type || 'mixed',
                        numQuestions: config.numQuestions || 5, // Default to 5 for efficiency
                        context: config.context, // Pass context if available
                        ...config
                    }
                })
            });

            if (!response.ok) throw new Error('Error generating quiz');

            const data = await response.json();
            // Parse content if it's a string (API returns JSON string in content)
            const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
            return content;
        } catch (error) {
            console.error('Quiz Generation Error:', error);
            throw error;
        }
    },

    /**
     * Grades an open-ended answer
     * @param {string} question - The question text
     * @param {string} userAnswer - The user's answer
     */
    gradeAnswer: async (question, userAnswer) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'grade-open-answer',
                    prompt: 'Grade answer', // Fallback
                    question,
                    userAnswer
                })
            });

            if (!response.ok) throw new Error('Error grading answer');

            const data = await response.json();
            const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
            return content;
        } catch (error) {
            console.error('Grading Error:', error);
            throw error;
        }
    },

    /**
     * Generates a quiz specifically for weak topics
     * @param {Array} weakTopics - Array of weak topic objects
     */
    generateWeaknessQuiz: async (weakTopics) => {
        if (!weakTopics || weakTopics.length === 0) {
            throw new Error("No weak topics provided");
        }

        // Take top 3 weak topics to avoid context overload
        const topicsStr = weakTopics.slice(0, 3).map(t => t.topic).join(', ');

        return studyAI.generateQuiz(`Refuerzo de: ${topicsStr}`, {
            numQuestions: 5,
            type: 'multiple-choice', // MC is faster/lighter for weakness drills
            difficulty: 'Intermedio'
        });
    }
};
