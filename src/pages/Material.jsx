import React, { useState, useEffect } from 'react';
import { obtenerMateriales, eliminarMaterial } from '../services/materialService';
import { useAuth } from '../context/AuthContext';
import { Search, BookOpen, Calendar, User, ExternalLink, Filter, X, Plus, Trash2 } from 'lucide-react';
import SubirMaterialModal from '../components/SubirMaterialModal';
import PrimaryButton from '../components/ui/PrimaryButton';

const Material = () => {
  const { currentUser } = useAuth();
  const [materiales, setMateriales] = useState([]);
  const [filteredMateriales, setFilteredMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eliminando, setEliminando] = useState(null);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [carreraSeleccionada, setCarreraSeleccionada] = useState('');
  const [anioSeleccionado, setAnioSeleccionado] = useState('');
  const [ramoSeleccionado, setRamoSeleccionado] = useState('');

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
      const materialesData = await obtenerMateriales();

      // Aplicar filtros client-side
      let materialesFiltrados = materialesData;

      if (carreraSeleccionada) {
        materialesFiltrados = materialesFiltrados.filter(m => m.carrera === carreraSeleccionada);
      }
      if (anioSeleccionado) {
        materialesFiltrados = materialesFiltrados.filter(m => m.anio === parseInt(anioSeleccionado));
      }
      if (ramoSeleccionado) {
        materialesFiltrados = materialesFiltrados.filter(m => m.ramo === ramoSeleccionado);
      }

      setMateriales(materialesFiltrados);
      setFilteredMateriales(materialesFiltrados);
    } catch (error) {
      console.error('Error al cargar materiales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMateriales();
  }, [carreraSeleccionada, anioSeleccionado, ramoSeleccionado]);

  // Filtrado por búsqueda de texto (client-side)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMateriales(materiales);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = materiales.filter(material => {
      const titulo = material.titulo?.toLowerCase() || '';
      const descripcion = material.descripcion?.toLowerCase() || '';
      const ramo = material.ramo?.toLowerCase() || '';
      const tags = material.tags?.join(' ').toLowerCase() || '';

      return titulo.includes(searchLower) ||
             descripcion.includes(searchLower) ||
             ramo.includes(searchLower) ||
             tags.includes(searchLower);
    });

    setFilteredMateriales(filtered);
  }, [searchTerm, materiales]);

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

        {/* Resultados */}
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
              <p className="mt-4 text-text-muted">Cargando materiales...</p>
            </div>
          ) : filteredMateriales.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <BookOpen className="h-16 w-16 text-text-muted mx-auto mb-4 opacity-50" />
              <p className="text-lg text-text-muted">
                No se encontraron materiales para esta búsqueda
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-text-muted">
                  {filteredMateriales.length} {filteredMateriales.length === 1 ? 'resultado' : 'resultados'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMateriales.map(material => (
                  <div
                    key={material.id}
                    className="bg-card border border-border rounded-xl p-6 hover:border-brand transition-all hover:shadow-lg group"
                  >
                    {/* Tipo de archivo badge y botón eliminar */}
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-brand/10 text-brand">
                        {material.tipo || 'PDF'}
                      </span>
                      {currentUser && currentUser.uid === material.autorId && (
                        <button
                          onClick={() => handleEliminarMaterial(material.id)}
                          disabled={eliminando === material.id}
                          className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar material"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Título */}
                    <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-brand transition-colors">
                      {material.titulo}
                    </h3>

                    {/* Descripción */}
                    <p className="text-sm text-text-muted mb-4 line-clamp-2">
                      {material.descripcion}
                    </p>

                    {/* Información del ramo */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-text-muted">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium">{material.ramo}</span>
                      </div>
                      <div className="text-text-muted">
                        <span className="font-medium">{material.carrera}</span> - Año {material.anio}
                      </div>
                    </div>

                    {/* Footer con autor y fecha */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        {material.autorNombre && (
                          <>
                            <User className="h-3 w-3" />
                            <span>{material.autorNombre}</span>
                          </>
                        )}
                      </div>
                      {material.fechaSubida && (
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(material.fechaSubida).toLocaleDateString('es-CL')}</span>
                        </div>
                      )}
                    </div>

                    {/* Botón Ver Material */}
                    <button
                      onClick={() => window.open(material.archivoUrl, '_blank')}
                      className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand/10 hover:bg-brand hover:text-white text-brand rounded-lg font-medium transition-all group-hover:bg-brand group-hover:text-white"
                    >
                      Ver material
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

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
