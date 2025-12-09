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
    "Termodinámica": [
        "Primera Ley y Energía", "Segunda Ley y Entropía", "Ciclos de Potencia",
        "Propiedades de Sustancias Puras", "Fugacidad y Mezclas", "Equilibrio de Fases"
    ],
    "Finanzas": [
        "Valor del Dinero en el Tiempo", "Tasas de Interés y UF", "Evaluación de Proyectos (VAN/TIR)",
        "Bonos y Acciones", "Riesgo y Retorno"
    ],
    "Química General": [
        "Estequiometría", "Enlace Químico", "Ácido-Base", "Termoquímica", "Polímeros y Materiales"
    ],
    "Electricidad y Magnetismo": [
        "Ley de Coulomb y Campo Eléctrico", "Ley de Gauss", "Potencial Eléctrico",
        "Circuitos DC y Ley de Ohm", "Campo Magnético", "Inducción Electromagnética"
    ],
    "Todos los ramos": [
        "Material General", "Pruebas Anteriores", "Guías de Ejercicios", "Ayudantías", "Otros Temas"
    ]
};

// Extended keywords for better semantic matching
const TOPIC_KEYWORDS = {
    // Introducción al Cálculo
    "Números Reales y Desigualdades": ["desigualdad", "inecuacion", "intervalo", "acotado", "supremo", "infimo", "axioma", "absoluto"],
    "Valor Absoluto": ["valor absoluto", "modulo", "distancia", "triangular"],
    "Funciones: Dominio y Recorrido": ["dominio", "recorrido", "rango", "imagen", "preimagen", "codominio", "restriccion"],
    "Composición de Funciones": ["composicion", "compuesta", "f(g(x))", "g(f(x))"],
    "Funciones Inversas": ["inversa", "invertible", "biyectiva", "uno a uno", "sobreyectiva"],
    "Trigonometría Básica": ["seno", "coseno", "tangente", "identidad", "trigonometrica", "periodo"],

    // Cálculo I
    "Límites y Continuidad": ["limite", "continuidad", "continua", "discontinuidad", "asintota", "sandwich", "acotada", "tendencia"],
    "Derivadas: Definición y Reglas": ["derivada", "cociente incremental", "pendiente", "tangente", "diferenciable", "regla del producto", "regla del cociente"],
    "Regla de la Cadena": ["regla de la cadena", "composicion", "derivada externa", "derivada interna"],
    "Derivación Implícita": ["implicita", "dy/dx", "diferenciacion implicita"],
    "Aplicaciones: Máximos y Mínimos": ["maximo", "minimo", "optimizacion", "crecimiento", "decrecimiento", "concavidad", "inflexion", "grafica", "extremos"],
    "Teorema del Valor Medio": ["valor medio", "rolle", "tvm", "lagrange"],
    "Integrales Indefinidas": ["antiderivada", "primitiva", "integral indefinida", "constante de integracion"],

    // Cálculo II
    "Técnicas de Integración": ["sustitucion", "por partes", "fracciones parciales", "trigonometrica", "cambio de variable"],
    "Integrales Definidas y Áreas": ["integral definida", "area", "riemann", "teorema fundamental", "barro"],
    "Volúmenes de Revolución": ["volumen", "solido", "revolucion", "discos", "arandelas", "casquetes"],
    "Integrales Impropias": ["impropia", "infinito", "divergente", "convergente", "criterio"],
    "Sucesiones y Series Numéricas": ["sucesion", "serie", "convergencia", "divergencia", "criterio", "telescopica", "geometrica", "p-serie"],
    "Series de Potencias y Taylor": ["potencias", "taylor", "maclaurin", "radio de convergencia", "intervalo de convergencia", "polinomio"],
    "Coordenadas Polares": ["polar", "cardioide", "rosa", "limacon", "area polar"],

    // Cálculo III
    "Vectores y Geometría en el Espacio": ["vector", "plano", "recta", "producto punto", "producto cruz", "espacio", "superficie", "cuadrica"],
    "Funciones de Varias Variables": ["varias variables", "dominio", "curva de nivel", "limite multivariable", "continuidad"],
    "Derivadas Parciales y Gradiente": ["parcial", "gradiente", "direccional", "plano tangente", "diferencial", "jacobiana"],
    "Optimización Multivariable (Lagrange)": ["multiplicadores", "lagrange", "hessiano", "punto silla", "extremos condicionados"],
    "Integrales Dobles y Triples": ["integral doble", "integral triple", "iterada", "fubini", "cambio de orden", "polar", "cilindrica", "esferica"],
    "Campos Vectoriales": ["campo vectorial", "conservativo", "potencial", "rotacional", "divergencia", "linea de flujo"],
    "Teoremas de Green, Stokes y Divergencia": ["green", "stokes", "gauss", "divergencia", "flujo", "circulacion", "integral de linea", "integral de superficie"],

    // Álgebra Lineal
    "Matrices y Operaciones": ["matriz", "suma", "producto", "transpuesta", "simetrica", "traza"],
    "Determinantes e Inversa": ["determinante", "inversa", "adjunta", "cofactor", "singular", "invertible"],
    "Sistemas de Ecuaciones Lineales": ["sistema", "ecuacion lineal", "gauss", "jordan", "escalonada", "homogeneo", "solucion", "cramer"],
    "Espacios Vectoriales y Subespacios": ["espacio vectorial", "subespacio", "combinacion lineal", "generador", "clausura"],
    "Independencia Lineal y Bases": ["independencia lineal", "dependencia", "base", "dimension", "coordenadas"],
    "Transformaciones Lineales": ["transformacion", "lineal", "nucleo", "imagen", "kernel", "rango", "nulidad", "matriz asociada"],
    "Valores y Vectores Propios (Diagonalización)": ["valor propio", "vector propio", "eigenvalor", "eigenvector", "caracteristico", "diagonalizacion", "diagonalizable", "semejanza"],

    // Probabilidad y Estadística
    "Probabilidad Condicional y Bayes": ["condicional", "bayes", "independencia", "total", "evento"],
    "Variables Aleatorias Discretas": ["variable aleatoria", "discreta", "funcion de probabilidad", "esperanza", "varianza", "bernoulli"],
    "Variables Aleatorias Continuas": ["continua", "densidad", "acumulada", "uniforme", "exponencial"],
    "Distribuciones (Normal, Binomial, Poisson)": ["normal", "binomial", "poisson", "gaussiana", "estandar"],
    "Teorema del Límite Central": ["limite central", "tlc", "aproximacion"],
    "Intervalos de Confianza": ["intervalo", "confianza", "estimacion", "media", "proporcion"],
    "Pruebas de Hipótesis": ["hipotesis", "nula", "alternativa", "p-valor", "significancia", "rechazo", "error tipo"],

    // Física
    "Cinemática en 1D y 2D": ["cinematica", "posicion", "velocidad", "aceleracion", "movimiento", "proyectil", "caida libre", "mru", "mrua"],
    "Leyes de Newton (Dinámica)": ["newton", "fuerza", "masa", "inercia", "accion", "reaccion", "diagrama", "cuerpo libre", "roce", "tension"],
    "Trabajo y Energía": ["trabajo", "energia", "cinetica", "potencial", "conservacion", "potencia", "mecanica"],
    "Conservación del Momento Lineal": ["momento", "momentum", "impulso", "choque", "colision", "elastico", "inelastico"],
    "Dinámica de Rotación y Torque": ["rotacion", "torque", "momento angular", "inercia rotacional", "rodadura"],
    "Gravitación Universal": ["gravitacion", "kepler", "orbita", "satelite", "fuerza gravitacional"],
    "Oscilaciones y Ondas Mecánicas": ["oscilacion", "armonico", "simple", "pendulo", "resorte", "onda", "frecuencia", "periodo", "amplitud"],

    // Termodinámica
    "Primera Ley y Energía": ["primera ley", "energia interna", "calor", "trabajo", "sistema cerrado", "sistema abierto"],
    "Segunda Ley y Entropía": ["segunda ley", "entropia", "irreversibilidad", "clausius", "kelvin-planck"],
    "Ciclos de Potencia": ["ciclo", "rankine", "otto", "diesel", "refrigeracion", "carnot"],
    "Propiedades de Sustancias Puras": ["tablas de vapor", "saturacion", "calidad", "diagrama de fase"],
    "Fugacidad y Mezclas": ["fugacidad", "actividad", "potencial quimico", "mezcla ideal", "mezcla real"],
    "Equilibrio de Fases": ["equilibrio liquido vapor", "elv", "raoult", "henry", "azeotropo"],

    // Finanzas
    "Valor del Dinero en el Tiempo": ["valor presente", "valor futuro", "anualidad", "perpetuidad"],
    "Tasas de Interés y UF": ["tasa de interes", "interes compuesto", "uf", "nominal", "efectiva"],
    "Evaluación de Proyectos (VAN/TIR)": ["van", "tir", "flujo de caja", "payback"],
    "Bonos y Acciones": ["bono", "accion", "dividendo", "precio", "rendimiento"],
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

const determineBestMatch = (content, title, sourceFolder) => {
    // Normalize text for searching
    const text = (title + " " + content).toLowerCase();
    const normalizedText = normalizeKey(text);
    const normalizedSource = normalizeKey(sourceFolder);

    let bestMatch = null;
    let maxScore = 0;

    // 0. Check for Explicit Course Codes in Title or Content
    for (const [code, mappedCourse] of Object.entries(COURSE_CODES)) {
        if (normalizedText.includes(normalizeKey(code))) {
            // Found a course code!
            // We still need a topic, so we search for topics within that course
            const mappedTopics = SYLLABUS[mappedCourse];
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

    // Find the matching course in SYLLABUS based on sourceFolder
    // We try to find which syllabus key matches the source folder name
    let targetCourseKey = Object.keys(SYLLABUS).find(k =>
        normalizedSource.includes(normalizeKey(k)) || normalizeKey(k).includes(normalizedSource)
    );

    // If source is "Todos los ramos", we allow searching across ALL courses
    if (!targetCourseKey && normalizedSource.includes("todos los ramos")) {
        // Fallback to the original logic: find best match across ALL courses
        for (const [course, topics] of Object.entries(SYLLABUS)) {
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
                // 3. Boost if course name mentioned
                if (normalizedText.includes(normalizeKey(course))) score += 1;

                if (title.includes("Prueba 1") && course === "Cálculo I") {
                    console.log(`   -> Checking ${course} / ${topic}: Score=${score}`);
                }

                if (score > maxScore) {
                    maxScore = score;
                    bestMatch = { course, topic };
                }
            }
        }
        return bestMatch;
    }

    if (!targetCourseKey) {
        // If source is "Todos los ramos" or unknown, we can't strictly classify by course topics.
        // We can try to match against ALL topics but mark it as "General" course?
        // Or just return null to let the caller put it in "Todos los ramos".
        return null;
    }

    const topics = SYLLABUS[targetCourseKey]; // Corrected: SYLLABUS[key] directly returns the array of topics

    if (!topics) {
        return null;
    }

    // Iterate ONLY over topics of the matched course
    for (const topic of topics) {
        let score = 0;

        // 1. Check Topic Name Keywords
        const topicNameKeywords = normalizeKey(topic).split(' ').filter(k => k.length > 3);
        topicNameKeywords.forEach(k => {
            if (normalizedText.includes(k)) score += 3; // High weight for exact topic name match
        });

        // 2. Check Semantic Keywords (The "Smart" Part)
        const semanticKeywords = TOPIC_KEYWORDS[topic] || [];
        semanticKeywords.forEach(k => {
            const normK = normalizeKey(k);
            if (normalizedText.includes(normK)) score += 2; // Medium weight for related concepts
        });

        if (score > maxScore) {
            maxScore = score;
            bestMatch = { course: targetCourseKey, topic };
        }
    }

    // If no topic matched well, default to the course with a generic topic?
    // Or just return the course with "General" topic?
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

    // Walk through ALL Course folders
    const sourceFolders = fs.readdirSync(EXPORTS_DIR).filter(f => fs.statSync(path.join(EXPORTS_DIR, f)).isDirectory());

    for (const sourceFolder of sourceFolders) {
        console.log(`Processing source folder: ${sourceFolder}`);
        const exercisesDir = path.join(EXPORTS_DIR, sourceFolder, 'ejercicios');
        console.log(`Looking in: ${exercisesDir}`);

        if (fs.existsSync(exercisesDir)) {
            const files = fs.readdirSync(exercisesDir).filter(f => f.endsWith('.md'));
            console.log(`Found ${files.length} MD files`);

            for (const file of files) {
                const content = fs.readFileSync(path.join(exercisesDir, file), 'utf-8');
                const parts = file.replace('.md', '').split('_');
                const number = parts[1];
                // Try to get a meaningful title from the filename (parts[2] usually)
                // Format seems to be: Ej_{number}_{title}_{id}_Full.md
                let meaningfulTitle = parts[2] || "";

                // If the title looks like an ID (alphanumeric only, long), ignore it or look elsewhere
                if (meaningfulTitle.length > 15 && /^[a-zA-Z0-9]+$/.test(meaningfulTitle)) {
                    meaningfulTitle = "";
                }

                const title = `Ejercicio ${number}`;

                // Use the meaningful title for matching, but keep "Ejercicio X" as the display title if needed
                // actually, let's use the meaningful title as the display title too if it's good
                const displayTitle = meaningfulTitle && meaningfulTitle.length > 3 ? meaningfulTitle : `Ejercicio ${number}`;

                // Determine best topic match WITHIN the current course
                // Pass meaningfulTitle to help with classification
                const match = determineBestMatch(content, displayTitle, sourceFolder);

                if (number === '12' || number === '1') { // Debug specific files
                    console.log(`Debug ${file}: Source=${sourceFolder}, Match=${JSON.stringify(match)}`);
                }

                if (match) {
                    // Add to specific course
                    const key = normalizeKey(match.course);

                    // Ensure the key exists in index
                    if (!index[key]) index[key] = [];

                    index[key].push({
                        id: file.replace('.md', ''),
                        number: number,
                        content: content,
                        filename: file,
                        title: displayTitle,
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
                    title: displayTitle,
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
