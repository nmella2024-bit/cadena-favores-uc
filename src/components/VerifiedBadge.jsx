import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * Badge de verificación para usuarios admin y exclusivo
 * Similar al check azul de Instagram
 */
const VerifiedBadge = ({ userRole, className, size = 'sm' }) => {
  // Solo mostrar para usuarios admin o exclusivo
  if (!userRole || (userRole !== 'admin' && userRole !== 'exclusivo')) {
    return null;
  }

  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <BadgeCheck
      className={cn(
        'inline-block fill-blue-500 text-white',
        sizeClasses[size],
        className
      )}
      aria-label="Usuario verificado"
      title="Usuario verificado"
    />
  );
};

export default VerifiedBadge;
