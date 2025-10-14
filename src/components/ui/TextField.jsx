import React from 'react';
import { cn } from '../../utils/cn';

const TextField = React.forwardRef(
  ({ id, label, hint, error, icon: Icon, className, inputClassName, ...props }, ref) => (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted shadow-sm transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-canvas))]',
            Icon && 'pl-10',
            inputClassName,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={hint || error ? `${id}-description` : undefined}
          {...props}
        />
      </div>
      {(hint || error) && (
        <p
          id={`${id}-description`}
          className={cn('text-sm', error ? 'text-red-500' : 'text-text-muted')}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  ),
);

TextField.displayName = 'TextField';

export default TextField;
