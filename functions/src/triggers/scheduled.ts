import {onSchedule} from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

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

/**
 * Función programada que se ejecuta diariamente para eliminar favores finalizados
 * después de 30 días desde su finalización
 * Esta función permite mantener un historial reciente para que los usuarios
 * puedan ver y calificar favores completados, pero limpia automáticamente
 * después de un período razonable
 */
export const limpiarFavoresFinalizados = onSchedule({
  schedule: "every day 02:00",
  timeZone: "America/Santiago", // Zona horaria de Chile
  region: "us-central1",
}, async (event) => {
  logger.info("🧹 Iniciando limpieza de favores finalizados...");

  const db = admin.firestore();

  // Calcular fecha hace 30 días
  const fecha30DiasAtras = new Date();
  fecha30DiasAtras.setDate(fecha30DiasAtras.getDate() - 30);
  const timestamp30DiasAtras = admin.firestore.Timestamp.fromDate(fecha30DiasAtras);

  let totalEliminados = 0;

  try {
    logger.info(`📅 Buscando favores finalizados antes de: ${fecha30DiasAtras.toISOString()}`);

    // Buscar favores finalizados hace más de 30 días
    const favoresFinalizadosQuery = db.collection("favores")
      .where("estado", "==", "finalizado")
      .where("fechaFinalizacion", "<=", timestamp30DiasAtras);

    const favoresSnapshot = await favoresFinalizadosQuery.get();

    if (!favoresSnapshot.empty) {
      logger.info(`📋 Se encontraron ${favoresSnapshot.size} favores finalizados para eliminar`);

      const batch = db.batch();
      let count = 0;

      for (const doc of favoresSnapshot.docs) {
        const data = doc.data();
        logger.info(
          `🗑️ Eliminando favor finalizado: ${doc.id} - "${data.titulo}" ` +
                    `(finalizado el ${data.fechaFinalizacion?.toDate().toISOString()})`
        );

        // Eliminar reportes asociados al favor (limpieza en cascada)
        try {
          const reportesQuery = db.collection("reportes")
            .where("contentType", "==", "favor")
            .where("contentId", "==", doc.id);

          const reportesSnapshot = await reportesQuery.get();

          if (!reportesSnapshot.empty) {
            logger.info(
              `📝 Eliminando ${reportesSnapshot.size} reportes asociados ` +
                            `al favor ${doc.id}`
            );
            reportesSnapshot.docs.forEach((reporteDoc) => {
              batch.delete(reporteDoc.ref);
            });
          }
        } catch (reportError) {
          logger.warn(`⚠️ Error al eliminar reportes del favor ${doc.id}:`, reportError);
          // Continuar con la eliminación del favor aunque falle la eliminación de reportes
        }

        // Eliminar el favor
        batch.delete(doc.ref);
        count++;

        // Firestore batch tiene límite de 500 operaciones
        if (count >= 450) { // 450 para dejar margen a los reportes
          logger.warn(
            "⚠️ Alcanzado límite de operaciones en batch, ejecutando..."
          );
          await batch.commit();
          logger.info(`✅ Batch ejecutado: ${count} favores procesados`);
          totalEliminados += count;
          count = 0;
          // Crear nuevo batch si hay más documentos
        }
      }

      // Ejecutar batch final si quedan operaciones
      if (count > 0) {
        await batch.commit();
        logger.info(`✅ Batch final ejecutado: ${count} favores procesados`);
        totalEliminados += count;
      }

      logger.info(
        `🎉 Limpieza completada. Total eliminados: ${totalEliminados} ` +
                "favores finalizados"
      );
    } else {
      logger.info("✓ No hay favores finalizados antiguos para eliminar");
    }
  } catch (error) {
    logger.error("❌ Error al limpiar favores finalizados:", error);
    throw error;
  }
});
