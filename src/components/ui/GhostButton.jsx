import React from 'react';
import { cn } from '../../utils/cn';

const GhostButton = React.forwardRef(({ as: Component = 'button', className, children, ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-white px-5 py-3 text-sm font-medium text-[rgb(var(--text-primary))] shadow-sm transition-colors hover:bg-slate-50 focus-visible:ring-blue-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
      className,
    )}
    {...props}
  >
    {children}
  </Component>
));

GhostButton.displayName = 'GhostButton';

export default GhostButton;
