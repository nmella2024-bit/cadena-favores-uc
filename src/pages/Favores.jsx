import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, Inbox, Search, X, CalendarDays, UserRound, Tag, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { obtenerFavores, responderFavor, eliminarFavor, ofrecerAyuda } from '../services/favorService';
import FavorCard from '../components/FavorCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import GhostButton from '../components/ui/GhostButton';
import TextField from '../components/ui/TextField';
import SelectField from '../components/ui/SelectField';
import Toggle from '../components/ui/Toggle';
import { categories } from '../data/mockData';

const SkeletonCard = () => (
  <div
    className="animate-pulse rounded-xl border border-border bg-card/70 p-5 shadow-sm dark:bg-card/60"
    data-testid="favor-skeleton"
  >
    <div className="h-6 w-2/3 rounded bg-border/80 dark:bg-border/40" />
    <div className="mt-4 flex gap-3">
      <div className="h-4 w-24 rounded-full bg-border/80 dark:bg-border/40" />
      <div className="h-4 w-20 rounded-full bg-border/80 dark:bg-border/40" />
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-4 w-full rounded bg-border/80 dark:bg-border/40" />
      <div className="h-4 w-5/6 rounded bg-border/80 dark:bg-border/40" />
      <div className="h-4 w-2/3 rounded bg-border/80 dark:bg-border/40" />
    </div>
    <div className="mt-6 flex gap-3">
      <div className="h-9 w-32 rounded-lg bg-border/80 dark:bg-border/40" />
      <div className="h-9 w-24 rounded-lg bg-border/80 dark:bg-border/40" />
    </div>
  </div>
);

