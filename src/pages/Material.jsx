import React, { useState, useEffect, useMemo } from 'react';
import { obtenerMateriales, eliminarMaterial, fijarMaterial } from '../services/materialService';
import { useAuth } from '../context/AuthContext';
import { Search, BookOpen, Filter, X, Plus, Inbox, AlertCircle } from 'lucide-react';
import SubirMaterialModal from '../components/SubirMaterialModal';
import MaterialCard from '../components/MaterialCard';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eliminando, setEliminando] = useState(null);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [carreraSeleccionada, setCarreraSeleccionada] = useState('');
  const [anioSeleccionado, setAnioSeleccionado] = useState('');
  const [ramoSeleccionado, setRamoSeleccionado] = useState('');

  const esUsuarioExclusivo = currentUser?.rol === 'exclusivo';

  // Opciones de filtros
  const carreras = [
    'Ingeniería',
    'Arquitectura',
    'Economía',
    'College',
    'Otras'
  ];

  const anios = [1, 2, 3, 4, 5];

  // Ramos dinámicos según carrera
  const ramosPorCarrera = {
    'Ingeniería': [
      'Cálculo I',
      'Cálculo II',
      'Cálculo III',
      'Álgebra Lineal',
      'Física I',
      'Física II',
      'Química General',
      'Programación',
      'Estructuras de Datos',
      'Ecuaciones Diferenciales'
    ],
    'Arquitectura': [
      'Taller de Arquitectura',
      'Historia de la Arquitectura',
      'Estructuras',
      'Construcción',
      'Teoría de la Arquitectura'
    ],
    'Economía': [
      'Microeconomía',
      'Macroeconomía',
      'Econometría',
      'Matemáticas para Economistas',
      'Finanzas'
    ],
    'College': [
      'Antropología',
      'Filosofía',
      'Historia',
      'Biología',
      'Química'
    ],
    'Otras': []
  };

  const ramosDisponibles = carreraSeleccionada ? ramosPorCarrera[carreraSeleccionada] || [] : [];

  // Cargar materiales
  const cargarMateriales = async () => {
    try {
      setLoading(true);
      setError('');
      const materialesData = await obtenerMateriales();
      setMateriales(materialesData);
    } catch (err) {
      console.error('Error al cargar materiales:', err);
      setError('Error al cargar los materiales. Intenta recargar la página.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMateriales();
  }, []);

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
      await eliminarMaterial(materialId);
      // Recargar materiales
      cargarMateriales();
    } catch (err) {
      console.error('Error al eliminar material:', err);
      alert('Error al eliminar el material. Intenta nuevamente.');
    } finally {
      setEliminando(null);
    }
  };

  // Manejar cuando se sube un nuevo material
  const handleMaterialSubido = () => {
    cargarMateriales();
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
              <PrimaryButton
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="h-5 w-5" />
                Subir Material
              </PrimaryButton>
            )}
          </div>
        </div>

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
        {!loading && filteredMateriales.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center dark:bg-card/30">
            <Inbox className="mb-4 h-16 w-16 text-text-muted/50" />
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              No se encontraron materiales
            </h3>
            <p className="text-sm text-text-muted max-w-md">
              {currentUser
                ? 'No se encontraron materiales para esta búsqueda. Intenta con otros filtros.'
                : 'No hay materiales disponibles en este momento.'}
            </p>
            {currentUser && (
              <PrimaryButton
                onClick={() => setIsModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Subir primer material
              </PrimaryButton>
            )}
          </div>
        )}

        {/* Materiales List */}
        {!loading && filteredMateriales.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-text-muted">
                {filteredMateriales.length} {filteredMateriales.length === 1 ? 'resultado' : 'resultados'}
              </p>
            </div>

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
          </>
        )}

        {/* Modal para subir material */}
        {currentUser && (
          <SubirMaterialModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            usuario={currentUser}
            onMaterialSubido={handleMaterialSubido}
          />
        )}
      </div>
    </div>
  );
};

export default Material;
