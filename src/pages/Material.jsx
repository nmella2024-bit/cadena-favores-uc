import React, { useState, useEffect, useMemo } from 'react';
import { obtenerMaterialesPorCarpeta, eliminarMaterial, fijarMaterial } from '../services/materialService';
import { obtenerCarpetasPorNivel, crearCarpeta, renombrarCarpeta, eliminarCarpeta, obtenerRutaCarpeta, obtenerCarpetaPorId } from '../services/folderService';
import { useAuth } from '../context/AuthContext';
import { Search, BookOpen, Filter, X, Plus, Inbox, AlertCircle, FolderPlus } from 'lucide-react';
import SubirMaterialModal from '../components/SubirMaterialModal';
import MaterialCard from '../components/MaterialCard';
import FolderCard from '../components/FolderCard';
import Breadcrumb from '../components/Breadcrumb';
import CreateFolderModal from '../components/CreateFolderModal';
import PrimaryButton from '../components/ui/PrimaryButton';

const SkeletonCard = () => (
  <div className="animate-pulse rounded-xl border border-border bg-card/70 p-6 shadow-sm dark:bg-card/60">
    <div className="h-6 w-2/3 rounded bg-border/80 dark:bg-border/40 mb-4" />
    <div className="space-y-2 mb-4">
      <div className="h-4 w-full rounded bg-border/80 dark:bg-border/40" />
      <div className="h-4 w-5/6 rounded bg-border/80 dark:bg-border/40" />
      <div className="h-4 w-4/6 rounded bg-border/80 dark:bg-border/40" />
    </div>
    <div className="h-4 w-32 rounded bg-border/80 dark:bg-border/40" />
  </div>
);

