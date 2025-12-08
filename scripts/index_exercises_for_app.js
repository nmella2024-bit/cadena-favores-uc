import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXPORTS_DIR = path.join(__dirname, '..', 'exports', 'ejercicios');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'extractedExercises.json');

// Helper to normalize strings: remove accents, lowercase
const normalizeKey = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

const indexExercises = () => {
    console.log('Indexing exercises...');

    if (!fs.existsSync(EXPORTS_DIR)) {
        console.error(`Exports directory not found: ${EXPORTS_DIR}`);
        return;
    }

    const index = {};

    // Walk through Course folders
    const courses = fs.readdirSync(EXPORTS_DIR).filter(f => fs.statSync(path.join(EXPORTS_DIR, f)).isDirectory());

    for (const course of courses) {
        console.log(`Processing course: ${course}`);
        // Use normalized key for the index
        const key = normalizeKey(course);
        index[key] = [];

        const exercisesDir = path.join(EXPORTS_DIR, course, 'ejercicios');
        if (fs.existsSync(exercisesDir)) {
            const files = fs.readdirSync(exercisesDir).filter(f => f.endsWith('.md'));

            for (const file of files) {
                const content = fs.readFileSync(path.join(exercisesDir, file), 'utf-8');
                // Simple parsing of ID and Number from filename: Ej_1_DummyPrueba_Ej1.md
                const parts = file.replace('.md', '').split('_');
                const number = parts[1];
                const id = parts.slice(2).join('_');

                index[key].push({
                    id: file.replace('.md', ''),
                    number: number,
                    content: content,
                    filename: file,
                    // Try to extract a title or summary from content? 
                    // For now, just use the first line or a generic title
                    title: `Ejercicio ${number}`,
                    originalCourse: course // Keep original name for reference
                });
            }
        }
    }

    // Ensure output dir exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
    console.log(`Index saved to ${OUTPUT_FILE}`);
    console.log(`Total courses indexed: ${Object.keys(index).length}`);
};

indexExercises();
