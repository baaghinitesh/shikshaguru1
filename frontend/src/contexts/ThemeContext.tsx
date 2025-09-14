import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { ThemeContextType, ThemePreference, ThemeOption } from '@/types';
import { storage } from '@/utils';

// Essential theme options - 6 themes that actually transform the app
const defaultThemes: ThemeOption[] = [
  {
    id: 'light',
    name: 'Light',
    category: 'light',
    preview: 'Clean and bright',
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#111827',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    category: 'dark',
    preview: 'Sleek and modern',
    colors: {
      primary: '#60a5fa',
      secondary: '#9ca3af',
      accent: '#fbbf24',
      background: '#111827',
      text: '#f9fafb',
    },
  },
  {
    id: 'blue',
    name: 'Blue',
    category: 'colorful',
    preview: 'Professional blue',
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#0ea5e9',
      background: '#f8fafc',
      text: '#0f172a',
    },
  },
  {
    id: 'green',
    name: 'Green',
    category: 'colorful',
    preview: 'Nature inspired',
    colors: {
      primary: '#059669',
      secondary: '#6b7280',
      accent: '#10b981',
      background: '#f0fdf4',
      text: '#064e3b',
    },
  },
  {
    id: 'red',
    name: 'Red',
    category: 'colorful',
    preview: 'Bold and energetic',
    colors: {
      primary: '#dc2626',
      secondary: '#6b7280',
      accent: '#f59e0b',
      background: '#fef2f2',
      text: '#7f1d1d',
    },
  },
  {
    id: 'purple',
    name: 'Purple',
    category: 'colorful',
    preview: 'Creative and elegant',
    colors: {
      primary: '#7c3aed',
      secondary: '#6b7280',
      accent: '#a855f7',
      background: '#faf5ff',
      text: '#581c87',
    },
  },
];

const defaultThemePreference: ThemePreference = {
  currentTheme: 'light',
  fontSize: 'medium',
  fontFamily: 'Inter',
  animations: true,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemePreference>(defaultThemePreference);
  const [themes] = useState<ThemeOption[]>(defaultThemes);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = storage.get<ThemePreference>('theme');
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  // Apply theme to document root - This is the key function that makes themes work!
  useEffect(() => {
    const root = document.documentElement;
    const currentThemeData = themes.find(t => t.id === theme.currentTheme);
    
    if (currentThemeData) {
      // Apply theme colors as CSS variables that will be used throughout the app
      const colors = theme.customColors || currentThemeData.colors;
      root.style.setProperty('--color-primary', colors.primary);
      root.style.setProperty('--color-secondary', colors.secondary);
      root.style.setProperty('--color-accent', colors.accent);
      root.style.setProperty('--color-background', colors.background);
      root.style.setProperty('--color-text', colors.text);
      
      // Apply theme class for specific theme overrides
      root.className = root.className.replace(/theme-\w+/g, '');
      root.classList.add(`theme-${theme.currentTheme}`);
      
      // Apply dark mode class for proper Tailwind dark: variant support
      if (currentThemeData.category === 'dark' || theme.currentTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Set the document background to match theme
      document.body.style.backgroundColor = colors.background;
      document.body.style.color = colors.text;
    }
    
    // Apply font size
    root.style.setProperty('--font-size-base', 
      theme.fontSize === 'small' ? '14px' : 
      theme.fontSize === 'large' ? '18px' : '16px'
    );
    
    // Apply font family
    root.style.setProperty('--font-family-primary', theme.fontFamily);
    
    // Apply animations preference
    if (!theme.animations) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Save theme to localStorage
    storage.set('theme', theme);
  }, [theme, themes]);

  const setTheme = (themeId: string) => {
    const themeOption = themes.find(t => t.id === themeId);
    if (themeOption) {
      setThemeState(prev => ({
        ...prev,
        currentTheme: themeId,
        customColors: undefined, // Reset custom colors when switching to predefined theme
      }));
    }
  };

  const setCustomColors = (colors: Partial<NonNullable<ThemePreference['customColors']>>) => {
    setThemeState(prev => ({
      ...prev,
      customColors: {
        primary: prev.customColors?.primary || '#3b82f6',
        secondary: prev.customColors?.secondary || '#64748b',
        accent: prev.customColors?.accent || '#f59e0b',
        background: prev.customColors?.background || '#ffffff',
        text: prev.customColors?.text || '#1f2937',
        ...colors,
      },
    }));
  };

  const setFontSize = (size: 'small' | 'medium' | 'large') => {
    setThemeState(prev => ({
      ...prev,
      fontSize: size,
    }));
  };

  const setFontFamily = (family: string) => {
    setThemeState(prev => ({
      ...prev,
      fontFamily: family,
    }));
  };

  const toggleAnimations = () => {
    setThemeState(prev => ({
      ...prev,
      animations: !prev.animations,
    }));
  };

  const value: ThemeContextType = {
    theme,
    themes,
    setTheme,
    setCustomColors,
    setFontSize,
    setFontFamily,
    toggleAnimations,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Custom hook for responsive design
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('md');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 475) setBreakpoint('xs');
      else if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else if (width < 1280) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
  };
}