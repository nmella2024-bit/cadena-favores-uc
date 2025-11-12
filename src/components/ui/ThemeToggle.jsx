import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../../utils/cn';

const ThemeToggle = ({ className }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    const stored = localStorage.getItem('theme');
    if (stored) {
      return stored === 'dark';
    }
    // Modo claro por defecto
    return false;
  });

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/70 text-text-muted transition hover:bg-card/90 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-canvas))] dark:bg-card/50',
        className,
      )}
      onClick={() => setIsDark((prev) => !prev)}
      aria-label={`Activar modo ${isDark ? 'claro' : 'oscuro'}`}
      aria-pressed={isDark}
    >
      {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
};

export default ThemeToggle;
