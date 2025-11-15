/**
 * Mapa de Facultades y Carreras de la Pontificia Universidad Católica de Chile
 * Estructura: { "Facultad": ["Carrera1", "Carrera2", ...] }
 */

export const FACULTADES_CARRERAS = {
  "Facultad de Agronomía y Sistemas Naturales": [
    "Agronomía",
    "Ingeniería en Recursos Naturales",
    "Ingeniería Forestal",
    "Medicina Veterinaria"
  ],
  "Facultad de Arquitectura, Diseño y Estudios Urbanos": [
    "Arquitectura",
    "Diseño",
    "Planificación Urbana"
  ],
  "Facultad de Artes": [
    "Actuación",
    "Arte",
    "Interpretación Musical",
    "Música"
  ],
  "Facultad de Ciencias Biológicas": [
    "Biología",
    "Biología Marina",
    "Bioquímica"
  ],
  "Facultad de Ciencias Sociales": [
    "Antropología",
    "Arqueología",
    "Psicología",
    "Sociología",
    "Trabajo Social"
  ],
  "Facultad de Comunicaciones": [
    "Dirección Audiovisual",
    "Periodismo",
    "Publicidad"
  ],
  "Facultad de Derecho": [
    "Derecho"
  ],
  "Facultad de Economía y Administración": [
    "Ingeniería Comercial"
  ],
  "Facultad de Educación": [
    "Pedagogía en Educación Especial",
    "Pedagogía en Educación Física y Salud para Educación Básica y Media",
    "Pedagogía en Educación General Básica (Santiago)",
    "Pedagogía en Educación Media en Ciencias Naturales y Biología",
    "Pedagogía en Educación Media en Física",
    "Pedagogía en Educación Media en Matemática",
    "Pedagogía en Educación Media en Química",
    "Pedagogía en Educación Parvularia (Santiago)",
    "Pedagogía en Inglés para Educación Básica y Media"
  ],
  "Facultad de Filosofía": [
    "Estética",
    "Filosofía"
  ],
  "Facultad de Física": [
    "Astronomía",
    "Física"
  ],
  "Facultad de Historia, Geografía y Ciencia Política": [
    "Ciencia Política",
    "Geografía",
    "Historia"
  ],
  "Facultad de Ingeniería": [
    "Construcción Civil",
    "Ingeniería",
    "Licenciatura en Ingeniería en Ciencia de Datos",
    "Licenciatura en Ingeniería en Ciencia de la Computación"
  ],
  "Facultad de Letras": [
    "Letras Hispánicas",
    "Letras Inglesas"
  ],
  "Facultad de Matemáticas": [
    "Estadística",
    "Licenciatura en Ingeniería en Ciencia de Datos",
    "Matemática"
  ],
  "Facultad de Medicina": [
    "Enfermería",
    "Fonoaudiología",
    "Kinesiología",
    "Medicina",
    "Nutrición y Dietética",
    "Odontología",
    "Terapia Ocupacional"
  ],
  "Facultad de Química y de Farmacia": [
    "Química",
    "Química y Farmacia"
  ],
  "Facultad de Teología": [
    "Pedagogía en Religión Católica",
    "Teología"
  ],
  "College": [
    "College Artes y Humanidades",
    "College Ciencias Naturales y Matemáticas",
    "College Ciencias Sociales"
  ]
};

/**
 * Lista de todas las facultades (para dropdowns)
 */
export const FACULTADES_UC = Object.keys(FACULTADES_CARRERAS).sort();

/**
 * Función para obtener la facultad de una carrera específica
 * @param {string} carrera - Nombre de la carrera
 * @returns {string|null} Nombre de la facultad o null si no se encuentra
 */
export const obtenerFacultadDeCarrera = (carrera) => {
  if (!carrera || carrera === 'Todas') return null;

  for (const [facultad, carreras] of Object.entries(FACULTADES_CARRERAS)) {
    if (carreras.includes(carrera)) {
      return facultad;
    }
  }

  return null;
};

/**
 * Función para verificar si una publicación es para la carrera del usuario
 * @param {string|Array<string>} publicacionAudiencia - Facultad(es) a la(s) que está dirigida la publicación
 * @param {string} carreraUsuario - Carrera del usuario actual
 * @returns {boolean} true si la publicación es para el usuario
 */
export const esParaMi = (publicacionAudiencia, carreraUsuario) => {
  console.log('🔍 esParaMi - Entrada:', { publicacionAudiencia, carreraUsuario });

  if (!carreraUsuario) {
    console.log('❌ Sin carrera de usuario');
    return false;
  }

  if (!publicacionAudiencia) {
    console.log('✅ Sin audiencia específica - mostrar a todos');
    return true;
  }

  // Si es un array (para compatibilidad con código antiguo)
  const audiencias = Array.isArray(publicacionAudiencia) ? publicacionAudiencia : [publicacionAudiencia];
  console.log('📋 Audiencias:', audiencias);

  // Si incluye "Todas", mostrar
  if (audiencias.includes('Todas')) {
    console.log('✅ Incluye "Todas" - mostrar');
    return true;
  }

  // Obtener la facultad del usuario
  const facultadUsuario = obtenerFacultadDeCarrera(carreraUsuario);
  console.log('🎓 Facultad del usuario:', facultadUsuario);

  if (!facultadUsuario) {
    console.log('❌ No se encontró facultad para la carrera:', carreraUsuario);
    return false;
  }

  // Verificar si alguna de las audiencias coincide con la facultad del usuario
  const coincide = audiencias.includes(facultadUsuario);
  console.log(coincide ? '✅ Coincide - mostrar' : '❌ No coincide - ocultar');

  return coincide;
};

export default FACULTADES_CARRERAS;
