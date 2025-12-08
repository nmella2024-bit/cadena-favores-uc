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

const determineBestMatch = (content, title) => {
    // Normalize text for searching
    const text = (title + " " + content).toLowerCase();
    const normalizedText = normalizeKey(text);

    let bestMatch = null;
    let maxScore = 0;

    // Iterate over ALL courses and ALL topics
    for (const [course, topics] of Object.entries(SYLLABUS)) {
        for (const topic of topics) {
            // Create keywords from topic name
            const keywords = normalizeKey(topic).split(' ').filter(k => k.length > 3);
            if (keywords.length === 0) continue;

            let score = 0;
            keywords.forEach(k => {
                if (normalizedText.includes(k)) score++;
            });

            // Boost score if course name is mentioned
            if (normalizedText.includes(normalizeKey(course))) score += 2;

            if (score > maxScore) {
                maxScore = score;
                bestMatch = { course, topic };
            }
        }
    }

    return bestMatch;
};

const indexExercises = () => {
    console.log('Indexing exercises...');

    if (!fs.existsSync(EXPORTS_DIR)) {
        console.error(`Exports directory not found: ${EXPORTS_DIR}`);
        return;
    }

    const index = {};

    // Initialize index with all syllabus courses to ensure they exist
    Object.keys(SYLLABUS).forEach(course => {
        index[normalizeKey(course)] = [];
    });

    // Walk through ALL Course folders
    const sourceFolders = fs.readdirSync(EXPORTS_DIR).filter(f => fs.statSync(path.join(EXPORTS_DIR, f)).isDirectory());

    for (const sourceFolder of sourceFolders) {
        console.log(`Processing source folder: ${sourceFolder}`);
        const exercisesDir = path.join(EXPORTS_DIR, sourceFolder, 'ejercicios');

        if (fs.existsSync(exercisesDir)) {
            const files = fs.readdirSync(exercisesDir).filter(f => f.endsWith('.md'));

            for (const file of files) {
                const content = fs.readFileSync(path.join(exercisesDir, file), 'utf-8');
                const parts = file.replace('.md', '').split('_');
                const number = parts[1];
                const title = `Ejercicio ${number}`;

                // Determine best course and topic match
                const match = determineBestMatch(content, title);

                if (match && match.course !== "Todos los ramos") {
                    // Add to specific course
                    const key = normalizeKey(match.course);
                    index[key].push({
                        id: file.replace('.md', ''),
                        number: number,
                        content: content,
                        filename: file,
                        title: title,
                        topic: match.topic,
                        originalCourse: sourceFolder
                    });
                }

                // ALWAYS add to "Todos los ramos" as fallback/archive
                // But map it to a generic topic if possible
                const todosKey = normalizeKey("Todos los ramos");
                let genericTopic = "Material General";
                if (title.toLowerCase().includes("prueba") || content.toLowerCase().includes("prueba")) genericTopic = "Pruebas Anteriores";
                else if (title.toLowerCase().includes("guia") || content.toLowerCase().includes("guía")) genericTopic = "Guías de Ejercicios";
                else if (title.toLowerCase().includes("ayudantia") || content.toLowerCase().includes("ayudantía")) genericTopic = "Ayudantías";

                index[todosKey].push({
                    id: file.replace('.md', ''),
                    number: number,
                    content: content,
                    filename: file,
                    title: title,
                    topic: genericTopic,
                    originalCourse: sourceFolder
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
