import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../src/data/extractedExercises.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log("Available keys in JSON:", Object.keys(data));

console.log("--- Audit Report ---");

const auditCourse = (courseName) => {
    const exercises = data[courseName] || [];
    console.log(`\nCourse: ${courseName}`);
    console.log(`Total Exercises: ${exercises.length}`);

    const topicCounts = {};
    exercises.forEach(ex => {
        topicCounts[ex.topic] = (topicCounts[ex.topic] || 0) + 1;
    });

    console.log("Topic Breakdown:");
    Object.entries(topicCounts).forEach(([topic, count]) => {
        console.log(`- ${topic}: ${count}`);
    });

    if (exercises.length > 0) {
        console.log("Sample Titles:");
        exercises.slice(0, 3).forEach(ex => console.log(`- ${ex.title} (${ex.topic})`));
    }
};

const courses = [
    "introduccion al calculo",
    "calculo i",
    "calculo ii",
    "calculo iii",
    "algebra lineal",
    "probabilidad y estadistica",
    "fisica: mecanica",
    "termodinamica",
    "finanzas",
    "quimica general",
    "electricidad y magnetismo",
    "todos los ramos"
];

courses.forEach(c => auditCourse(c));
