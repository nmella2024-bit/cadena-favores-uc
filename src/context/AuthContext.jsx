import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers, mockFavors } from '../data/mockData';

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
  const [users, setUsers] = useState(mockUsers);
  const [favors, setFavors] = useState(mockFavors);

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('reduc_currentUser');
    const savedUsers = localStorage.getItem('reduc_users');
    const savedFavors = localStorage.getItem('reduc_favors');

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    if (savedFavors) {
      setFavors(JSON.parse(savedFavors));
    }
  }, []);

  // Guardar en localStorage cuando cambian los datos
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('reduc_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('reduc_currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('reduc_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('reduc_favors', JSON.stringify(favors));
  }, [favors]);

  // Función de registro
  const register = (userData) => {
    // Verificar si el correo ya existe
    const existingUser = users.find(u => u.correo === userData.correo);
    if (existingUser) {
      throw new Error('Ya existe una cuenta con este correo');
    }

    // Validar que sea correo UC
    if (!userData.correo.endsWith('@uc.cl')) {
      throw new Error('Debes usar un correo UC (@uc.cl)');
    }

    const newUser = {
      id: Date.now(),
      ...userData,
      favoresPublicados: [],
      favoresRespondidos: [],
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  // Función de login
  const login = (correo, password) => {
    // TODO: In production, this should be a secure API call
    const user = users.find(
      u => u.correo === correo && u.password === password
    );

    if (!user) {
      throw new Error('Correo o contraseña incorrectos');
    }

    setCurrentUser(user);
    return user;
  };

  // Función de logout
  const logout = () => {
    setCurrentUser(null);
  };

  // Función para publicar un favor
  const publishFavor = (favorData) => {
    if (!currentUser) {
      throw new Error('Debes iniciar sesión para publicar un favor');
    }

    const newFavor = {
      id: Date.now(),
      ...favorData,
      solicitante: currentUser.nombre,
      solicitanteId: currentUser.id,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'activo',
    };

    setFavors([...favors, newFavor]);

    // Actualizar favores del usuario
    const updatedUser = {
      ...currentUser,
      favoresPublicados: [...currentUser.favoresPublicados, newFavor.id],
    };
    setCurrentUser(updatedUser);

    // Actualizar en la lista de usuarios
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));

    return newFavor;
  };

  // Función para responder a un favor
  const respondToFavor = (favorId) => {
    if (!currentUser) {
      throw new Error('Debes iniciar sesión para responder a un favor');
    }

    // Actualizar el favor
    setFavors(favors.map(f =>
      f.id === favorId
        ? { ...f, estado: 'completado', respondidoPor: currentUser.id }
        : f
    ));

    // Actualizar usuario actual
    const updatedUser = {
      ...currentUser,
      favoresRespondidos: [...currentUser.favoresRespondidos, favorId],
    };
    setCurrentUser(updatedUser);

    // Actualizar en la lista de usuarios
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  // Función para eliminar un favor
  const deleteFavor = (favorId) => {
    if (!currentUser) {
      throw new Error('Debes iniciar sesión');
    }

    const favor = favors.find(f => f.id === favorId);
    if (favor && favor.solicitanteId !== currentUser.id) {
      throw new Error('Solo puedes eliminar tus propios favores');
    }

    setFavors(favors.filter(f => f.id !== favorId));
  };

  const value = {
    currentUser,
    users,
    favors,
    register,
    login,
    logout,
    publishFavor,
    respondToFavor,
    deleteFavor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
