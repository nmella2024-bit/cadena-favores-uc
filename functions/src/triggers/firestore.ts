import {onDocumentUpdated, onDocumentCreated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

/**
 * Función trigger que se ejecuta automáticamente cuando una notificación es actualizada
 * Si la notificación es marcada como leída (leida: true), se elimina inmediatamente
 * Esto mantiene la colección de notificaciones limpia y solo con notificaciones activas
 */
export const eliminarNotificacionLeida = onDocumentUpdated({
  document: "notificaciones/{notificationId}",
  region: "us-central1",
}, async (event) => {
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();

  // Verificar que tenemos los datos
  if (!beforeData || !afterData) {
    logger.warn("⚠️ No se encontraron datos en el evento");
    return;
  }

  // Verificar si la notificación cambió de NO leída a leída
  const fueLeida = !beforeData.leida && afterData.leida;

  if (fueLeida) {
    const notificationId = event.params.notificationId;
    logger.info(`📬 Notificación ${notificationId} marcada como leída, eliminando...`);

    try {
      // Eliminar la notificación
      await event.data?.after.ref.delete();
      logger.info(`✅ Notificación ${notificationId} eliminada exitosamente`);
    } catch (error) {
      logger.error(`❌ Error al eliminar notificación ${notificationId}:`, error);
      throw error;
    }
  }
});

/**
 * FUNCIÓN DE SEGURIDAD: Validar que el usuario recién creado tenga email UC
 * Se ejecuta automáticamente cuando se crea un nuevo documento de usuario
 * Si el email NO es @uc.cl o @estudiante.uc.cl, elimina el documento y el usuario de Auth
 */
export const validarEmailUCEnCreacion = onDocumentCreated({
  document: "usuarios/{userId}",
  region: "us-central1",
}, async (event) => {
  const userData = event.data?.data();
  const userId = event.params.userId;

  if (!userData) {
    logger.warn(`⚠️ No se encontraron datos para el usuario ${userId}`);
    return;
  }

  const email = userData.email;

  // Validar dominio UC
  const ucEmailRegex = /^[a-zA-Z0-9._-]+@(uc\.cl|estudiante\.uc\.cl)$/;

  if (!ucEmailRegex.test(email)) {
    logger.error(
      `🚨 SEGURIDAD: Detectado usuario con email no UC: ${email} (${userId})`
    );

    try {
      // 1. Eliminar el documento de Firestore
      await event.data?.ref.delete();
      logger.info(`✅ Documento de usuario ${userId} eliminado de Firestore`);

      // 2. Eliminar el usuario de Firebase Auth
      await admin.auth().deleteUser(userId);
      logger.info(`✅ Usuario ${userId} eliminado de Firebase Auth`);

      logger.info(`🛡️ Usuario no autorizado bloqueado: ${email}`);
    } catch (error) {
      logger.error(
        `❌ Error al eliminar usuario no autorizado ${userId}:`,
        error
      );
      throw error;
    }
  } else {
    logger.info(`✓ Usuario validado correctamente: ${email} (${userId})`);
  }
});
