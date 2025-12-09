import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../src/data/extractedExercises.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log("--- Audit Report ---");

const checkCourse = (courseName) => {
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

checkCourse("calculo i");
checkCourse("introduccion al calculo");
checkCourse("todos los ramos");
