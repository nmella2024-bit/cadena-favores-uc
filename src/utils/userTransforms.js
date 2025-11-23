/**
 * Transforma y combina los datos de usuario de Firebase Auth y Firestore.
 * @param {object} authUser - Usuario de Firebase Auth.
 * @param {object} firestoreData - Datos del usuario en Firestore.
 * @returns {object} - Objeto de usuario unificado.
 */
export const transformUserData = (authUser, firestoreData) => {
    if (!authUser) return null;

    if (firestoreData) {
        return {
            id: authUser.uid,
            uid: authUser.uid,
            nombre: firestoreData.nombre || authUser.displayName || 'Usuario',
            correo: authUser.email,
            email: authUser.email,
            carrera: firestoreData.carrera || '',
            año: firestoreData.año || 1,
            telefono: firestoreData.telefono || '',
            intereses: firestoreData.intereses || [],
            descripcion: firestoreData.descripcion || '',
            rol: firestoreData.rol || 'normal',
            reputacion: firestoreData.reputacion || 5.0,
            totalCalificaciones: firestoreData.totalCalificaciones || 0,
            favoresPublicados: firestoreData.favoresPublicados || [],
            favoresCompletados: firestoreData.favoresCompletados || [],
            fechaRegistro: firestoreData.fechaRegistro,
            fotoPerfil: firestoreData.fotoPerfil || null,
            // Propiedades de Firebase Auth
            photoURL: authUser.photoURL,
            emailVerified: authUser.emailVerified,
        };
    }

    // Usuario temporal (solo Auth, sin Firestore)
    return {
        id: authUser.uid,
        uid: authUser.uid,
        nombre: authUser.displayName || 'Usuario',
        correo: authUser.email,
        email: authUser.email,
        emailVerified: false,
        isTemporary: true,
    };
};
