import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { ThemeContextType, ThemePreference, ThemeOption } from '@/types';
import { storage } from '@/utils';

// Predefined theme options (20+ themes as specified)
const defaultThemes: ThemeOption[] = [
  // Light Themes
  {
    id: 'light',
    name: 'Light',
    category: 'light',
    preview: 'Clean and bright',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#1f2937',
    },
  },
  {
    id: 'light-blue',
    name: 'Light Blue',
    category: 'light',
    preview: 'Soft blue tones',
    colors: {
      primary: '#0ea5e9',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#f8fafc',
      text: '#0f172a',
    },
  },
  {
    id: 'light-green',
    name: 'Light Green',
    category: 'light',
    preview: 'Fresh green vibes',
    colors: {
      primary: '#10b981',
      secondary: '#6b7280',
      accent: '#f59e0b',
      background: '#f9fafb',
      text: '#111827',
    },
  },
  // Dark Themes
  {
    id: 'dark',
    name: 'Dark',
    category: 'dark',
    preview: 'Sleek and modern',
    colors: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      accent: '#fbbf24',
      background: '#111827',
      text: '#f9fafb',
    },
  },
  {
    id: 'dark-blue',
    name: 'Dark Blue',
    category: 'dark',
    preview: 'Deep blue darkness',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#0f172a',
      text: '#e2e8f0',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    category: 'dark',
    preview: 'Pure midnight elegance',
    colors: {
      primary: '#6366f1',
      secondary: '#71717a',
      accent: '#a855f7',
      background: '#09090b',
      text: '#fafafa',
    },
  },
  // Colorful Themes
  {
    id: 'blue-ocean',
    name: 'Blue Ocean',
    category: 'colorful',
    preview: 'Ocean depths',
    colors: {
      primary: '#0891b2',
      secondary: '#0e7490',
      accent: '#06b6d4',
      background: '#ecfeff',
      text: '#164e63',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    category: 'colorful',
    preview: 'Warm sunset colors',
    colors: {
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#f59e0b',
      background: '#fff7ed',
      text: '#9a3412',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    category: 'colorful',
    preview: 'Deep forest green',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      background: '#ecfdf5',
      text: '#064e3b',
    },
  },
  {
    id: 'purple-rain',
    name: 'Purple Rain',
    category: 'colorful',
    preview: 'Royal purple elegance',
    colors: {
      primary: '#7c3aed',
      secondary: '#6d28d9',
      accent: '#8b5cf6',
      background: '#faf5ff',
      text: '#581c87',
    },
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    category: 'colorful',
    preview: 'Fresh ocean air',
    colors: {
      primary: '#0284c7',
      secondary: '#0369a1',
      accent: '#38bdf8',
      background: '#f0f9ff',
      text: '#0c4a6e',
    },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    category: 'colorful',
    preview: 'Warm golden tones',
    colors: {
      primary: '#d97706',
      secondary: '#b45309',
      accent: '#f59e0b',
      background: '#fffbeb',
      text: '#92400e',
    },
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    category: 'colorful',
    preview: 'Soft pink petals',
    colors: {
      primary: '#ec4899',
      secondary: '#db2777',
      accent: '#f472b6',
      background: '#fdf2f8',
      text: '#be185d',
    },
  },
  {
    id: 'autumn-leaves',
    name: 'Autumn Leaves',
    category: 'colorful',
    preview: 'Warm autumn colors',
    colors: {
      primary: '#ea580c',
      secondary: '#c2410c',
      accent: '#fb923c',
      background: '#fff7ed',
      text: '#9a3412',
    },
  },
  {
    id: 'winter-frost',
    name: 'Winter Frost',
    category: 'colorful',
    preview: 'Cool winter tones',
    colors: {
      primary: '#0891b2',
      secondary: '#0e7490',
      accent: '#67e8f9',
      background: '#f0fdff',
      text: '#164e63',
    },
  },
  {
    id: 'spring-meadow',
    name: 'Spring Meadow',
    category: 'colorful',
    preview: 'Fresh spring green',
    colors: {
      primary: '#16a34a',
      secondary: '#15803d',
      accent: '#4ade80',
      background: '#f0fdf4',
      text: '#14532d',
    },
  },
  {
    id: 'summer-sky',
    name: 'Summer Sky',
    category: 'colorful',
    preview: 'Bright summer blue',
    colors: {
      primary: '#2563eb',
      secondary: '#1d4ed8',
      accent: '#60a5fa',
      background: '#eff6ff',
      text: '#1e3a8a',
    },
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    category: 'colorful',
    preview: 'Majestic purple',
    colors: {
      primary: '#9333ea',
      secondary: '#7e22ce',
      accent: '#a855f7',
      background: '#faf5ff',
      text: '#6b21a8',
    },
  },
  {
    id: 'emerald-green',
    name: 'Emerald Green',
    category: 'colorful',
    preview: 'Rich emerald tones',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#34d399',
      background: '#ecfdf5',
      text: '#064e3b',
    },
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    category: 'colorful',
    preview: 'Elegant rose gold',
    colors: {
      primary: '#f43f5e',
      secondary: '#e11d48',
      accent: '#fb7185',
      background: '#fff1f2',
      text: '#be123c',
    },
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    category: 'colorful',
    preview: 'Futuristic neon',
    colors: {
      primary: '#06ffa5',
      secondary: '#00d4aa',
      accent: '#39ff14',
      background: '#0a0a0a',
      text: '#00ff88',
    },
  },
  {
    id: 'warm-earth',
    name: 'Warm Earth',
    category: 'colorful',
    preview: 'Natural earth tones',
    colors: {
      primary: '#a16207',
      secondary: '#92400e',
      accent: '#d97706',
      background: '#fffbeb',
      text: '#78350f',
    },
  },
  {
    id: 'cool-mint',
    name: 'Cool Mint',
    category: 'colorful',
    preview: 'Refreshing mint',
    colors: {
      primary: '#14b8a6',
      secondary: '#0f766e',
      accent: '#5eead4',
      background: '#f0fdfa',
      text: '#134e4a',
    },
  },
  {
    id: 'vintage-sepia',
    name: 'Vintage Sepia',
    category: 'colorful',
    preview: 'Classic vintage look',
    colors: {
      primary: '#92400e',
      secondary: '#78350f',
      accent: '#d97706',
      background: '#fef3c7',
      text: '#451a03',
    },
  },
  {
    id: 'modern-grey',
    name: 'Modern Grey',
    category: 'colorful',
    preview: 'Sophisticated grey',
    colors: {
      primary: '#6b7280',
      secondary: '#4b5563',
      accent: '#9ca3af',
      background: '#f9fafb',
      text: '#111827',
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

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    const currentThemeData = themes.find(t => t.id === theme.currentTheme);
    
    if (currentThemeData) {
      // Apply theme colors as CSS variables
      const colors = theme.customColors || currentThemeData.colors;
      root.style.setProperty('--color-primary', colors.primary);
      root.style.setProperty('--color-secondary', colors.secondary);
      root.style.setProperty('--color-accent', colors.accent);
      root.style.setProperty('--color-background', colors.background);
      root.style.setProperty('--color-text', colors.text);
      
      // Apply theme class
      root.className = root.className.replace(/theme-\w+/g, '');
      root.classList.add(`theme-${theme.currentTheme}`);
      
      // Apply dark mode class if needed
      if (currentThemeData.category === 'dark' || theme.currentTheme.includes('dark')) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
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

// Custom hook for dark mode detection
export function useDarkMode() {
  const { theme, themes } = useTheme();
  const currentThemeData = themes.find(t => t.id === theme.currentTheme);
  
  return {
    isDark: currentThemeData?.category === 'dark' || theme.currentTheme.includes('dark'),
    isLight: currentThemeData?.category === 'light',
    isColorful: currentThemeData?.category === 'colorful',
  };
}