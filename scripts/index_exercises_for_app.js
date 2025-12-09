import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXPORTS_DIR = path.join(__dirname, '..', 'exports', 'ejercicios');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'extractedExercises.json');

// Syllabus Data (Synchronized with Frontend)
const SYLLABUS = {
    "Cálculo I": {
        topics: ["Números Reales", "Sucesiones", "Límites", "Continuidad", "Derivadas", "Aplicaciones de la Derivada", "Integrales"],
        bg: "bg-blue-100 dark:bg-blue-900/30",
        color: "text-blue-600 dark:text-blue-400",
        icon: "Calculator"
    },
    "Cálculo II": {
        topics: ["Integración", "Series", "Ecuaciones Diferenciales", "Coordenadas Polares", "Vectores"],
        bg: "bg-indigo-100 dark:bg-indigo-900/30",
        color: "text-indigo-600 dark:text-indigo-400",
        icon: "FunctionSquare"
    },
    "Cálculo III": {
        topics: ["Vectores y Geometría en el Espacio", "Funciones Vectoriales", "Derivadas Parciales", "Integrales Múltiples", "Cálculo Vectorial"],
        bg: "bg-purple-100 dark:bg-purple-900/30",
        color: "text-purple-600 dark:text-purple-400",
        icon: "Box"
    },
    "Álgebra Lineal": {
        topics: ["Matrices", "Sistemas de Ecuaciones", "Espacios Vectoriales", "Transformaciones Lineales", "Valores y Vectores Propios", "Ortogonalidad"],
        bg: "bg-orange-100 dark:bg-orange-900/30",
        color: "text-orange-600 dark:text-orange-400",
        icon: "Grid"
    },
    "Ecuaciones Diferenciales": {
        topics: ["Ecuaciones de Primer Orden", "Ecuaciones Lineales de Orden Superior", "Transformada de Laplace", "Sistemas de Ecuaciones Diferenciales", "Series de Potencias"],
        bg: "bg-teal-100 dark:bg-teal-900/30",
        color: "text-teal-600 dark:text-teal-400",
        icon: "Activity"
    },
    "Probabilidad y Estadística": {
        topics: ["Probabilidad", "Variables Aleatorias", "Distribuciones de Probabilidad", "Inferencia Estadística", "Regresión Lineal", "Probabilidad Condicional y Bayes"],
        bg: "bg-green-100 dark:bg-green-900/30",
        color: "text-green-600 dark:text-green-400",
        icon: "BarChart3"
    },
    "Física: Mecánica": {
        topics: ["Cinemática", "Dinámica", "Trabajo y Energía", "Momento Lineal", "Rotación", "Gravitación", "Oscilaciones"],
        bg: "bg-red-100 dark:bg-red-900/30",
        color: "text-red-600 dark:text-red-400",
        icon: "Atom"
    },
    "Termodinámica": {
        topics: ["Temperatura y Calor", "Primera Ley", "Segunda Ley", "Entropía", "Gases Ideales", "Procesos Termodinámicos"],
        bg: "bg-orange-100 dark:bg-orange-900/30",
        color: "text-orange-600 dark:text-orange-400",
        icon: "Flame"
    },
    "Electricidad y Magnetismo": {
        topics: ["Ley de Coulomb y Campo Eléctrico", "Ley de Gauss", "Potencial Eléctrico", "Capacitancia", "Circuitos DC y Ley de Ohm", "Campo Magnético", "Inducción Electromagnética"],
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        color: "text-yellow-600 dark:text-yellow-400",
        icon: "Zap"
    },
    "Química General": {
        topics: ["Estequiometría", "Estructura Atómica", "Enlace Químico", "Gases", "Termoquímica", "Equilibrio Químico", "Ácido-Base"],
        bg: "bg-pink-100 dark:bg-pink-900/30",
        color: "text-pink-600 dark:text-pink-400",
        icon: "FlaskConical"
    },
    "Programación": {
        topics: ["Variables y Tipos de Datos", "Control de Flujo", "Funciones", "Listas y Tuplas", "Diccionarios", "Archivos", "Clases y Objetos"],
        bg: "bg-slate-100 dark:bg-slate-800",
        color: "text-slate-600 dark:text-slate-400",
        icon: "Terminal"
    },
    "Estática y Dinámica": {
        topics: ["Vectores Fuerza", "Equilibrio de una Partícula", "Equilibrio de un Cuerpo Rígido", "Análisis Estructural", "Fricción", "Cinemática de Partículas", "Cinética de Partículas"],
        bg: "bg-cyan-100 dark:bg-cyan-900/30",
        color: "text-cyan-600 dark:text-cyan-400",
        icon: "Anchor"
    },
    "Introducción a la Economía": {
        topics: ["Oferta y Demanda", "Elasticidad", "Eficiencia y Equidad", "Mercados Competitivos", "Monopolio", "Macroeconomía Básica"],
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        color: "text-emerald-600 dark:text-emerald-400",
        icon: "DollarSign"
    }
};

