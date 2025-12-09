
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock the JSON import
const jsonPath = path.join(__dirname, '../src/data/extractedExercises.json');
const extractedExercises = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Helper from frontend
const normalizeKey = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

const testCourse = "Cálculo I"; // Example input from frontend

console.log("--- Debugging Frontend Logic ---");
console.log(`Input Course: "${testCourse}"`);

const normalizedCourse = normalizeKey(testCourse);
console.log(`Normalized Course: "${normalizedCourse}"`);

console.log("Available Keys in JSON:", Object.keys(extractedExercises));

// Logic from ExerciseBank.jsx
const matchingKey = Object.keys(extractedExercises).find(k => {
    const normK = normalizeKey(k);
    const match = normalizedCourse.includes(normK) || normK.includes(normalizedCourse);
    if (match) console.log(`  Match found: "${normK}" matches "${normalizedCourse}"`);
    return match;
});

console.log(`Matching Key Found: "${matchingKey}"`);

if (matchingKey) {
    const exercises = extractedExercises[matchingKey];
    console.log(`Exercises count for ${matchingKey}: ${exercises ? exercises.length : 'undefined'}`);
} else {
    console.log("No matching key found.");
}

// Check fallback
const generalKey = Object.keys(extractedExercises).find(k => normalizeKey(k) === "todos los ramos");
console.log(`General Key Found: "${generalKey}"`);
if (generalKey) {
    console.log(`General Exercises count: ${extractedExercises[generalKey].length}`);
}
