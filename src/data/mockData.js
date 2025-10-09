// Mock data for the application
// TODO: Replace with real backend API calls

export const categories = [
  { id: 'academico', name: 'Académico', icon: '📚' },
  { id: 'material', name: 'Material', icon: '📝' },
  { id: 'tramite', name: 'Trámite', icon: '📋' },
  { id: 'tutoria', name: 'Tutoría', icon: '🎓' },
  { id: 'otro', name: 'Otro', icon: '🔧' },
];

export const mockUsers = [
  {
    id: 1,
    nombre: 'María González',
    correo: 'mgonzalez@uc.cl',
    password: 'demo123',
    carrera: 'Ingeniería',
    año: 3,
    intereses: ['Matemáticas', 'Programación', 'Física'],
    descripcion: 'Me encanta ayudar con materias de ciencias.',
    favoresPublicados: [],
    favoresRespondidos: [],
  },
  {
    id: 2,
    nombre: 'Carlos Rodríguez',
    correo: 'crodriguez@uc.cl',
    password: 'demo123',
    carrera: 'Derecho',
    año: 2,
    intereses: ['Derecho', 'Historia', 'Economía'],
    descripcion: 'Estudiante de derecho apasionado por la justicia social.',
    favoresPublicados: [],
    favoresRespondidos: [],
  },
];

export const mockFavors = [
  {
    id: 1,
    titulo: 'Ayuda con Cálculo II',
    descripcion: 'Necesito ayuda para entender límites y derivadas. Preferiblemente alguien que ya haya aprobado el ramo.',
    categoria: 'academico',
    solicitante: 'Carlos Rodríguez',
    solicitanteId: 2,
    disponibilidad: 'Martes y jueves tarde',
    fecha: '2025-10-05',
    estado: 'activo',
  },
  {
    id: 2,
    titulo: 'Presto apuntes de Programación',
    descripcion: 'Tengo apuntes completos de IIC1103. Están digitalizados y muy ordenados.',
    categoria: 'material',
    solicitante: 'María González',
    solicitanteId: 1,
    disponibilidad: 'Disponible siempre',
    fecha: '2025-10-04',
    estado: 'activo',
  },
  {
    id: 3,
    titulo: 'Clase particular de Física',
    descripcion: 'Ofrezco clases de física para estudiantes de primer año. Soy ayudante del curso.',
    categoria: 'tutoria',
    solicitante: 'María González',
    solicitanteId: 1,
    disponibilidad: 'Lunes a viernes por la tarde',
    fecha: '2025-10-03',
    estado: 'activo',
  },
];
