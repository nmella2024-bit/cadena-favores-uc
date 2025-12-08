import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXPORTS_DIR = path.join(__dirname, '..', 'exports', 'ejercicios');

const SYLLABUS = [
    "Introducción al Cálculo",
    "Cálculo I",
    "Cálculo II",
    "Cálculo III",
    "Álgebra Lineal",
    "Probabilidad y Estadística",
    "Física: Mecánica"
];

const TEMPLATES = {
    "Cálculo I": [
        { title: "Límite indeterminado", content: "Calcule el siguiente límite:\n\n$$ \\lim_{x \\to 0} \\frac{\\sin(x) - x}{x^3} $$\n\n**Solución:** Aplicando L'Hopital tres veces..." },
        { title: "Derivada Implícita", content: "Encuentre $y'$ si $x^2 + y^2 = 25$." },
        { title: "Optimización", content: "Se desea construir una caja sin tapa..." }
    ],
    "Álgebra Lineal": [
        { title: "Valores Propios", content: "Encuentre los valores propios de la matriz A = [[1, 2], [2, 1]]." },
        { title: "Independencia Lineal", content: "Determine si los vectores v1=(1,0), v2=(0,1) son LI." }
    ],
    "default": [
        { title: "Ejercicio Práctico 1", content: "Resuelva el siguiente problema planteado en clases..." },
        { title: "Problema de Certamen", content: "Este problema apareció en el Certamen 1 del 2023." }
    ]
};

const generate = () => {
    if (!fs.existsSync(EXPORTS_DIR)) fs.mkdirSync(EXPORTS_DIR, { recursive: true });

    SYLLABUS.forEach(course => {
        const courseDir = path.join(EXPORTS_DIR, course, 'ejercicios');
        if (!fs.existsSync(courseDir)) fs.mkdirSync(courseDir, { recursive: true });

        const templates = TEMPLATES[course] || TEMPLATES["default"];

        // Generate 5 exercises per course
        for (let i = 1; i <= 5; i++) {
            const template = templates[(i - 1) % templates.length];
            const fileName = `Ej_${i}_${course.replace(/\s+/g, '')}_Generated.md`;
            const filePath = path.join(courseDir, fileName);

            const fileContent = `# ${template.title}\n\n${template.content}\n\n*Generado automáticamente para pruebas.*`;

            fs.writeFileSync(filePath, fileContent);
            console.log(`Created: ${filePath}`);
        }
    });
};

generate();