// Helper: Normalize strings for comparison
const normalizeKey = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

// Topic Keywords Mapping
const TOPIC_KEYWORDS = {
    // Cálculo I
    "Números Reales": ["desigualdad", "valor absoluto", "supremo", "infimo", "axioma"],
    "Sucesiones": ["convergencia", "divergencia", "monotona", "acotada", "limite"],
    "Límites": ["continuidad", "asintota", "sandwich", "l'hopital", "indeterminacion"],
    "Derivadas": ["tangente", "cadena", "implicita", "razon de cambio", "velocidad"],
    "Aplicaciones de la Derivada": ["optimizacion", "maximos", "minimos", "grafica", "concavidad"],
    "Integrales": ["area", "riemann", "sustitucion", "partes", "fracciones parciales"],

    // Cálculo II
    "Integración": ["impropia", "longitud de arco", "area superficie", "volumen", "revolucion"],
    "Series": ["taylor", "maclaurin", "potencia", "radio convergencia", "criterio"],
    "Ecuaciones Diferenciales": ["variables separables", "lineal", "exacta", "bernoulli"],
    "Coordenadas Polares": ["polar", "cardioide", "rosa", "area polar"],

    // Cálculo III
    "Vectores y Geometría en el Espacio": ["producto punto", "producto cruz", "plano", "recta", "superficie cuadrica"],
    "Funciones Vectoriales": ["curvatura", "torsion", "triedro", "frenet"],
    "Derivadas Parciales": ["gradiente", "direccional", "plano tangente", "lagrange", "extremos"],
    "Integrales Múltiples": ["doble", "triple", "cambio variable", "jacobiano", "cilindrica", "esferica"],
    "Cálculo Vectorial": ["campo vectorial", "linea", "superficie", "green", "stokes", "divergencia"],

    // Álgebra Lineal
    "Matrices": ["inversa", "determinante", "rango", "gauss", "escalonada"],
    "Sistemas de Ecuaciones": ["homogeneo", "solucion", "cramer", "pivote"],
    "Espacios Vectoriales": ["subespacio", "base", "dimension", "independencia lineal", "generador"],
    "Transformaciones Lineales": ["nucleo", "imagen", "matriz asociada", "inyectiva", "sobreyectiva"],
    "Valores y Vectores Propios": ["diagonalizacion", "polinomio caracteristico", "multiplicidad"],
    "Ortogonalidad": ["gram-schmidt", "proyeccion", "complemento ortogonal", "minimos cuadrados"],

    // Probabilidad
    "Probabilidad": ["evento", "espacio muestral", "axioma", "condicional", "bayes"],
    "Probabilidad Condicional y Bayes": ["bayes", "teorema", "total", "condicional", "independencia"],
    "Variables Aleatorias": ["discreta", "continua", "esperanza", "varianza", "funcion masa", "densidad"],
    "Distribuciones de Probabilidad": ["binomial", "poisson", "normal", "exponencial", "uniforme"],
    "Inferencia Estadística": ["estimador", "intervalo confianza", "prueba hipotesis", "p-valor"],
    "Regresión Lineal": ["correlacion", "ajuste", "residuos", "r cuadrado"],

    // Física Mecánica
    "Cinemática": ["posicion", "velocidad", "aceleracion", "proyectil", "circular"],
    "Dinámica": ["newton", "fuerza", "roce", "tension", "diagrama cuerpo libre"],
    "Trabajo y Energía": ["cinetica", "potencial", "conservacion", "resorte", "potencia"],
    "Momento Lineal": ["impulso", "choque", "colision", "centro de masa"],
    "Rotación": ["torque", "momento inercia", "angular", "rodadura"],

    // Economía
    "Oferta y Demanda": ["equilibrio", "excedente", "precio", "cantidad", "mercado"],
    "Elasticidad": ["precio", "ingreso", "cruzada", "inelastica", "elastica"],
    "Monopolio": ["poder mercado", "barreras", "ingreso marginal", "costo marginal"],
    "Macroeconomía Básica": ["pib", "inflacion", "desempleo", "crecimiento"],

    // Programación
    "Variables y Tipos de Datos": ["int", "float", "string", "boolean", "conversion"],
    "Control de Flujo": ["if", "else", "while", "for", "break", "continue"],
    "Funciones": ["parametro", "retorno", "scope", "recursividad"],
    "Listas y Tuplas": ["append", "slice", "index", "sort", "matriz"],
    "Diccionarios": ["key", "value", "get", "items"],

    // Estática
    "Vectores Fuerza": ["resultante", "componente", "cartesiano", "unitario"],
    "Equilibrio de una Partícula": ["fuerzas concurrentes", "diagrama", "resorte"],
    "Equilibrio de un Cuerpo Rígido": ["momento", "par", "reacciones", "apoyos"],
    "Análisis Estructural": ["armadura", "nodo", "seccion", "bastidor"],

    // Finanzas
    "Finanzas": ["bono", "accion", "tasa", "interes", "presente", "futuro", "anualidad"],
    "Riesgo y Retorno": ["riesgo", "retorno", "capm", "beta", "diversificacion"],

    // Química
    "Estequiometría": ["mol", "reaccion", "balance", "reactivo limitante", "rendimiento"],
    "Enlace Químico": ["enlace", "covalente", "ionico", "lewis", "geometria molecular"],
    "Ácido-Base": ["ph", "poh", "acido", "base", "titulacion", "buffer"],
    "Termoquímica": ["entalpia", "calor de reaccion", "ley de hess", "exotermico", "endotermico"],
    "Polímeros y Materiales": ["polimero", "monomero", "plastico", "material", "cristal"],

    // Electricidad
    "Ley de Coulomb y Campo Eléctrico": ["coulomb", "campo electrico", "carga puntual"],
    "Ley de Gauss": ["gauss", "flujo electrico", "superficie gaussiana"],
    "Potencial Eléctrico": ["potencial", "voltaje", "diferencia de potencial"],
    "Circuitos DC y Ley de Ohm": ["circuito", "resistencia", "corriente", "ohm", "kirchhoff"],
    "Campo Magnético": ["campo magnetico", "fuerza magnetica", "biot-savart", "ampere"],
    "Inducción Electromagnética": ["induccion", "faraday", "lenz", "fem"]
};

