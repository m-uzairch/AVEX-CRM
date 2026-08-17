'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-24 bg-muted animate-pulse rounded-md border border-border" />
    );
  }

  return (
    <div className="flex items-center space-x-1 rounded-lg border border-border bg-card p-1 shadow-sm">
      <button
        onClick={() => setTheme('light')}
        className={`flex items-center justify-center rounded-md p-1.5 text-xs font-medium transition-colors ${
          theme === 'light'
            ? 'bg-primary text-primary-foreground shadow-xs'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
        title="Light Mode"
        type="button"
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`flex items-center justify-center rounded-md p-1.5 text-xs font-medium transition-colors ${
          theme === 'dark'
            ? 'bg-primary text-primary-foreground shadow-xs'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
        title="Dark Mode"
        type="button"
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`flex items-center justify-center rounded-md p-1.5 text-xs font-medium transition-colors ${
          theme === 'system'
            ? 'bg-primary text-primary-foreground shadow-xs'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
        title="System Mode"
        type="button"
        aria-label="System theme"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
}
