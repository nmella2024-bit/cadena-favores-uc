/**
 * Script de migración para agregar el campo autorTelefono a productos existentes en marketplace
 *
 * Este script:
 * 1. Lee todos los productos del marketplace
 * 2. Para cada producto, obtiene los datos del autor desde la colección usuarios
 * 3. Agrega el campo autorTelefono al producto con el teléfono del autor
 *
 * USO: node scripts/migrate-marketplace-telefono.js
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializar Firebase Admin
const serviceAccountPath = join(__dirname, '..', 'serviceAccountKey.json');
let serviceAccount;

try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('❌ Error: No se pudo cargar serviceAccountKey.json');
  console.error('Asegúrate de que el archivo existe en la raíz del proyecto');
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function migrarProductos() {
  console.log('🚀 Iniciando migración de productos del marketplace...\n');

  try {
    // Obtener todos los productos
    const productosSnapshot = await db.collection('marketplace').get();

    if (productosSnapshot.empty) {
      console.log('⚠️  No hay productos para migrar');
      return;
    }

    console.log(`📦 Encontrados ${productosSnapshot.size} productos\n`);

    let actualizados = 0;
    let sinCambios = 0;
    let errores = 0;

    // Procesar cada producto
    for (const productoDoc of productosSnapshot.docs) {
      const productoData = productoDoc.data();
      const productoId = productoDoc.id;

      try {
        // Verificar si ya tiene el campo autorTelefono
        if (productoData.autorTelefono !== undefined && productoData.autorTelefono !== null) {
          console.log(`⏭️  Producto "${productoData.titulo}" ya tiene autorTelefono: ${productoData.autorTelefono || '(vacío)'}`);
          sinCambios++;
          continue;
        }

        // Verificar que el producto tiene un autor
        if (!productoData.autor) {
          console.log(`⚠️  Producto "${productoData.titulo}" no tiene autor asignado`);
          // Agregar el campo como vacío
          await db.collection('marketplace').doc(productoId).update({
            autorTelefono: ''
          });
          actualizados++;
          continue;
        }

        // Obtener datos del autor
        const autorDoc = await db.collection('usuarios').doc(productoData.autor).get();

        if (!autorDoc.exists) {
          console.log(`⚠️  No se encontró el usuario autor para producto "${productoData.titulo}"`);
          // Agregar el campo como vacío
          await db.collection('marketplace').doc(productoId).update({
            autorTelefono: ''
          });
          actualizados++;
          continue;
        }

        const autorData = autorDoc.data();
        const telefono = autorData.telefono || '';

        // Actualizar el producto con el teléfono del autor
        await db.collection('marketplace').doc(productoId).update({
          autorTelefono: telefono
        });

        if (telefono) {
          console.log(`✅ Producto "${productoData.titulo}" actualizado con teléfono: ${telefono}`);
        } else {
          console.log(`✅ Producto "${productoData.titulo}" actualizado (autor sin teléfono)`);
        }

        actualizados++;

      } catch (error) {
        console.error(`❌ Error procesando producto "${productoData.titulo}":`, error.message);
        errores++;
      }
    }

    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE LA MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`Total de productos:        ${productosSnapshot.size}`);
    console.log(`✅ Actualizados:            ${actualizados}`);
    console.log(`⏭️  Ya tenían el campo:     ${sinCambios}`);
    console.log(`❌ Errores:                 ${errores}`);
    console.log('='.repeat(60));

    if (errores === 0) {
      console.log('\n🎉 Migración completada exitosamente\n');
    } else {
      console.log('\n⚠️  Migración completada con algunos errores\n');
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrarProductos()
  .then(() => {
    console.log('✅ Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
