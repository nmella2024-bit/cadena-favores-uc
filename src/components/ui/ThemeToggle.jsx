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
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
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
        'inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-white/80 text-[rgb(var(--text-muted))] transition hover:bg-slate-100 hover:text-[rgb(var(--text-primary))] dark:bg-slate-900/70 dark:hover:bg-slate-800 dark:text-slate-300',
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