const Material = () => {
  const { currentUser } = useAuth();
  const [materiales, setMateriales] = useState([]);
  const [carpetas, setCarpetas] = useState([]);
  const [carpetaActual, setCarpetaActual] = useState(null);
  const [rutaCarpeta, setRutaCarpeta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [eliminando, setEliminando] = useState(null);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [carreraSeleccionada, setCarreraSeleccionada] = useState('');
  const [anioSeleccionado, setAnioSeleccionado] = useState('');
  const [ramoSeleccionado, setRamoSeleccionado] = useState('');

  const esUsuarioExclusivo = currentUser?.rol === 'exclusivo';

  // Opciones de filtros
  const carreras = [
    'Ingeniería Civil',
    'Ingeniería Comercial',
    'Derecho',
    'Medicina',
    'Psicología',
    'Diseño',
    'Arquitectura',
    'Pedagogía',
    'Enfermería',
    'Agronomía',
    'Periodismo',
    'Otra'
  ];

  const anios = [1, 2, 3, 4, 5];

  // Ramos dinámicos según carrera
  const ramosPorCarrera = {
    'Ingeniería Civil': [
      'Cálculo I',
      'Cálculo II',
      'Cálculo III',
      'Álgebra Lineal',
      'Física I',
      'Física II',
      'Química General',
      'Programación',
      'Estructuras de Datos',
      'Ecuaciones Diferenciales',
      'Mecánica de Fluidos',
      'Resistencia de Materiales'
    ],
    'Ingeniería Comercial': [
      'Microeconomía',
      'Macroeconomía',
      'Contabilidad',
      'Finanzas',
      'Marketing',
      'Gestión de Operaciones',
      'Econometría',
      'Matemáticas para Economistas'
    ],
    'Derecho': [
      'Derecho Civil',
      'Derecho Penal',
      'Derecho Constitucional',
      'Derecho Laboral',
      'Derecho Comercial',
      'Derecho Internacional',
      'Derecho Administrativo'
    ],
    'Medicina': [
      'Anatomía',
      'Fisiología',
      'Bioquímica',
      'Farmacología',
      'Patología',
      'Microbiología',
      'Medicina Interna',
      'Cirugía'
    ],
    'Psicología': [
      'Psicología General',
      'Neuropsicología',
      'Psicología del Desarrollo',
      'Psicología Social',
      'Psicopatología',
      'Estadística para Psicología',
      'Psicología Clínica'
    ],
    'Diseño': [
      'Taller de Diseño',
      'Teoría del Diseño',
      'Tipografía',
      'Diseño Gráfico',
      'Diseño Industrial',
      'Historia del Diseño',
      'Metodología de Proyecto'
    ],
    'Arquitectura': [
      'Taller de Arquitectura',
      'Historia de la Arquitectura',
      'Estructuras',
      'Construcción',
      'Teoría de la Arquitectura',
      'Urbanismo',
      'Diseño Arquitectónico'
    ],
    'Pedagogía': [
      'Didáctica General',
      'Psicología Educacional',
      'Currículum',
      'Evaluación',
      'Metodología de la Enseñanza',
      'Práctica Pedagógica'
    ],
    'Enfermería': [
      'Enfermería Básica',
      'Anatomía y Fisiología',
      'Farmacología',
      'Enfermería Médico-Quirúrgica',
      'Enfermería Pediátrica',
      'Salud Pública',
      'Cuidados Intensivos'
    ],
    'Agronomía': [
      'Botánica',
      'Suelos',
      'Fisiología Vegetal',
      'Producción Animal',
      'Producción Vegetal',
      'Economía Agrícola',
      'Manejo de Cultivos'
    ],
    'Periodismo': [
      'Redacción Periodística',
      'Teoría de la Comunicación',
      'Periodismo Digital',
      'Fotografía Periodística',
      'Ética Periodística',
      'Periodismo Investigativo',
      'Radio y Televisión'
    ],
    'Otra': []
  };

  const ramosDisponibles = carreraSeleccionada ? ramosPorCarrera[carreraSeleccionada] || [] : [];

  // Cargar contenido (carpetas y materiales) de la carpeta actual
  const cargarContenido = async (carpetaId = null) => {
    try {
      setLoading(true);
      setError('');

      // Cargar carpetas del nivel actual
      try {
        const carpetasData = await obtenerCarpetasPorNivel(carpetaId);
        setCarpetas(carpetasData);
      } catch (carpetasError) {
        console.warn('Error al cargar carpetas:', carpetasError);
        setCarpetas([]); // Si no hay carpetas, lista vacía
      }

      // Cargar materiales de la carpeta actual
      try {
        const materialesData = await obtenerMaterialesPorCarpeta(carpetaId);
        setMateriales(materialesData);
      } catch (materialesError) {
        console.warn('Error al cargar materiales:', materialesError);
        setMateriales([]); // Si no hay materiales, lista vacía
      }

      // Actualizar la ruta si estamos en una carpeta
      if (carpetaId) {
        try {
          const ruta = await obtenerRutaCarpeta(carpetaId);
          setRutaCarpeta(ruta);
          const carpeta = await obtenerCarpetaPorId(carpetaId);
          setCarpetaActual(carpeta);
        } catch (rutaError) {
          console.warn('Error al cargar ruta:', rutaError);
          setRutaCarpeta([]);
          setCarpetaActual(null);
        }
      } else {
        setRutaCarpeta([]);
        setCarpetaActual(null);
      }
    } catch (err) {
      console.error('Error al cargar contenido:', err);
      setError('Error al cargar el contenido. Intenta recargar la página.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarContenido(carpetaActual?.id || null);
  }, [carpetaActual?.id]);

  // Efecto para simular carga cuando cambia el filtro
  useEffect(() => {
    if (materiales.length > 0) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  // Filtrar y ordenar materiales (fijados primero)
  const filteredMateriales = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    const filtered = materiales.filter((material) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        material.titulo?.toLowerCase().includes(normalizedQuery) ||
        material.descripcion?.toLowerCase().includes(normalizedQuery) ||
        material.ramo?.toLowerCase().includes(normalizedQuery) ||
        material.tags?.join(' ').toLowerCase().includes(normalizedQuery);

      const matchesCarrera =
        !carreraSeleccionada ||
        material.carrera === carreraSeleccionada;

      const matchesAnio =
        !anioSeleccionado ||
        material.anio === parseInt(anioSeleccionado) ||
        material.anio === 'Todos';

      const matchesRamo =
        !ramoSeleccionado ||
        material.ramo === ramoSeleccionado ||
        material.ramo === 'Todos los ramos';

      return matchesSearch && matchesCarrera && matchesAnio && matchesRamo;
    });

    // Ordenar: fijados primero, luego por fecha
    return filtered.sort((a, b) => {
      if (a.fijado && !b.fijado) return -1;
      if (!a.fijado && b.fijado) return 1;
      return new Date(b.fechaSubida) - new Date(a.fechaSubida);
    });
  }, [materiales, searchTerm, carreraSeleccionada, anioSeleccionado, ramoSeleccionado]);

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setSearchTerm('');
    setCarreraSeleccionada('');
    setAnioSeleccionado('');
    setRamoSeleccionado('');
  };

  // Cuando cambia la carrera, resetear el ramo
  useEffect(() => {
    setRamoSeleccionado('');
  }, [carreraSeleccionada]);

  // Manejar eliminación de material
  const handleEliminarMaterial = async (materialId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este material?')) {
      return;
    }

    try {
      setEliminando(materialId);
      await eliminarMaterial(materialId, currentUser.uid);
      // Recargar materiales
      cargarMateriales();
    } catch (err) {
      console.error('Error al eliminar material:', err);
      alert(err.message || 'Error al eliminar el material. Intenta nuevamente.');
    } finally {
      setEliminando(null);
    }
  };

  // Manejar cuando se sube un nuevo material
  const handleMaterialSubido = () => {
    cargarContenido(carpetaActual?.id || null);
  };

  // Manejar fijar material
  const handleFijarMaterial = async (materialId, nuevoEstado) => {
    // Validación adicional: verificar que el usuario sea exclusivo
    if (!esUsuarioExclusivo) {
      alert('Solo los usuarios con rol exclusivo pueden fijar materiales.');
      return;
    }

    try {
      await fijarMaterial(materialId, nuevoEstado, currentUser);
      // Actualizar el estado local
      setMateriales(materiales.map(m =>
        m.id === materialId ? { ...m, fijado: nuevoEstado } : m
      ));
    } catch (err) {
      console.error('Error al fijar/desfijar material:', err);
      alert(err.message || 'Error al actualizar el material. Intenta nuevamente.');
    }
  };

  // Navegación de carpetas
  const handleAbrirCarpeta = (carpetaId) => {
    cargarContenido(carpetaId);
  };

  const handleNavegar = (carpetaId) => {
    cargarContenido(carpetaId);
  };

  // Crear carpeta
  const handleCrearCarpeta = async (nombreCarpeta) => {
    try {
      await crearCarpeta({
        nombre: nombreCarpeta,
        carpetaPadreId: carpetaActual?.id || null,
        autorId: currentUser.uid,
        autorNombre: currentUser.nombre || currentUser.displayName || 'Usuario'
      });
      // Recargar contenido
      cargarContenido(carpetaActual?.id || null);
    } catch (err) {
      console.error('Error al crear carpeta:', err);
      throw err;
    }
  };

  // Renombrar carpeta
  const handleRenombrarCarpeta = async (carpetaId, nuevoNombre) => {
    try {
      await renombrarCarpeta(carpetaId, nuevoNombre, currentUser.uid);
      // Recargar contenido
      cargarContenido(carpetaActual?.id || null);
    } catch (err) {
      console.error('Error al renombrar carpeta:', err);
      alert(err.message || 'Error al renombrar la carpeta. Intenta nuevamente.');
    }
  };

  // Eliminar carpeta
  const handleEliminarCarpeta = async (carpetaId) => {
    try {
      await eliminarCarpeta(carpetaId, currentUser.uid);
      // Recargar contenido
      cargarContenido(carpetaActual?.id || null);
    } catch (err) {
      console.error('Error al eliminar carpeta:', err);
      alert(err.message || 'Error al eliminar la carpeta. Intenta nuevamente.');
    }
  };

  // Mover carpeta (placeholder para funcionalidad futura)
  const handleMoverCarpeta = (carpetaId) => {
    alert('Funcionalidad de mover carpeta próximamente');
  };

  return (
    <div className="min-h-screen bg-background pt-8 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                <BookOpen className="h-10 w-10 text-brand" />
                <h1 className="text-4xl font-bold text-text-primary">
                  Material de Estudio UC
                </h1>
              </div>
              <p className="text-lg text-text-muted">
                Encuentra resúmenes, guías y material según tu carrera, año o ramo
              </p>
            </div>

            {currentUser && (
              <div className="flex gap-3">
                {esUsuarioExclusivo && (
                  <PrimaryButton
                    onClick={() => setIsFolderModalOpen(true)}
                    className="inline-flex items-center gap-2 whitespace-nowrap bg-purple-600 hover:bg-purple-700"
                  >
                    <FolderPlus className="h-5 w-5" />
                    Nueva Carpeta
                  </PrimaryButton>
                )}
                <PrimaryButton
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="h-5 w-5" />
                  Subir Material
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <Breadcrumb ruta={rutaCarpeta} onNavigate={handleNavegar} />

        {/* Buscador */}
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre de ramo, profesor o palabra clave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-semibold text-text-primary">Filtros</h2>
            </div>
            {(carreraSeleccionada || anioSeleccionado || ramoSeleccionado || searchTerm) && (
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted hover:text-brand transition-colors"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro Carrera */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Carrera
              </label>
              <select
                value={carreraSeleccionada}
                onChange={(e) => setCarreraSeleccionada(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              >
                <option value="">Todas las carreras</option>
                {carreras.map(carrera => (
                  <option key={carrera} value={carrera}>{carrera}</option>
                ))}
              </select>
            </div>

            {/* Filtro Año */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Año
              </label>
              <select
                value={anioSeleccionado}
                onChange={(e) => setAnioSeleccionado(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              >
                <option value="">Todos los años</option>
                {anios.map(anio => (
                  <option key={anio} value={anio}>{anio}º año</option>
                ))}
              </select>
            </div>

            {/* Filtro Ramo */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Ramo
              </label>
              <select
                value={ramoSeleccionado}
                onChange={(e) => setRamoSeleccionado(e.target.value)}
                disabled={!carreraSeleccionada}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Todos los ramos</option>
                {ramosDisponibles.map(ramo => (
                  <option key={ramo} value={ramo}>{ramo}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-500">
            <AlertCircle className="mt-1 h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredMateriales.length === 0 && carpetas.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center dark:bg-card/30">
            <Inbox className="mb-4 h-16 w-16 text-text-muted/50" />
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              {carpetaActual ? 'Carpeta vacía' : 'No hay contenido'}
            </h3>
            <p className="text-sm text-text-muted max-w-md">
              {currentUser
                ? 'No se encontraron carpetas ni materiales. Crea una carpeta o sube material para comenzar.'
                : 'No hay contenido disponible en este momento.'}
            </p>
            {currentUser && (
              <div className="flex gap-3 mt-6">
                {esUsuarioExclusivo && (
                  <PrimaryButton
                    onClick={() => setIsFolderModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <FolderPlus className="h-5 w-5" />
                    Crear Carpeta
                  </PrimaryButton>
                )}
                <PrimaryButton
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Subir Material
                </PrimaryButton>
              </div>
            )}
          </div>
        )}

        {/* Carpetas y Materiales */}
        {!loading && (carpetas.length > 0 || filteredMateriales.length > 0) && (
          <>
            {/* Contador */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-text-muted">
                {carpetas.length > 0 && `${carpetas.length} ${carpetas.length === 1 ? 'carpeta' : 'carpetas'}`}
                {carpetas.length > 0 && filteredMateriales.length > 0 && ' • '}
                {filteredMateriales.length > 0 && `${filteredMateriales.length} ${filteredMateriales.length === 1 ? 'archivo' : 'archivos'}`}
              </p>
            </div>

            {/* Grid de Carpetas */}
            {carpetas.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Carpetas</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {carpetas.map((carpeta) => (
                    <FolderCard
                      key={carpeta.id}
                      folder={carpeta}
                      onOpen={handleAbrirCarpeta}
                      onRename={handleRenombrarCarpeta}
                      onDelete={handleEliminarCarpeta}
                      onMove={handleMoverCarpeta}
                      canEdit={esUsuarioExclusivo}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Grid de Materiales */}
            {filteredMateriales.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Archivos</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMateriales.map((material) => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      esExclusivo={esUsuarioExclusivo}
                      onEliminar={handleEliminarMaterial}
                      onFijar={handleFijarMaterial}
                      currentUser={currentUser}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal para subir material */}
        {currentUser && (
          <>
            <SubirMaterialModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              usuario={currentUser}
              onMaterialSubido={handleMaterialSubido}
              carpetaActual={carpetaActual}
            />
            <CreateFolderModal
              isOpen={isFolderModalOpen}
              onClose={() => setIsFolderModalOpen(false)}
              onCrear={handleCrearCarpeta}
              carpetaPadre={carpetaActual}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Material;
