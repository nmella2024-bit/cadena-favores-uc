/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onSchedule} from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Inicializar Firebase Admin
admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

/**
 * Función programada que se ejecuta cada hora para eliminar favores y anuncios expirados
 * Los elementos fijados (fijado: true) no se eliminan automáticamente
 */
export const eliminarContenidoExpirado = onSchedule({
  schedule: "every 1 hours",
  timeZone: "America/Santiago", // Zona horaria de Chile
  region: "us-central1",
}, async (event) => {
  logger.info("Iniciando eliminación de contenido expirado...");

  const db = admin.firestore();
  const ahora = admin.firestore.Timestamp.now();

  let totalEliminados = 0;

  try {
    // ===== ELIMINAR FAVORES EXPIRADOS =====
    logger.info("🔍 Buscando favores expirados...");
    const favoresExpiradosQuery = db.collection("favores")
      .where("fechaExpiracion", "<=", ahora)
      .where("fijado", "==", false)
      .where("estado", "==", "activo");

    const favoresSnapshot = await favoresExpiradosQuery.get();

    if (!favoresSnapshot.empty) {
      logger.info(`📋 Se encontraron ${favoresSnapshot.size} favores expirados`);

      const favorBatch = db.batch();
      let favoresCount = 0;

      favoresSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        logger.info(`🗑️ Eliminando favor: ${doc.id} - "${data.titulo}"`);
        favorBatch.delete(doc.ref);
        favoresCount++;

        if (favoresCount >= 500) {
          logger.warn("⚠️ Alcanzado límite de 500 favores en batch");
          return;
        }
      });

      await favorBatch.commit();
      logger.info(`✅ Se eliminaron ${favoresCount} favores expirados`);
      totalEliminados += favoresCount;
    } else {
      logger.info("✓ No hay favores expirados para eliminar");
    }

    // ===== ELIMINAR ANUNCIOS EXPIRADOS =====
    logger.info("🔍 Buscando anuncios expirados...");
    const anunciosExpiradosQuery = db.collection("anuncios")
      .where("fechaExpiracion", "<=", ahora)
      .where("fijado", "==", false);

    const anunciosSnapshot = await anunciosExpiradosQuery.get();

    if (!anunciosSnapshot.empty) {
      logger.info(`📢 Se encontraron ${anunciosSnapshot.size} anuncios expirados`);

      const anuncioBatch = db.batch();
      let anunciosCount = 0;

      anunciosSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        logger.info(`🗑️ Eliminando anuncio: ${doc.id} - "${data.titulo}"`);
        anuncioBatch.delete(doc.ref);
        anunciosCount++;

        // Nota: No eliminamos la imagen de Storage en la Cloud Function
        // para mantener la función simple y rápida. Las imágenes huérfanas
        // pueden limpiarse con una función de mantenimiento separada si es necesario.

        if (anunciosCount >= 500) {
          logger.warn("⚠️ Alcanzado límite de 500 anuncios en batch");
          return;
        }
      });

      await anuncioBatch.commit();
      logger.info(`✅ Se eliminaron ${anunciosCount} anuncios expirados`);
      totalEliminados += anunciosCount;
    } else {
      logger.info("✓ No hay anuncios expirados para eliminar");
    }

    logger.info(`🎉 Proceso completado. Total eliminados: ${totalEliminados} elementos`);
  } catch (error) {
    logger.error("❌ Error al eliminar contenido expirado:", error);
    throw error;
  }
});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
