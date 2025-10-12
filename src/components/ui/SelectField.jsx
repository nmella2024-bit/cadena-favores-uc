import React from 'react';
import { cn } from '../../utils/cn';

const SelectField = React.forwardRef(
  ({ id, label, hint, error, className, selectClassName, children, ...props }, ref) => (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-[rgb(var(--text-primary))]">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={cn(
          'w-full rounded-lg border border-[rgb(var(--border))] bg-white px-3 py-2 text-sm text-[rgb(var(--text-primary))] focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
          selectClassName,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={hint || error ? `${id}-description` : undefined}
        {...props}
      >
        {children}
      </select>
      {(hint || error) && (
        <p
          id={`${id}-description`}
          className={cn('text-sm', error ? 'text-red-600' : 'text-[rgb(var(--text-muted))]')}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  ),
);

SelectField.displayName = 'SelectField';

export default SelectField;
