import React, { useEffect, useState, useMemo } from 'react';
import { Megaphone, Plus, Inbox, AlertCircle, Search, Filter, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { obtenerAnuncios, eliminarAnuncio, fijarAnuncio } from '../services/anuncioService';
import AnuncioCard from '../components/AnuncioCard';
import CrearAnuncioModal from '../components/CrearAnuncioModal';
import PrimaryButton from '../components/ui/PrimaryButton';
import TextField from '../components/ui/TextField';
import SearchableSelect from '../components/ui/SearchableSelect';
import Toggle from '../components/ui/Toggle';
import { FACULTADES_UC, esParaMi } from '../data/facultades';

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
  const [facultadSeleccionada, setFacultadSeleccionada] = useState('');
  const [anioSeleccionado, setAnioSeleccionado] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const [soloParaMi, setSoloParaMi] = useState(false);

  // Opciones de filtros
  const opcionesFacultades = ['Todas las facultades', ...FACULTADES_UC];
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

      const matchesFacultad =
        !facultadSeleccionada ||
        facultadSeleccionada === 'Todas las facultades' ||
        facultadSeleccionada === 'Todas' ||
        anuncio.facultad === facultadSeleccionada ||
        (anuncio.facultades && anuncio.facultades.includes(facultadSeleccionada)) ||
        // Soporte para anuncios antiguos con carreras
        (!anuncio.facultades && anuncio.carrera === facultadSeleccionada) ||
        (!anuncio.facultades && anuncio.carreras && anuncio.carreras.includes(facultadSeleccionada));

      const matchesAnio =
        !anioSeleccionado ||
        anuncio.anio === parseInt(anioSeleccionado);

      // Filtro "Para mí": usar la nueva lógica basada en facultades
      const matchesParaMi = !soloParaMi || (() => {
        if (!currentUser?.carrera) return true;

        // Si tiene facultades (publicaciones nuevas)
        if (anuncio.facultades && anuncio.facultades.length > 0) {
          return esParaMi(anuncio.facultades, currentUser.carrera);
        }

        // Soporte para publicaciones antiguas con campo "carreras"
        if (anuncio.carreras && anuncio.carreras.length > 0) {
          return anuncio.carreras.includes('Todas') || anuncio.carreras.includes(currentUser.carrera);
        }

        // Si no tiene ni facultades ni carreras, mostrarlo
        return true;
      })();

      return matchesSearch && matchesFacultad && matchesAnio && matchesParaMi;
    });

    // Ordenar: fijados primero, luego por fecha
    return filtered.sort((a, b) => {
      if (a.fijado && !b.fijado) return -1;
      if (!a.fijado && b.fijado) return 1;
      return new Date(b.fecha) - new Date(a.fecha);
    });
  }, [anuncios, searchQuery, facultadSeleccionada, anioSeleccionado, soloParaMi, currentUser?.carrera]);

  // Limpiar filtros
  const limpiarFiltros = () => {
    setSearchQuery('');
    setFacultadSeleccionada('');
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
              <Toggle
                label={`Para mí (${currentUser.carrera})`}
                checked={soloParaMi}
                onChange={setSoloParaMi}
              />
            </div>
          )}

          {/* Filtros */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-brand" />
                <h2 className="text-lg font-semibold text-text-primary">Filtros</h2>
              </div>
              {(facultadSeleccionada || anioSeleccionado || searchQuery) && (
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
              {/* Filtro Facultad */}
              <SearchableSelect
                id="filtro-facultad"
                name="filtro-facultad"
                label="Filtrar por facultad"
                value={facultadSeleccionada}
                onChange={(e) => setFacultadSeleccionada(e.target.value)}
                options={opcionesFacultades}
                placeholder="Todas las facultades"
              />

              {/* Filtro Año */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Año
                </label>
                <select
                  value={anioSeleccionado}
                  onChange={(e) => setAnioSeleccionado(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background dark:bg-card border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors [&>option]:bg-background [&>option]:dark:bg-card [&>option]:text-text-primary"
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
