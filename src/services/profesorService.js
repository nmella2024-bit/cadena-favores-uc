import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

const COLLECTION_NAME = 'profesores';

/**
 * Obtiene todos los profesores activos (aprobados)
 * @returns {Promise<Array>} Lista de profesores activos
 */
export const obtenerProfesores = async () => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('estado', '==', 'activo')
        );

        const querySnapshot = await getDocs(q);
        const profesores = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Ordenar en memoria por fechaRegistro descendente
        return profesores.sort((a, b) => {
            const fechaA = a.fechaRegistro?.toMillis() || 0;
            const fechaB = b.fechaRegistro?.toMillis() || 0;
            return fechaB - fechaA;
        });
    } catch (error) {
        console.error('Error al obtener profesores:', error);
        throw error;
    }
};

/**
 * Obtiene las solicitudes de profesores pendientes
 * @returns {Promise<Array>} Lista de solicitudes pendientes
 */
export const obtenerSolicitudesProfesores = async () => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('estado', '==', 'pendiente')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        throw error;
    }
};

/**
 * Aprueba una solicitud de profesor
 * @param {string} id - ID del documento del profesor
 * @returns {Promise<void>}
 */
export const aprobarProfesor = async (id) => {
    try {
        const profesorRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(profesorRef, {
            estado: 'activo'
        });
    } catch (error) {
        console.error('Error al aprobar profesor:', error);
        throw error;
    }
};

/**
 * Rechaza una solicitud de profesor (elimina el documento)
 * @param {string} id - ID del documento del profesor
 * @returns {Promise<void>}
 */
export const rechazarProfesor = async (id) => {
    try {
        const profesorRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(profesorRef);
    } catch (error) {
        console.error('Error al rechazar profesor:', error);
        throw error;
    }
};

/**
 * Registra un nuevo profesor con estado pendiente
 * @param {Object} datos - Datos del profesor
 * @param {Object} usuario - Usuario actual (auth)
 * @returns {Promise<string>} ID del nuevo documento
 */
export const registrarProfesor = async (datos, usuario) => {
    try {
        // Verificar si ya existe un registro para este usuario
        const q = query(
            collection(db, COLLECTION_NAME),
            where('usuarioId', '==', usuario.uid)
        );
        const existingDocs = await getDocs(q);

        if (!existingDocs.empty) {
            throw new Error('Ya tienes una solicitud enviada o eres profesor');
        }

        const nuevoProfesor = {
            ...datos,
            usuarioId: usuario.uid,
            nombre: usuario.nombre || usuario.displayName || datos.nombre,
            email: usuario.email,
            fotoPerfil: usuario.photoURL || null,
            fechaRegistro: serverTimestamp(),
            estado: 'pendiente', // Por defecto pendiente de aprobación
            calificacionPromedio: 0,
            totalResenas: 0
        };

        const docRef = await addDoc(collection(db, COLLECTION_NAME), nuevoProfesor);
        return docRef.id;
    } catch (error) {
        console.error('Error al registrar profesor:', error);
        throw error;
    }
};

/**
 * Verifica si el usuario actual ya es profesor o tiene solicitud pendiente
 * @param {string} uid - ID del usuario
 * @returns {Promise<Object|null>} Datos del profesor o null
 */
export const verificarRegistroProfesor = async (uid) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('usuarioId', '==', uid)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error al verificar registro:', error);
        return null;
    }
};
