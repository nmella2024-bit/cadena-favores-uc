import React from 'react';
import { cn } from '../../utils/cn';

const GhostButton = React.forwardRef(({ as: Component = 'button', className, children, ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-lg border border-border bg-card/70 px-5 py-3 text-sm font-medium text-text-primary shadow-sm transition-colors hover:bg-card/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-card/60 dark:shadow-none',
      className,
    )}
    {...props}
  >
    {children}
  </Component>
));

GhostButton.displayName = 'GhostButton';

export default GhostButton;
