import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    doc,
    getDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

const COLLECTION_NAME = 'profesores';

/**
 * Obtiene todos los profesores registrados
 * @returns {Promise<Array>} Lista de profesores
 */
export const obtenerProfesores = async () => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            orderBy('fechaRegistro', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error al obtener profesores:', error);
        throw error;
    }
};

/**
 * Registra un nuevo profesor
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
            throw new Error('Ya estás registrado como profesor');
        }

        const nuevoProfesor = {
            ...datos,
            usuarioId: usuario.uid,
            nombre: usuario.displayName || datos.nombre,
            email: usuario.email,
            fotoPerfil: usuario.photoURL || null,
            fechaRegistro: serverTimestamp(),
            estado: 'activo',
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
 * Verifica si el usuario actual ya es profesor
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