// Course Codes Mapping for strict classification
const COURSE_CODES = {
    "MAT1610": "Cálculo I",
    "MAT1620": "Cálculo II",
    "MAT1630": "Cálculo III",
    "MAT1640": "Ecuaciones Diferenciales", // Not in syllabus but good to know
    "MAT1203": "Álgebra Lineal",
    "EYP1113": "Probabilidad y Estadística",
    "FIS1513": "Física: Mecánica",
    "FIS1523": "Termodinámica",
    "FIS1533": "Electricidad y Magnetismo",
    "QIM100": "Química General",
    "ICS1113": "Cálculo III", // Optimización often covers Calc III topics
    "ICS1513": "Finanzas"
};

const determineBestMatch = (content, title, sourceFolder, subfolder = "") => {
    // Normalize text for searching
    const text = (title + " " + content).toLowerCase();
    const normalizedText = normalizeKey(text);
    const normalizedSource = normalizeKey(sourceFolder);
    const normalizedSubfolder = normalizeKey(subfolder);

    let bestMatch = null;
    let maxScore = 0;

    // 0. Check for Explicit Course Codes in Title or Content
    for (const [code, mappedCourse] of Object.entries(COURSE_CODES)) {
        if (normalizedText.includes(normalizeKey(code))) {
            // Found a course code!
            const courseData = SYLLABUS[mappedCourse];
            const mappedTopics = courseData ? courseData.topics : null;
            let bestTopic = "General";
            let maxTopicScore = 0;

            if (mappedTopics) {
                for (const topic of mappedTopics) {
                    let tScore = 0;
                    const topicKeywords = normalizeKey(topic).split(' ').filter(k => k.length > 3);
                    topicKeywords.forEach(k => { if (normalizedText.includes(k)) tScore += 3; });

                    const semantic = TOPIC_KEYWORDS[topic] || [];
                    semantic.forEach(k => { if (normalizedText.includes(normalizeKey(k))) tScore += 2; });

                    if (tScore > maxTopicScore) {
                        maxTopicScore = tScore;
                        bestTopic = topic;
                    }
                }
            }
            return { course: mappedCourse, topic: bestTopic };
        }
    }

    // Find matching course from sourceFolder
    let targetCourseKey = Object.keys(SYLLABUS).find(k =>
        normalizedSource.includes(normalizeKey(k)) || normalizeKey(k).includes(normalizedSource)
    );

    // 0.5. Check Subfolder for Ayudantias (User suggestion)
    // If subfolder contains "Ayudantia X", map to SYLLABUS[course].topics[X-1]
    if (targetCourseKey && SYLLABUS[targetCourseKey]) {
        const ayudantiaMatch = (normalizedSubfolder + " " + normalizedText).match(/ayudant[ií]a\s*(\d+)/i);
        if (ayudantiaMatch) {
            const ayudantiaNum = parseInt(ayudantiaMatch[1]);
            const topics = SYLLABUS[targetCourseKey].topics;
            if (ayudantiaNum > 0 && ayudantiaNum <= topics.length) {
                const mappedTopic = topics[ayudantiaNum - 1];
                return { course: targetCourseKey, topic: mappedTopic };
            }
        }
    }

    // If source is "Todos los ramos", we allow searching across ALL courses
    if (!targetCourseKey && normalizedSource.includes("todos los ramos")) {
        // Fallback to the original logic: find best match across ALL courses
        for (const [course, courseData] of Object.entries(SYLLABUS)) {
            const topics = courseData.topics;
            for (const topic of topics) {
                let score = 0;
                // 1. Check Topic Name Keywords
                const topicNameKeywords = normalizeKey(topic).split(' ').filter(k => k.length > 3);
                topicNameKeywords.forEach(k => { if (normalizedText.includes(k)) score += 3; });

                // 2. Check Semantic Keywords
                const semanticKeywords = TOPIC_KEYWORDS[topic] || [];
                semanticKeywords.forEach(k => {
                    const normK = normalizeKey(k);
                    if (normalizedText.includes(normK)) score += 2;
                });

                // 3. Boost if course name mentioned
                if (normalizedText.includes(normalizeKey(course))) score += 1;

                if (score > maxScore) {
                    maxScore = score;
                    bestMatch = { course, topic };
                }
            }
        }
        return bestMatch;
    }

    if (!targetCourseKey) {
        return null;
    }

    const topics = SYLLABUS[targetCourseKey];

    if (!topics) {
        return null;
    }

    // Iterate ONLY over topics of the matched course
    for (const topic of topics) {
        let score = 0;

        // 1. Check Topic Name Keywords
        const topicNameKeywords = normalizeKey(topic).split(' ').filter(k => k.length > 3);
        topicNameKeywords.forEach(k => {
            if (normalizedText.includes(k)) score += 3;
        });

        // 2. Check Semantic Keywords
        const semanticKeywords = TOPIC_KEYWORDS[topic] || [];
        semanticKeywords.forEach(k => {
            const normK = normalizeKey(k);
            if (normalizedText.includes(normK)) score += 2;
        });

        if (score > maxScore) {
            maxScore = score;
            bestMatch = { course: targetCourseKey, topic };
        }
    }

    if (!bestMatch) {
        return { course: targetCourseKey, topic: "General" };
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

    // Walk through Course folders
    const courseFolders = fs.readdirSync(EXPORTS_DIR).filter(f => fs.statSync(path.join(EXPORTS_DIR, f)).isDirectory());

    for (const courseFolder of courseFolders) {
        console.log(`Processing course folder: ${courseFolder}`);
        const coursePath = path.join(EXPORTS_DIR, courseFolder);

        // Walk through Subfolders (e.g., Ayudantias, I1)
        const subFolders = fs.readdirSync(coursePath).filter(f => fs.statSync(path.join(coursePath, f)).isDirectory());

        for (const subFolder of subFolders) {
            const exercisesDir = path.join(coursePath, subFolder, 'ejercicios');

            if (fs.existsSync(exercisesDir)) {
                const files = fs.readdirSync(exercisesDir).filter(f => f.endsWith('.md'));
                console.log(`Found ${files.length} MD files in ${courseFolder}/${subFolder}`);

                for (const file of files) {
                    const content = fs.readFileSync(path.join(exercisesDir, file), 'utf-8');
                    const parts = file.replace('.md', '').split('_');
                    const number = parts[1];
                    let meaningfulTitle = parts[2] || "";

                    if (meaningfulTitle.length > 15 && /^[a-zA-Z0-9]+$/.test(meaningfulTitle)) {
                        meaningfulTitle = "";
                    }

                    const displayTitle = meaningfulTitle && meaningfulTitle.length > 3 ? meaningfulTitle : `Ejercicio ${number}`;

                    // Determine best topic match
                    // Pass courseFolder as sourceFolder, and subFolder as subfolder
                    const match = determineBestMatch(content, displayTitle, courseFolder, subFolder);

                    if (match) {
                        const key = normalizeKey(match.course);
                        if (!index[key]) index[key] = [];

                        index[key].push({
                            id: file.replace('.md', ''),
                            number: number,
                            content: content,
                            filename: file,
                            title: displayTitle,
                            topic: match.topic,
                            originalCourse: courseFolder
                        });
                    }

                    // Add to "Todos los ramos" as fallback
                    const todosKey = normalizeKey("Todos los ramos");
                    let genericTopic = "Material General";
                    if (displayTitle.toLowerCase().includes("prueba") || content.toLowerCase().includes("prueba")) genericTopic = "Pruebas Anteriores";
                    else if (displayTitle.toLowerCase().includes("guia") || content.toLowerCase().includes("guía")) genericTopic = "Guías de Ejercicios";
                    else if (displayTitle.toLowerCase().includes("ayudantia") || content.toLowerCase().includes("ayudantía")) genericTopic = "Ayudantías";

                    if (!index[todosKey]) index[todosKey] = [];
                    index[todosKey].push({
                        id: file.replace('.md', ''),
                        number: number,
                        content: content,
                        filename: file,
                        title: displayTitle,
                        topic: genericTopic,
                        originalCourse: courseFolder
                    });
                }
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
