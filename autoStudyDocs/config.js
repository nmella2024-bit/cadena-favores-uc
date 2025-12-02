// Configuration for Auto Study Docs

// In a real production environment, this should be an environment variable.
// For this prototype, we will allow the user to input it in the UI or set it here.
export const AUTO_STUDY_CONFIG = {
    // Default model to use
    MODEL: 'gpt-4o-mini', // Cost-effective and fast

    // Max tokens for generation
    MAX_TOKENS: 4000,

    // Temperature for creativity vs determinism
    TEMPERATURE: 0.7,
};

export const getApiKey = () => {
    return localStorage.getItem('openai_api_key') || import.meta.env.VITE_OPENAI_API_KEY || '';
};

export const setApiKey = (key) => {
    localStorage.setItem('openai_api_key', key);
};
