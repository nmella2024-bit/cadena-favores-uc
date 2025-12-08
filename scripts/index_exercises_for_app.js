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

// Syllabus definition for topic tagging
const SYLLABUS = {
    "Introducción al Cálculo": [
        "Números Reales y Desigualdades", "Valor Absoluto", "Funciones: Dominio y Recorrido",
        "Composición de Funciones", "Funciones Inversas", "Trigonometría Básica"
    ],
    "Cálculo I": [
        "Límites y Continuidad", "Derivadas: Definición y Reglas", "Regla de la Cadena",
        "Derivación Implícita", "Aplicaciones: Máximos y Mínimos", "Teorema del Valor Medio",
        "Integrales Indefinidas"
    ],
    "Cálculo II": [
        "Técnicas de Integración", "Integrales Definidas y Áreas", "Volúmenes de Revolución",
        "Integrales Impropias", "Sucesiones y Series Numéricas", "Series de Potencias y Taylor",
        "Coordenadas Polares"
    ],
    "Cálculo III": [
        "Vectores y Geometría en el Espacio", "Funciones de Varias Variables", "Derivadas Parciales y Gradiente",
        "Optimización Multivariable (Lagrange)", "Integrales Dobles y Triples", "Campos Vectoriales",
        "Teoremas de Green, Stokes y Divergencia"
    ],
    "Álgebra Lineal": [
        "Matrices y Operaciones", "Determinantes e Inversa", "Sistemas de Ecuaciones Lineales",
        "Espacios Vectoriales y Subespacios", "Independencia Lineal y Bases", "Transformaciones Lineales",
        "Valores y Vectores Propios (Diagonalización)"
    ],
    "Probabilidad y Estadística": [
        "Probabilidad Condicional y Bayes", "Variables Aleatorias Discretas", "Variables Aleatorias Continuas",
        "Distribuciones (Normal, Binomial, Poisson)", "Teorema del Límite Central", "Intervalos de Confianza",
        "Pruebas de Hipótesis"
    ],
    "Física: Mecánica": [
        "Cinemática en 1D y 2D", "Leyes de Newton (Dinámica)", "Trabajo y Energía",
        "Conservación del Momento Lineal", "Dinámica de Rotación y Torque", "Gravitación Universal",
        "Oscilaciones y Ondas Mecánicas"
    ],
    "Todos los ramos": [
        "Material General", "Pruebas Anteriores", "Guías de Ejercicios", "Ayudantías"
    ]
};

const determineTopic = (content, title, courseName) => {
    // Normalize text for searching
    const text = (title + " " + content).toLowerCase();
    const normalizedText = normalizeKey(text);

    // Find matching course in syllabus (handle normalized keys)
    const courseKey = Object.keys(SYLLABUS).find(k => normalizeKey(k) === normalizeKey(courseName));
    if (!courseKey) return null;

    const topics = SYLLABUS[courseKey];
    let bestTopic = null;
    let maxScore = 0;

    for (const topic of topics) {
        // Create keywords from topic name
        // e.g. "Derivadas: Definición y Reglas" -> ["derivadas", "definicion", "reglas"]
        const keywords = normalizeKey(topic).split(' ').filter(k => k.length > 3);

        let score = 0;
        keywords.forEach(k => {
            if (normalizedText.includes(k)) score++;
        });

        if (score > maxScore) {
            maxScore = score;
            bestTopic = topic;
        }
    }

    return bestTopic || topics[0]; // Default to first topic if no match
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

                const title = `Ejercicio ${number}`;
                const topic = determineTopic(content, title, course);

                index[key].push({
                    id: file.replace('.md', ''),
                    number: number,
                    content: content,
                    filename: file,
                    title: title,
                    topic: topic, // Add tagged topic
                    originalCourse: course
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
