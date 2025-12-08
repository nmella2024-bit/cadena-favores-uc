import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './material/Calculo';
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const doc = new jsPDF();

doc.text("Universidad Católica de Chile", 10, 10);
doc.text("Facultad de Matemáticas", 10, 20);
doc.text("Cálculo I - Prueba 1", 10, 30);

doc.text("Ejercicio 1:", 10, 50);
doc.text("Calcule el límite de f(x) = (x^2 - 1)/(x - 1) cuando x tiende a 1.", 10, 60);

doc.text("Solución:", 10, 80);
doc.text("El límite es 2.", 10, 90);

doc.text("Problema 2:", 10, 110);
doc.text("Encuentre la derivada de g(x) = sin(x) * cos(x).", 10, 120);

doc.addPage();
doc.text("--- Page 2 ---", 10, 10); // Marker for our extractor
doc.text("Pregunta 3:", 10, 30);
doc.text("Integre la función h(x) = e^x entre 0 y 1.", 10, 40);

const pdfData = doc.output('arraybuffer');
fs.writeFileSync(path.join(OUTPUT_DIR, 'DummyPrueba.pdf'), Buffer.from(pdfData));

console.log("Dummy PDF created at material/Calculo/DummyPrueba.pdf");
