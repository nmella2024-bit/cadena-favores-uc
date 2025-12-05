/**
 * Service to handle AI interactions for Study Mode Pro
 * Optimized for efficiency, security, and lightweight requests.
 */

const API_URL = '/api/ai';

const studyAI = {
    /**
     * Generates a quiz based on topic and configuration.
     * @param {string} topic - The main topic for the quiz.
     * @param {object} config - Optional configuration (type, numQuestions, context).
     * @returns {Promise<object>} - The generated quiz data.
     */
    generateQuiz: async (topic, config = {}) => {
        try {
            // Enforce limits for performance
            const numQuestions = Math.min(config.numQuestions || 5, 10);
            const safeTopic = topic || "General Knowledge"; // Fallback topic

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'quiz',
                    prompt: `Generar quiz sobre ${safeTopic}`,
                    config: {
                        topic: safeTopic,
                        type: config.type || 'mixed',
                        numQuestions: numQuestions,
                        context: config.context || null,
                        ...config
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();

            // Safe parsing of content
            let content = data.content;
            if (typeof content === 'string') {
                try {
                    content = JSON.parse(content);
                } catch (e) {
                    console.error("Error parsing AI response:", e);
                    throw new Error("Invalid JSON format from AI");
                }
            }

            return content;
        } catch (error) {
            console.error('studyAI.generateQuiz Error:', error);
            throw error; // Re-throw to handle in UI
        }
    },

    /**
     * Grades an open-ended answer.
     * @param {string} question - The question text.
     * @param {string} userAnswer - The user's answer.
     * @returns {Promise<object>} - Grading result { score, strengths, mistakes, suggestions }.
     */
    gradeAnswer: async (question, userAnswer) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'grade-open-answer',
                    prompt: 'Grade answer',
                    question,
                    userAnswer
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();

            // Safe parsing
            let content = data.content;
            if (typeof content === 'string') {
                try {
                    content = JSON.parse(content);
                } catch (e) {
                    console.error("Error parsing grading response:", e);
                    throw new Error("Invalid JSON format from AI");
                }
            }

            return content;
        } catch (error) {
            console.error('studyAI.gradeAnswer Error:', error);
            throw error;
        }
    },

    /**
     * Generates a quiz specifically for weak topics.
     * @param {Array} weakTopics - Array of weak topic objects.
     * @returns {Promise<object>} - The generated reinforcement quiz.
     */
    generateWeaknessQuiz: async (weakTopics) => {
        if (!weakTopics || weakTopics.length === 0) {
            throw new Error("No weak topics provided for generation");
        }

        // Take top 3 weak topics to avoid context overload and keep it light
        const topicsStr = weakTopics.slice(0, 3).map(t => t.topic).join(', ');

        // Internal call to generateQuiz with specific "Reinforcement" config
        return studyAI.generateQuiz(`Refuerzo de: ${topicsStr}`, {
            numQuestions: 5,
            type: 'multiple-choice', // Multiple choice is faster/lighter for drills
            difficulty: 'Intermedio'
        });
    }
};

export { studyAI };
