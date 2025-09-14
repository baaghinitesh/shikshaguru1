import React, { useState } from 'react';
import { Palette, Settings, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils';
import type { ThemeOption } from '@/types';
import Button from './Button';
import Modal from './Modal';

interface ThemeSelectorProps {
  className?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'themes' | 'settings'>('themes');
  const { 
    theme, 
    themes, 
    setTheme, 
    setFontSize, 
    setFontFamily, 
    toggleAnimations 
  } = useTheme();

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
    // Close modal after a brief delay to show visual feedback
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const ThemePreview: React.FC<{ themeOption: ThemeOption; isActive: boolean }> = ({ 
    themeOption, 
    isActive 
  }) => (
    <div
      className={cn(
        'relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105',
        isActive 
          ? 'border-theme-primary ring-2 ring-opacity-20 bg-theme-surface' 
          : 'border-theme-border hover:border-theme-primary hover:shadow-md'
      )}
      onClick={() => handleThemeSelect(themeOption.id)}
    >
      <div className="flex items-center space-x-2 mb-3">
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
        className="w-full h-8 rounded border mb-3"
        style={{ backgroundColor: themeOption.colors.background }}
      />
      <h4 className="text-sm font-medium text-theme-text mb-1">
        {themeOption.name}
      </h4>
      <p className="text-xs text-theme-muted">
        {themeOption.preview}
      </p>
      {isActive && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-theme-primary rounded-full flex items-center justify-center">
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
        className={cn('p-2 hover:bg-theme-surface', className)}
      >
        <Palette className="w-5 h-5" />
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Theme Settings"
        size="lg"
        className="max-h-[90vh] overflow-y-auto"
      >
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-theme-surface p-1 rounded-lg border border-theme-border">
            <button
              onClick={() => setActiveTab('themes')}
              className={cn(
                'flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === 'themes'
                  ? 'bg-theme-primary text-white shadow'
                  : 'text-theme-muted hover:text-theme-text'
              )}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Themes
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={cn(
                'flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === 'settings'
                  ? 'bg-theme-primary text-white shadow'
                  : 'text-theme-muted hover:text-theme-text'
              )}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'themes' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-theme-text mb-2">Choose Your Theme</h3>
                <p className="text-sm text-theme-muted">
                  Select a theme to transform your entire app experience
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {themes.map((themeOption) => (
                  <ThemePreview
                    key={themeOption.id}
                    themeOption={themeOption}
                    isActive={theme.currentTheme === themeOption.id}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-theme-text mb-3">
                  Font Size
                </label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size as 'small' | 'medium' | 'large')}
                      className={cn(
                        'flex-1 px-4 py-2 text-sm rounded-md border transition-colors capitalize',
                        theme.fontSize === size
                          ? 'border-theme-primary bg-theme-primary text-white'
                          : 'border-theme-border bg-theme-surface text-theme-text hover:bg-theme-border'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-theme-text mb-3">
                  Font Family
                </label>
                <select
                  value={theme.fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-md text-theme-text focus:outline-none focus:border-theme-primary"
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
                    <label className="text-sm font-medium text-theme-text">
                      Animations
                    </label>
                    <p className="text-xs text-theme-muted">
                      Enable smooth transitions and animations
                    </p>
                  </div>
                  <button
                    onClick={toggleAnimations}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      theme.animations ? 'bg-theme-primary' : 'bg-theme-border'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        theme.animations ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
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