import React from 'react';
import { cn } from '../../utils/cn';

const PrimaryButton = React.forwardRef(({ as: Component = 'button', className, children, ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-lg bg-[rgb(var(--brand))] px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[rgb(var(--brand-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))] disabled:cursor-not-allowed disabled:opacity-60',
      className,
    )}
    {...props}
  >
    {children}
  </Component>
));

PrimaryButton.displayName = 'PrimaryButton';

export default PrimaryButton;
