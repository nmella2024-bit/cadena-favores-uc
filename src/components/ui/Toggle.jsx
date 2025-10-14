import React from 'react';
import { Switch } from '@headlessui/react';
import { cn } from '../../utils/cn';

const Toggle = ({ label, description, className, checked, onChange, ...props }) => (
  <Switch.Group as="div" className={cn('flex items-center gap-3', className)}>
    <Switch
      checked={checked}
      onChange={onChange}
      className={cn(
        checked ? 'bg-brand' : 'bg-border',
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))]',
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          checked ? 'translate-x-5' : 'translate-x-0',
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition dark:bg-slate-200',
        )}
      />
    </Switch>
    <Switch.Label className="flex flex-col text-sm text-text-primary">
      <span className="font-medium">{label}</span>
      {description && <span className="text-text-muted">{description}</span>}
    </Switch.Label>
  </Switch.Group>
);

export default Toggle;
