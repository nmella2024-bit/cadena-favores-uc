// Configuración de universidades soportadas
export const universities = {
  uc: {
    id: 'uc',
    name: 'Universidad Católica',
    shortName: 'UC',
    appName: 'NexU+',
    slogan: 'Conecta, enseña y aprende dentro de la comunidad UC',
    description: 'NexU+ es un puente entre estudiantes que quieren pedir un favor y quienes pueden ofrecer ayuda.',
    emailDomains: ['@uc.cl', '@estudiante.uc.cl'],
    emailPlaceholder: 'tucorreo@uc.cl',
    // Colores UC - Azul institucional
    theme: {
      light: {
        brand: '29 78 216',      // Azul UC
        brandHover: '30 64 175', // Azul más oscuro
      },
      dark: {
        brand: '147 197 253',    // Azul claro para dark mode
        brandHover: '96 165 250',
      },
    },
    logo: '/uc-logo.png',
    stats: {
      students: '200+',
      studentsLabel: 'estudiantes colaborando',
    },
  },
  uandes: {
    id: 'uandes',
    name: 'Universidad de los Andes',
    shortName: 'UAndes',
    appName: 'NexUAndes',
    slogan: 'Conecta, enseña y aprende dentro de la comunidad UAndes',
    description: 'NexUAndes es un puente entre estudiantes que quieren pedir un favor y quienes pueden ofrecer ayuda.',
    emailDomains: ['@uandes.cl', '@miuandes.cl'],
    emailPlaceholder: 'tucorreo@uandes.cl',
    // Colores UAndes - Rojo institucional
    theme: {
      light: {
        brand: '185 28 28',      // Rojo UAndes (red-700)
        brandHover: '153 27 27', // Rojo más oscuro (red-800)
      },
      dark: {
        brand: '252 165 165',    // Rojo claro para dark mode (red-300)
        brandHover: '248 113 113', // (red-400)
      },
    },
    logo: '/uandes-logo.png',
    stats: {
      students: '100+',
      studentsLabel: 'estudiantes colaborando',
    },
  },
};

// Universidad por defecto
export const defaultUniversity = 'uc';

// Obtener universidad por ID
export const getUniversity = (id) => universities[id] || universities[defaultUniversity];

// Validar si un email pertenece a una universidad específica
export const isValidEmailForUniversity = (email, universityId) => {
  const university = universities[universityId];
  if (!university) return false;

  const emailLower = email.toLowerCase();
  return university.emailDomains.some(domain => emailLower.endsWith(domain));
};

// Detectar universidad por email
export const detectUniversityByEmail = (email) => {
  const emailLower = email.toLowerCase();

  for (const [id, uni] of Object.entries(universities)) {
    if (uni.emailDomains.some(domain => emailLower.endsWith(domain))) {
      return id;
    }
  }

  return null;
};

// Lista de todas las universidades para el selector
export const universityList = Object.values(universities);
