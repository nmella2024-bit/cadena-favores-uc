import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Inbox, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FavorCard from '../components/FavorCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import GhostButton from '../components/ui/GhostButton';
import TextField from '../components/ui/TextField';
import SelectField from '../components/ui/SelectField';
import Toggle from '../components/ui/Toggle';
import { categories } from '../data/mockData';

const SkeletonCard = () => (
  <div
    className="animate-pulse rounded-xl border border-[rgb(var(--border))] bg-white/60 p-5 shadow-sm"
    data-testid="favor-skeleton"
  >
    <div className="h-6 w-2/3 rounded bg-slate-200" />
    <div className="mt-4 flex gap-3">
      <div className="h-4 w-24 rounded-full bg-slate-200" />
      <div className="h-4 w-20 rounded-full bg-slate-200" />
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-4 w-full rounded bg-slate-200" />
      <div className="h-4 w-5/6 rounded bg-slate-200" />
      <div className="h-4 w-2/3 rounded bg-slate-200" />
    </div>
    <div className="mt-6 flex gap-3">
      <div className="h-9 w-32 rounded-lg bg-slate-200" />
      <div className="h-9 w-24 rounded-lg bg-slate-200" />
    </div>
  </div>
);

const Favores = () => {
  const { favors, currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, onlyAvailable, favors.length]);

  const filteredFavors = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return favors.filter((favor) => {
      const matchesCategory = selectedCategory === 'all' || favor.categoria === selectedCategory;
      const matchesAvailability = !onlyAvailable || favor.estado === 'activo';
      const matchesSearch =
        normalizedQuery.length === 0 ||
        favor.titulo.toLowerCase().includes(normalizedQuery) ||
        favor.descripcion.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesAvailability && matchesSearch;
    });
  }, [favors, onlyAvailable, searchQuery, selectedCategory]);

  const activeFavors = filteredFavors.filter((favor) => favor.estado === 'activo');
  const completedFavors = filteredFavors.filter((favor) => favor.estado === 'completado');

  const showEmptyState = !isLoading && activeFavors.length === 0;

  return (
    <div className="bg-[rgb(var(--bg-canvas))] py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Favores publicados</h1>
            <p className="mt-2 text-[rgb(var(--text-muted))]">
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
          <aside className="space-y-6 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold tracking-tight">Filtrar búsqueda</h2>
            <TextField
              id="search"
              label="Buscar"
              placeholder="Título, descripción o palabra clave"
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
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5 text-sm text-blue-900 shadow-sm">
                <p>
                  <Link to="/login" className="font-semibold underline hover:text-blue-700">
                    Inicia sesión
                  </Link>{' '}
                  o{' '}
                  <Link to="/registro" className="font-semibold underline hover:text-blue-700">
                    crea una cuenta
                  </Link>{' '}
                  para ofrecer ayuda y marcar tus favores como completados.
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={`skeleton-${index}`} />
                ))}
              </div>
            ) : showEmptyState ? (
              <div className="mx-auto max-w-xl rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] p-12 text-center shadow-card">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-[rgb(var(--text-muted))]">
                  <Inbox className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight">No encontramos favores</h3>
                <p className="mt-3 text-sm text-[rgb(var(--text-muted))]">
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
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
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
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">
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
    </div>
  );
};

export default Favores;
