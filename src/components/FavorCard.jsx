import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Link2, Tag, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/mockData';
import PrimaryButton from './ui/PrimaryButton';
import GhostButton from './ui/GhostButton';
import { cn } from '../utils/cn';

const FavorCard = ({ favor, className }) => {
  const { currentUser, respondToFavor, deleteFavor } = useAuth();

  const category = categories.find((c) => c.id === favor.categoria);
  const isOwnFavor = currentUser && favor.solicitanteId === currentUser.id;
  const canRespond = currentUser && !isOwnFavor && favor.estado === 'activo';
  const isCompleted = favor.estado === 'completado';

  const handleRespond = () => {
    if (window.confirm('¿Deseas ofrecer ayuda con este favor?')) {
      respondToFavor(favor.id);
      alert('¡Gracias por tu ayuda! La persona solicitante fue notificada.');
    }
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de eliminar este favor?')) {
      deleteFavor(favor.id);
    }
  };

  return (
    <article
      className={cn(
        'rounded-xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md dark:bg-card/80',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-xl font-semibold tracking-tight" data-testid="favor-title">
          {favor.titulo}
        </h3>
        {isCompleted && (
          <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-500">
            Completado
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-muted">
        {category && (
          <span
            data-testid="favor-category"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-muted dark:bg-card/50"
          >
            <Tag className="h-4 w-4" aria-hidden="true" />
            {category.name}
          </span>
        )}
        <span className="inline-flex items-center gap-2">
          <UserRound className="h-4 w-4" aria-hidden="true" />
          <span>{favor.solicitante}</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          <time dateTime={favor.fecha}>{favor.fecha}</time>
        </span>
      </div>

      <p className="mt-4 line-clamp-3 text-text-muted">{favor.descripcion}</p>

      {favor.disponibilidad && (
        <p className="mt-3 text-sm text-text-muted">
          <span className="font-medium text-text-primary">Disponibilidad:</span> {favor.disponibilidad}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-text-muted">
          <span className="font-medium text-text-primary">Estado:</span>{' '}
          {isCompleted ? 'Completado' : 'Disponible'}
        </div>
        <div className="flex flex-wrap gap-2">
          {canRespond && (
            <PrimaryButton
              data-testid="cta-offer"
              type="button"
              onClick={handleRespond}
              className="px-4 py-2 text-sm"
            >
              Ofrecer ayuda
            </PrimaryButton>
          )}
          {isOwnFavor && favor.estado === 'activo' && (
            <GhostButton
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 hover:text-red-400 focus-visible:ring-red-500/40"
            >
              Eliminar
            </GhostButton>
          )}
          <GhostButton as={Link} to={`/favores?id=${favor.id}`} className="px-4 py-2 text-sm">
            <span className="inline-flex items-center gap-2">
              <Link2 className="h-4 w-4" aria-hidden="true" />
              Detalles
            </span>
          </GhostButton>
        </div>
      </div>
    </article>
  );
};

export default FavorCard;
