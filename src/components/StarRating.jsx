import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * Componente para mostrar y seleccionar calificaciones con estrellas
 * @param {Object} props
 * @param {number} props.rating - Calificación actual (1-5)
 * @param {Function} props.onRatingChange - Callback cuando cambia la calificación (solo en modo interactivo)
 * @param {boolean} props.interactive - Si es interactivo (se puede cambiar) o solo lectura
 * @param {string} props.size - Tamaño: 'sm', 'md', 'lg'
 * @param {boolean} props.showNumber - Si muestra el número junto a las estrellas
 */
const StarRating = ({
  rating = 0,
  onRatingChange,
  interactive = false,
  size = 'md',
  showNumber = false,
  className,
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleClick = (newRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const handleMouseEnter = (star) => {
    if (interactive) {
      setHoverRating(star);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayRating;
        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={!interactive}
            className={cn(
              'transition-all duration-150',
              interactive && 'cursor-pointer hover:scale-110',
              !interactive && 'cursor-default'
            )}
            aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors duration-150',
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-gray-300 dark:text-gray-600'
              )}
            />
          </button>
        );
      })}
      {showNumber && (
        <span className="ml-2 text-sm font-medium text-text-muted">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