const Favores = () => {
  const { currentUser, firebaseUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [favors, setFavors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const favorId = searchParams.get('id');
  const selectedFavor = favors.find(f => f.id === favorId);

  // Cargar favores desde Firestore al montar el componente
  useEffect(() => {
    const cargarFavores = async () => {
      try {
        setIsLoading(true);
        setError('');
        const favoresData = await obtenerFavores();
        setFavors(favoresData);
      } catch (err) {
        console.error('Error al cargar favores:', err);
        setError('Error al cargar los favores. Intenta recargar la página.');
      } finally {
        setIsLoading(false);
      }
    };

    cargarFavores();
  }, []);

  // Efecto para simular carga cuando cambian los filtros
  useEffect(() => {
    if (favors.length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedCategory, searchQuery, onlyAvailable]);

  const filteredFavors = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return favors.filter((favor) => {
      const matchesCategory = selectedCategory === 'all' || favor.categoria === selectedCategory;
      const matchesAvailability = !onlyAvailable || favor.estado === 'activo';
      const matchesSearch =
        normalizedQuery.length === 0 ||
        favor.titulo.toLowerCase().includes(normalizedQuery) ||
        favor.descripcion.toLowerCase().includes(normalizedQuery) ||
        (favor.disponibilidad && favor.disponibilidad.toLowerCase().includes(normalizedQuery));

      return matchesCategory && matchesAvailability && matchesSearch;
    });
  }, [favors, onlyAvailable, searchQuery, selectedCategory]);

  const activeFavors = filteredFavors.filter((favor) => favor.estado === 'activo');
  const completedFavors = filteredFavors.filter((favor) => favor.estado === 'completado');

  const showEmptyState = !isLoading && activeFavors.length === 0;

  // Modal functions
  const closeModal = () => {
    setSearchParams({});
  };

  const handleRespond = async () => {
    if (!currentUser || !selectedFavor) return;

    // Verificar que no sea el creador
    if (selectedFavor.usuarioId === currentUser.uid) {
      alert('No puedes ofrecer ayuda en tu propio favor');
      return;
    }

    // Verificar que tenga teléfono
    if (!currentUser.telefono) {
      alert('Necesitas agregar tu número de WhatsApp en tu perfil para ofrecer ayuda');
      return;
    }

    if (window.confirm('¿Deseas ofrecer ayuda con este favor?')) {
      try {
        await ofrecerAyuda(selectedFavor.id, currentUser);
        alert('¡Gracias por tu ayuda! El solicitante podrá ver tu oferta.');
        closeModal();
        // Recargar los favores
        const favoresData = await obtenerFavores();
        setFavors(favoresData);
      } catch (error) {
        console.error('Error al ofrecer ayuda:', error);
        alert(error.message || 'Error al ofrecer ayuda. Intenta nuevamente.');
      }
    }
  };

  const handleDelete = async () => {
    if (!firebaseUser || !selectedFavor) return;

    if (window.confirm('¿Estás seguro de eliminar este favor?')) {
      try {
        await eliminarFavor(selectedFavor.id);
        alert('Favor eliminado exitosamente');
        closeModal();
        window.location.reload();
      } catch (error) {
        console.error('Error al eliminar favor:', error);
        alert('Error al eliminar el favor. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className="bg-[rgb(var(--bg-canvas))] py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Favores publicados</h1>
            <p className="mt-2 text-text-muted">
              {activeFavors.length} {activeFavors.length === 1 ? 'favor activo' : 'favores activos'} disponibles para
              ayudar hoy.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {currentUser ? (
              <PrimaryButton as={Link} to="/publicar" className="px-4 py-2">
                Publicar favor
              </PrimaryButton>
            ) : (
              <GhostButton as={Link} to="/login" className="px-4 py-2">
                Inicia sesión para ayudar
              </GhostButton>
            )}
          </div>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-[320px,1fr] lg:items-start">
          <aside className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-24 dark:bg-card/80">
            <h2 className="text-lg font-semibold tracking-tight">Filtrar búsqueda</h2>
            <TextField
              id="search"
              label="Buscar"
              placeholder="Título, descripción, disponibilidad o palabra clave"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              hint="Atajo: Ctrl + K"
              icon={Search}
            />
            <SelectField
              id="category"
              label="Categoría"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </SelectField>
            <Toggle
              label="Solo favores disponibles"
              description="Oculta los que ya están completados"
              checked={onlyAvailable}
              onChange={setOnlyAvailable}
            />
          </aside>

          <div className="space-y-8">
            {!currentUser && (
              <div className="rounded-xl border border-brand/30 bg-brand/10 p-5 text-sm text-brand shadow-sm dark:border-brand/20 dark:bg-brand/15">
                <p>
                  <Link to="/login" className="font-semibold underline hover:text-brand/80">
                    Inicia sesión
                  </Link>{' '}
                  o{' '}
                  <Link to="/registro" className="font-semibold underline hover:text-brand/80">
                    crea una cuenta
                  </Link>{' '}
                  para ofrecer ayuda y marcar tus favores como completados.
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-500">
                <p className="font-semibold">Error al cargar favores</p>
                <p className="mt-1">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 text-xs font-semibold underline hover:text-red-400"
                >
                  Recargar página
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={`skeleton-${index}`} />
                ))}
              </div>
            ) : showEmptyState ? (
              <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-12 text-center shadow-card dark:bg-card/80">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Inbox className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight">No encontramos favores</h3>
                <p className="mt-3 text-sm text-text-muted">
                  Ajusta los filtros o publica el primer favor para que otros estudiantes puedan ayudarte.
                </p>
                {currentUser ? (
                  <PrimaryButton as={Link} to="/publicar" className="mt-6">
                    Publicar el primero
                  </PrimaryButton>
                ) : (
                  <GhostButton as={Link} to="/publicar" className="mt-6">
                    Publicar el primero
                  </GhostButton>
                )}
              </div>
            ) : (
              <div className="space-y-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
                    <Briefcase className="h-4 w-4" aria-hidden="true" />
                    Favores activos
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {activeFavors.map((favor) => (
                      <FavorCard key={favor.id} favor={favor} />
                    ))}
                  </div>
                </div>

                {completedFavors.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
                      <Briefcase className="h-4 w-4" aria-hidden="true" />
                      Favores completados ({completedFavors.length})
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      {completedFavors.map((favor) => (
                        <FavorCard key={favor.id} favor={favor} className="opacity-80" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal de detalles del favor */}
      {selectedFavor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl dark:bg-card/95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-start justify-between dark:bg-card/95">
              <div className="flex-1 pr-8">
                <h2 className="text-2xl font-bold text-text-primary">{selectedFavor.titulo}</h2>
                {selectedFavor.estado === 'completado' && (
                  <span className="inline-flex mt-2 items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-500">
                    Completado
                  </span>
                )}
              </div>
              <button
                onClick={closeModal}
                className="shrink-0 rounded-lg p-2 text-text-muted hover:bg-card/80 hover:text-text-primary transition-colors dark:hover:bg-card/60"
                aria-label="Cerrar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                {(() => {
                  const category = categories.find((c) => c.id === selectedFavor.categoria);
                  return category ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide dark:bg-card/50">
                      <Tag className="h-4 w-4" />
                      {category.name}
                    </span>
                  ) : null;
                })()}
                <span className="inline-flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  <span>{selectedFavor.solicitante || selectedFavor.nombreUsuario}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <time dateTime={selectedFavor.fecha}>{selectedFavor.fecha}</time>
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Descripción</h3>
                <p className="text-text-muted whitespace-pre-wrap">{selectedFavor.descripcion}</p>
              </div>

              {/* Availability */}
              {selectedFavor.disponibilidad && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Disponibilidad</h3>
                  <p className="text-text-muted">{selectedFavor.disponibilidad}</p>
                </div>
              )}

              {/* Estado */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Estado</h3>
                <p className="text-text-muted">
                  {selectedFavor.estado === 'completado' ? 'Completado' : 'Disponible'}
                </p>
              </div>

              {/* Mostrar información sobre ofertas de ayuda */}
              {selectedFavor.ayudantes && selectedFavor.ayudantes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Ofertas de ayuda
                  </h3>
                  {currentUser && selectedFavor.usuarioId === currentUser.uid ? (
                    <p className="text-sm text-text-muted">
                      {selectedFavor.ayudantes.length} {selectedFavor.ayudantes.length === 1 ? 'persona ha ofrecido' : 'personas han ofrecido'} ayuda.
                      <Link to={`/favor/${selectedFavor.id}`} className="text-brand hover:underline ml-1">
                        Ver detalles →
                      </Link>
                    </p>
                  ) : (
                    <p className="text-sm text-text-muted">
                      {selectedFavor.ayudantes.length} {selectedFavor.ayudantes.length === 1 ? 'persona ha ofrecido' : 'personas han ofrecido'} ayuda
                    </p>
                  )}
                </div>
              )}

              {/* Mostrar ayudante seleccionado */}
              {selectedFavor.ayudanteSeleccionado && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Ayudante seleccionado
                  </h3>
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
                    <p className="font-semibold text-text-primary">{selectedFavor.ayudanteSeleccionado.nombre}</p>
                    <p className="text-xs text-text-muted mt-1">{selectedFavor.ayudanteSeleccionado.carrera}</p>

                    {/* Mostrar WhatsApp si eres parte del favor */}
                    {currentUser && (currentUser.uid === selectedFavor.usuarioId || currentUser.uid === selectedFavor.ayudanteSeleccionado.idUsuario) && (
                      <a
                        href={`https://wa.me/${selectedFavor.ayudanteSeleccionado.telefono.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20 transition-colors dark:text-emerald-400 mt-3"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Contactar por WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex flex-wrap gap-3 justify-end dark:bg-card/95">
              <GhostButton onClick={closeModal} className="px-4 py-2">
                Cerrar
              </GhostButton>
              {currentUser && selectedFavor.usuarioId !== currentUser.uid && selectedFavor.estado === 'activo' && !selectedFavor.ayudanteSeleccionado && (
                <PrimaryButton
                  onClick={handleRespond}
                  className="px-4 py-2"
                  disabled={selectedFavor.ayudantes?.some(a => a.idUsuario === currentUser.uid)}
                >
                  {selectedFavor.ayudantes?.some(a => a.idUsuario === currentUser.uid) ? 'Ya ofreciste ayuda' : 'Ofrecer ayuda'}
                </PrimaryButton>
              )}
              {currentUser && selectedFavor.usuarioId === currentUser.uid && selectedFavor.estado === 'activo' && (
                <GhostButton
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-500 hover:bg-red-500/10 hover:text-red-400 focus-visible:ring-red-500/40"
                >
                  Eliminar favor
                </GhostButton>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favores;
