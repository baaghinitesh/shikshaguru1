import React, { useState } from 'react';
import { Palette, Settings, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils';
import Button from './Button';
import Modal from './Modal';


interface ThemeSelectorProps {
  className?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'themes' | 'custom' | 'settings'>('themes');
  const { 
    theme, 
    themes, 
    setTheme, 
    setCustomColors, 
    setFontSize, 
    setFontFamily, 
    toggleAnimations 
  } = useTheme();

  const [customColors, setCustomColorsState] = useState({
    primary: theme.customColors?.primary || '#3b82f6',
    secondary: theme.customColors?.secondary || '#64748b',
    accent: theme.customColors?.accent || '#f59e0b',
    background: theme.customColors?.background || '#ffffff',
    text: theme.customColors?.text || '#1f2937',
  });

  const handleCustomColorChange = (colorKey: string, value: string) => {
    const newColors = { ...customColors, [colorKey]: value };
    setCustomColorsState(newColors);
    setCustomColors(newColors);
  };

  const themesByCategory = {
    light: themes.filter(t => t.category === 'light'),
    dark: themes.filter(t => t.category === 'dark'),
    colorful: themes.filter(t => t.category === 'colorful'),
  };

  const ThemePreview: React.FC<{ themeOption: any; isActive: boolean }> = ({ 
    themeOption, 
    isActive 
  }) => (
    <div
      className={cn(
        'relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
        isActive 
          ? 'border-primary-500 ring-2 ring-primary-200' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
      )}
      onClick={() => setTheme(themeOption.id)}
    >
      <div className="flex items-center space-x-2 mb-2">
        <div 
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: themeOption.colors.primary }}
        />
        <div 
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: themeOption.colors.secondary }}
        />
        <div 
          className="w-4 h-4 rounded-full border"
          style={{ backgroundColor: themeOption.colors.accent }}
        />
      </div>
      <div 
        className="w-full h-8 rounded border mb-2"
        style={{ backgroundColor: themeOption.colors.background }}
      />
      <p className="text-xs font-medium text-gray-900 dark:text-white">
        {themeOption.name}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {themeOption.preview}
      </p>
      {isActive && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}
    </div>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn('p-2', className)}
      >
        <Palette className="w-5 h-5" />
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Theme Settings"
        size="xl"
      >
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('themes')}
              className={cn(
                'flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === 'themes'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              )}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Themes
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={cn(
                'flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === 'custom'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              )}
            >
              <Palette className="w-4 h-4 mr-2" />
              Custom
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={cn(
                'flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === 'settings'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              )}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'themes' && (
            <div className="space-y-6">
              {/* Light Themes */}
              <div>
                <div className="flex items-center mb-3">
                  <Sun className="w-4 h-4 mr-2 text-yellow-500" />
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Light Themes
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {themesByCategory.light.map((themeOption) => (
                    <ThemePreview
                      key={themeOption.id}
                      themeOption={themeOption}
                      isActive={theme.currentTheme === themeOption.id}
                    />
                  ))}
                </div>
              </div>

              {/* Dark Themes */}
              <div>
                <div className="flex items-center mb-3">
                  <Moon className="w-4 h-4 mr-2 text-blue-500" />
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Dark Themes
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {themesByCategory.dark.map((themeOption) => (
                    <ThemePreview
                      key={themeOption.id}
                      themeOption={themeOption}
                      isActive={theme.currentTheme === themeOption.id}
                    />
                  ))}
                </div>
              </div>

              {/* Colorful Themes */}
              <div>
                <div className="flex items-center mb-3">
                  <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Colorful Themes
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {themesByCategory.colorful.map((themeOption) => (
                    <ThemePreview
                      key={themeOption.id}
                      themeOption={themeOption}
                      isActive={theme.currentTheme === themeOption.id}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create your own color scheme by adjusting the colors below.
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(customColors).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-3">
                    <label className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {key}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => handleCustomColorChange(key, e.target.value)}
                        className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleCustomColorChange(key, e.target.value)}
                        className="w-20 px-2 py-1 text-xs border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Preview
                </h5>
                <div className="space-y-2">
                  <div 
                    className="h-8 rounded flex items-center px-3"
                    style={{ 
                      backgroundColor: customColors.background,
                      color: customColors.text,
                      border: `1px solid ${customColors.primary}`
                    }}
                  >
                    <span className="text-sm">Sample content with custom colors</span>
                  </div>
                  <div className="flex space-x-2">
                    <div 
                      className="px-3 py-1 rounded text-sm text-white"
                      style={{ backgroundColor: customColors.primary }}
                    >
                      Primary
                    </div>
                    <div 
                      className="px-3 py-1 rounded text-sm text-white"
                      style={{ backgroundColor: customColors.secondary }}
                    >
                      Secondary
                    </div>
                    <div 
                      className="px-3 py-1 rounded text-sm text-white"
                      style={{ backgroundColor: customColors.accent }}
                    >
                      Accent
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Size
                </label>
                <div className="flex space-x-2">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size as any)}
                      className={cn(
                        'px-3 py-2 text-sm rounded-md border transition-colors capitalize',
                        theme.fontSize === size
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                          : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Family
                </label>
                <select
                  value={theme.fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="input"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>

              {/* Animations */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Animations
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Enable smooth transitions and animations
                    </p>
                  </div>
                  <button
                    onClick={toggleAnimations}
                    className={cn(
                      'theme-toggle',
                      theme.animations ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  >
                    <span className="theme-toggle-slider" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ThemeSelector;