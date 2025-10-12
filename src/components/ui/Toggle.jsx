import React from 'react';
import { Switch } from '@headlessui/react';
import { cn } from '../../utils/cn';

const Toggle = ({ label, description, className, checked, onChange, ...props }) => (
  <Switch.Group as="div" className={cn('flex items-center gap-3', className)}>
    <Switch
      checked={checked}
      onChange={onChange}
      className={cn(
        checked ? 'bg-[rgb(var(--brand))]' : 'bg-slate-300',
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:ring-blue-300 focus-visible:ring-offset-2',
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          checked ? 'translate-x-5' : 'translate-x-0',
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition',
        )}
      />
    </Switch>
    <Switch.Label className="flex flex-col text-sm text-[rgb(var(--text-primary))]">
      <span className="font-medium">{label}</span>
      {description && <span className="text-[rgb(var(--text-muted))]">{description}</span>}
    </Switch.Label>
  </Switch.Group>
);

export default Toggle;
