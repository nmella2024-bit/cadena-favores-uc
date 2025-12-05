/**
 * Service to handle AI interactions for Study Mode Pro
 */

const API_URL = '/api/ai';

/**
 * Generates a quiz based on topic and configuration
 */
export const generateQuiz = async (topic, config = {}) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: 'quiz',
                prompt: `Generar quiz sobre ${topic}`, // Fallback prompt
                config: {
                    topic,
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
};

/**
 * Grades an open-ended answer
 */
export const gradeAnswer = async (question, userAnswer) => {
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
};

/**
 * Generates a quiz specifically for weak topics
 */
export const generateWeaknessQuiz = async (weakTopics) => {
    const topicsStr = weakTopics.map(t => t.topic).join(', ');
    return generateQuiz(`Refuerzo de: ${topicsStr}`, {
        numQuestions: 5,
        questionType: 'multiple-choice',
        difficulty: 'Intermedio' // Could be adjusted based on user level
    });
};
