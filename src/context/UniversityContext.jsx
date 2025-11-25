import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { universities, defaultUniversity, getUniversity } from '../config/universities';

const UniversityContext = createContext();

const STORAGE_KEY = 'selectedUniversity';

// Función para aplicar el tema de la universidad
const applyUniversityTheme = (university) => {
  if (!university?.theme) return;

  const root = document.documentElement;
  const isDarkMode = root.classList.contains('dark');
  const theme = isDarkMode ? university.theme.dark : university.theme.light;

  if (theme.brand) {
    root.style.setProperty('--brand', theme.brand);
  }
  if (theme.brandHover) {
    root.style.setProperty('--brand-hover', theme.brandHover);
  }
};

// Función para resetear al tema por defecto
const resetTheme = () => {
  const root = document.documentElement;
  const isDarkMode = root.classList.contains('dark');

  if (isDarkMode) {
    root.style.setProperty('--brand', '147 197 253');
    root.style.setProperty('--brand-hover', '96 165 250');
  } else {
    root.style.setProperty('--brand', '29 78 216');
    root.style.setProperty('--brand-hover', '30 64 175');
  }
};

export const useUniversity = () => {
  const context = useContext(UniversityContext);
  if (!context) {
    throw new Error('useUniversity must be used within a UniversityProvider');
  }
  return context;
};

export const UniversityProvider = ({ children }) => {
  const [universityId, setUniversityId] = useState(() => {
    // Intentar recuperar del localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && universities[stored] ? stored : null;
  });

  const [isSelected, setIsSelected] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && universities[stored];
  });

  // Datos de la universidad actual
  const university = useMemo(() => {
    return universityId ? getUniversity(universityId) : null;
  }, [universityId]);

  // Aplicar tema cuando cambie la universidad
  useEffect(() => {
    if (university) {
      applyUniversityTheme(university);
    } else {
      resetTheme();
    }
  }, [university]);

  // Escuchar cambios en el modo oscuro/claro para re-aplicar el tema
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          if (university) {
            applyUniversityTheme(university);
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [university]);

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    if (universityId) {
      localStorage.setItem(STORAGE_KEY, universityId);
    }
  }, [universityId]);

  // Seleccionar universidad
  const selectUniversity = useCallback((id) => {
    if (universities[id]) {
      setUniversityId(id);
      setIsSelected(true);
    }
  }, []);

  // Cambiar universidad (volver al selector)
  const clearUniversity = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUniversityId(null);
    setIsSelected(false);
    resetTheme();
  }, []);

  const value = useMemo(() => ({
    universityId,
    university,
    isSelected,
    selectUniversity,
    clearUniversity,
    universities,
  }), [universityId, university, isSelected, selectUniversity, clearUniversity]);

  return (
    <UniversityContext.Provider value={value}>
      {children}
    </UniversityContext.Provider>
  );
};

export default UniversityContext;
