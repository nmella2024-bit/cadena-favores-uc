import React, { useEffect, useState, useMemo } from 'react';
import { Megaphone, Plus, Inbox, AlertCircle, Search, Filter, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { obtenerAnuncios, eliminarAnuncio, fijarAnuncio } from '../services/anuncioService';
import AnuncioCard from '../components/AnuncioCard';
import CrearAnuncioModal from '../components/CrearAnuncioModal';
import PrimaryButton from '../components/ui/PrimaryButton';
import TextField from '../components/ui/TextField';

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

const Anuncios = () => {
  const { currentUser } = useAuth();
  const [anuncios, setAnuncios] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [carreraSeleccionada, setCarreraSeleccionada] = useState('');
  const [anioSeleccionado, setAnioSeleccionado] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const [soloParaMi, setSoloParaMi] = useState(false);

  // Opciones de filtros
  const carreras = [
    'Ingeniería',
    'Arquitectura',
    'Economía',
    'College',
    'Todas'
  ];

  const anios = [1, 2, 3, 4, 5];

  const esUsuarioExclusivo = currentUser?.rol === 'exclusivo' || currentUser?.rol === 'admin';

  const cargarAnuncios = async () => {
    try {
      setIsLoading(true);
      setError('');
      const anunciosData = await obtenerAnuncios();
      setAnuncios(anunciosData);
    } catch (err) {
      console.error('Error al cargar anuncios:', err);
      setError('Error al cargar los anuncios. Intenta recargar la página.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarAnuncios();
  }, []);

  // Efecto para simular carga cuando cambia el filtro
  useEffect(() => {
    if (anuncios.length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Filtrar y ordenar anuncios (fijados primero)
  const filteredAnuncios = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = anuncios.filter((anuncio) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        anuncio.titulo.toLowerCase().includes(normalizedQuery) ||
        anuncio.descripcion.toLowerCase().includes(normalizedQuery);

      const matchesCarrera =
        !carreraSeleccionada ||
        carreraSeleccionada === 'Todas' ||
        anuncio.carrera === carreraSeleccionada;

      const matchesAnio =
        !anioSeleccionado ||
        anuncio.anio === parseInt(anioSeleccionado);

      // Filtro "Para mí": solo mostrar anuncios de mi carrera o sin carrera específica
      const matchesParaMi =
        !soloParaMi ||
        !currentUser?.carrera ||
        !anuncio.carreras || // Si el anuncio no tiene carreras específicas, mostrarlo
        anuncio.carreras.length === 0 || // Si el array está vacío, mostrarlo
        anuncio.carreras.includes('Todas') || // Si incluye "Todas", mostrarlo
        anuncio.carreras.includes(currentUser.carrera); // Si incluye mi carrera, mostrarlo

      return matchesSearch && matchesCarrera && matchesAnio && matchesParaMi;
    });

    // Ordenar: fijados primero, luego por fecha
    return filtered.sort((a, b) => {
      if (a.fijado && !b.fijado) return -1;
      if (!a.fijado && b.fijado) return 1;
      return new Date(b.fecha) - new Date(a.fecha);
    });
  }, [anuncios, searchQuery, carreraSeleccionada, anioSeleccionado, soloParaMi, currentUser?.carrera]);

  // Limpiar filtros
  const limpiarFiltros = () => {
    setSearchQuery('');
    setCarreraSeleccionada('');
    setAnioSeleccionado('');
  };

  const handleEliminarAnuncio = async (anuncioId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este anuncio?')) {
      return;
    }

    try {
      setEliminando(anuncioId);
      await eliminarAnuncio(anuncioId, currentUser.uid);
      setAnuncios(anuncios.filter(a => a.id !== anuncioId));
    } catch (err) {
      console.error('Error al eliminar anuncio:', err);
      alert(err.message || 'Error al eliminar el anuncio. Intenta nuevamente.');
    } finally {
      setEliminando(null);
    }
  };

  const handleAnuncioCreado = () => {
    cargarAnuncios();
  };

  const handleFijarAnuncio = async (anuncioId, nuevoEstado) => {
    // Validación adicional: verificar que el usuario sea exclusivo
    if (!esUsuarioExclusivo) {
      alert('Solo los usuarios con rol exclusivo pueden fijar anuncios.');
      return;
    }

    try {
      await fijarAnuncio(anuncioId, nuevoEstado, currentUser);
      // Actualizar el estado local
      setAnuncios(anuncios.map(a =>
        a.id === anuncioId ? { ...a, fijado: nuevoEstado } : a
      ));
    } catch (err) {
      console.error('Error al fijar/desfijar anuncio:', err);
      alert(err.message || 'Error al actualizar el anuncio. Intenta nuevamente.');
    }
  };

  return (
    <div className="bg-[rgb(var(--bg-canvas))] min-h-screen py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Megaphone className="h-8 w-8 text-brand" />
                <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                  Anuncios
                </h1>
              </div>
              <p className="text-text-muted">
                Mantente informado sobre las novedades de la comunidad UC
              </p>
            </div>

            {esUsuarioExclusivo && (
              <PrimaryButton
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="h-5 w-5" />
                Publicar anuncio
              </PrimaryButton>
            )}
          </div>

          {/* Buscador */}
          <div className="max-w-md mb-6">
            <TextField
              id="search-anuncios"
              label="Buscar anuncios"
              placeholder="Buscar por título o descripción..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              icon={Search}
            />
          </div>

          {/* Toggle "Para mí" */}
          {currentUser?.carrera && (
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer w-fit">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={soloParaMi}
                    onChange={(e) => setSoloParaMi(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-brand transition-colors peer-focus:ring-2 peer-focus:ring-brand/30"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
                <span className="text-sm font-medium text-text-primary">
                  Para mí ({currentUser.carrera})
                </span>
              </label>
            </div>
          )}

          {/* Filtros */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-brand" />
                <h2 className="text-lg font-semibold text-text-primary">Filtros</h2>
              </div>
              {(carreraSeleccionada || anioSeleccionado || searchQuery) && (
                <button
                  onClick={limpiarFiltros}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted hover:text-brand transition-colors"
                >
                  <X className="h-4 w-4" />
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAnuncios.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center dark:bg-card/30">
            <Inbox className="mb-4 h-16 w-16 text-text-muted/50" />
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              No hay anuncios publicados
            </h3>
            <p className="text-sm text-text-muted max-w-md">
              {esUsuarioExclusivo
                ? 'Sé el primero en publicar un anuncio para la comunidad.'
                : 'Aún no hay anuncios disponibles. Vuelve más tarde.'}
            </p>
            {esUsuarioExclusivo && (
              <PrimaryButton
                onClick={() => setIsModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Publicar primer anuncio
              </PrimaryButton>
            )}
          </div>
        )}

        {/* Anuncios List */}
        {!isLoading && filteredAnuncios.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAnuncios.map((anuncio) => (
              <AnuncioCard
                key={anuncio.id}
                anuncio={anuncio}
                esExclusivo={esUsuarioExclusivo}
                onEliminar={handleEliminarAnuncio}
                onFijar={handleFijarAnuncio}
              />
            ))}
          </div>
        )}

        {/* Modal para crear anuncio */}
        <CrearAnuncioModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          usuario={currentUser}
          onAnuncioCreado={handleAnuncioCreado}
        />
      </div>
    </div>
  );
};

export default Anuncios;
