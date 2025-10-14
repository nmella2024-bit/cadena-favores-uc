import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, registerUser, loginUser, logoutUser } from '../services/authService';
import { getUserData } from '../services/userService';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Estado de autenticación
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Escuchar cambios de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setFirebaseUser(user);

      if (user) {
        try {
          // Obtener datos completos del usuario desde Firestore
          const userData = await getUserData(user.uid);

          if (userData) {
            // Combinar datos de Firebase Auth con datos de Firestore
            setCurrentUser({
              id: user.uid,
              uid: user.uid,
              nombre: userData.nombre || user.displayName || 'Usuario',
              correo: user.email,
              email: user.email,
              carrera: userData.carrera || '',
              año: userData.año || 1,
              telefono: userData.telefono || '',
              intereses: userData.intereses || [],
              descripcion: userData.descripcion || '',
              reputacion: userData.reputacion || 5.0,
              favoresPublicados: userData.favoresPublicados || [],
              favoresCompletados: userData.favoresCompletados || [],
              fechaRegistro: userData.fechaRegistro,
              // Propiedades de Firebase Auth
              photoURL: user.photoURL,
              emailVerified: user.emailVerified,
            });
          } else {
            // Si no hay datos en Firestore, el usuario no está registrado en Red UC
            // Cerrar sesión automáticamente
            console.warn('Usuario autenticado pero no registrado en Firestore. Cerrando sesión.');
            await logoutUser();
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }

      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Función de registro
  const register = async (userData) => {
    try {
      // Validar que sea correo UC (acepta @uc.cl, @estudiante.uc.cl, etc.)
      if (!userData.correo.toLowerCase().includes('uc.cl')) {
        throw new Error('Debes usar un correo UC (debe contener uc.cl)');
      }

      // Registrar usuario en Firebase
      await registerUser(userData.correo, userData.password, {
        nombre: userData.nombre,
        email: userData.correo,
        carrera: userData.carrera || '',
        año: userData.año || 1,
        telefono: userData.telefono || '',
        intereses: userData.intereses || [],
        descripcion: userData.descripcion || '',
      });

      // El listener de onAuthChange se encargará de actualizar currentUser
      return true;
    } catch (error) {
      console.error('Error en registro:', error);

      // Mensajes de error más amigables
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Ya existe una cuenta con este correo');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('El correo electrónico no es válido');
      }

      throw error;
    }
  };

  // Función de login
  const login = async (correo, password) => {
    try {
      await loginUser(correo, password);
      // El listener de onAuthChange se encargará de actualizar currentUser
      return true;
    } catch (error) {
      console.error('Error en login:', error);

      // Mensajes de error más amigables
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Correo o contraseña incorrectos');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('El correo electrónico no es válido');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Demasiados intentos fallidos. Intenta más tarde');
      }

      throw new Error('Error al iniciar sesión. Verifica tus credenciales');
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      await logoutUser();
      // El listener de onAuthChange se encargará de limpiar currentUser
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  };

  // NOTA: Las siguientes funciones (publishFavor, respondToFavor, deleteFavor)
  // se mantendrán aquí por compatibilidad, pero ahora llamarán a los servicios de Firebase
  // Se actualizarán en los siguientes pasos

  // Función para publicar un favor (wrapper)
  const publishFavor = async (favorData) => {
    if (!currentUser || !firebaseUser) {
      throw new Error('Debes iniciar sesión para publicar un favor');
    }

    // Esta función se actualizará para usar publicarFavor de favorService
    // Por ahora, lanza un error indicando que debe usarse directamente el servicio
    throw new Error('Usa el servicio publicarFavor de favorService directamente');
  };

  // Función para responder a un favor (wrapper)
  const respondToFavor = async (favorId) => {
    if (!currentUser || !firebaseUser) {
      throw new Error('Debes iniciar sesión para responder a un favor');
    }

    // Esta función se actualizará para usar responderFavor de favorService
    throw new Error('Usa el servicio responderFavor de favorService directamente');
  };

  // Función para eliminar un favor (wrapper)
  const deleteFavor = async (favorId) => {
    if (!currentUser || !firebaseUser) {
      throw new Error('Debes iniciar sesión');
    }

    // Esta función se actualizará para usar eliminarFavor de favorService
    throw new Error('Usa el servicio eliminarFavor de favorService directamente');
  };

  const value = {
    currentUser,
    firebaseUser,
    loading,
    register,
    login,
    logout,
    publishFavor,
    respondToFavor,
    deleteFavor,
  };

  // Mostrar un loader mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
          <p className="mt-4 text-text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
