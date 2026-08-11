import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface SeverityColors {
  critical: string;
  high: string;
  medium: string;
  low: string;
}

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  severityColors: SeverityColors;
  setSeverityColors: (colors: SeverityColors) => void;
}

const defaultColors: SeverityColors = {
  critical: '#EF4444', // red-500
  high: '#F97316',     // orange-500
  medium: '#F59E0B',   // yellow-500
  low: '#3B82F6',      // blue-500
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('gitarmor_theme') as Theme) || 'dark';
  });

  const [severityColors, setSeverityColors] = useState<SeverityColors>(() => {
    try {
      const saved = localStorage.getItem('gitarmor_severity_colors');
      return saved ? JSON.parse(saved) : defaultColors;
    } catch {
      return defaultColors;
    }
  });

  useEffect(() => {
    localStorage.setItem('gitarmor_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('gitarmor_severity_colors', JSON.stringify(severityColors));
    // Apply custom colors to CSS variables
    document.documentElement.style.setProperty('--color-sev-critical', severityColors.critical);
    document.documentElement.style.setProperty('--color-sev-high', severityColors.high);
    document.documentElement.style.setProperty('--color-sev-medium', severityColors.medium);
    document.documentElement.style.setProperty('--color-sev-low', severityColors.low);
  }, [severityColors]);

  return (
    <SettingsContext.Provider value={{ theme, setTheme, severityColors, setSeverityColors }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
