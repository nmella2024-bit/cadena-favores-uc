import React from 'react';
import { cn } from '../../utils/cn';

const TextareaField = React.forwardRef(
  ({ id, label, hint, error, className, textareaClassName, ...props }, ref) => (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-text-primary">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted shadow-sm transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-canvas))]',
          textareaClassName,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={hint || error ? `${id}-description` : undefined}
        {...props}
      />
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

TextareaField.displayName = 'TextareaField';

export default TextareaField;
