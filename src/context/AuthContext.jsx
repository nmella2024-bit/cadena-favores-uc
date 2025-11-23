import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { onAuthChange, registerUser, loginUser, logoutUser } from '../services/authService';
import { getUserData } from '../services/userService';
import { isValidUCEmail } from '../utils/validators';
import { transformUserData } from '../utils/userTransforms';

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

          // Transformar y combinar datos usando la utilidad
          const transformedUser = transformUserData(user, userData);

          if (transformedUser.isTemporary && !user.emailVerified) {
            // Caso usuario temporal no verificado
            setCurrentUser(transformedUser);
          } else if (transformedUser.isTemporary && user.emailVerified) {
            // Caso borde: verificado pero sin datos en Firestore
            console.warn('Usuario autenticado pero no registrado en Firestore. Cerrando sesión.');
            await logoutUser();
            setCurrentUser(null);
          } else {
            // Usuario normal
            setCurrentUser(transformedUser);
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
  const register = async (userData, referralCode = null) => {
    try {
      if (!isValidUCEmail(userData.correo)) {
        throw new Error('Debes usar un correo UC válido (@uc.cl o @estudiante.uc.cl)');
      }

      // Registrar usuario en Firebase
      await registerUser(
        userData.correo,
        userData.password,
        {
          nombre: userData.nombre,
          email: userData.correo,
          carrera: userData.carrera || '',
          año: userData.año || 1,
          telefono: userData.telefono || '',
          intereses: userData.intereses || [],
          descripcion: userData.descripcion || '',
        },
        referralCode
      );

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
      return true;
    } catch (error) {
      console.error('Error en login:', error);

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
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  };

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const value = useMemo(() => ({
    currentUser,
    usuario: currentUser, // Alias para compatibilidad
    firebaseUser,
    loading,
    register,
    login,
    logout,
  }), [currentUser, firebaseUser, loading]);

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
