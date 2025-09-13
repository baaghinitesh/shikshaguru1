class ThemeService
  THEMES = {
    'light' => {
      name: 'Light',
      description: 'Clean and bright theme for daytime use',
      data_theme: 'light',
      bg_class: 'bg-base-100',
      text_class: 'text-base-content'
    },
    'dark' => {
      name: 'Dark',
      description: 'Easy on the eyes for nighttime use',
      data_theme: 'dark',
      bg_class: 'bg-base-100',
      text_class: 'text-base-content'
    },
    'cupcake' => {
      name: 'Cupcake',
      description: 'Sweet and colorful theme',
      data_theme: 'cupcake',
      bg_class: 'bg-base-100',
      text_class: 'text-base-content'
    },
    'synthwave' => {
      name: 'Synthwave',
      description: 'Retro cyberpunk theme',
      data_theme: 'synthwave',
      bg_class: 'bg-base-100',
      text_class: 'text-base-content'
    },
    'valentine' => {
      name: 'Valentine',
      description: 'Romantic pink theme',
      data_theme: 'valentine',
      bg_class: 'bg-base-100',
      text_class: 'text-base-content'
    },
    'autumn' => {
      name: 'Autumn',
      description: 'Warm fall colors',
      data_theme: 'autumn',
      bg_class: 'bg-base-100',
      text_class: 'text-base-content'
    },
    'forest' => {
      name: 'Forest',
      description: 'Nature-inspired green theme',
      data_theme: 'forest',
      bg_class: 'bg-base-100',
      text_class: 'text-base-content'
    },
    'corporate' => {
      name: 'Corporate',
      description: 'Professional business theme',
      data_theme: 'corporate',
      bg_class: 'bg-base-100',
      text_class: 'text-base-content'
    }
  }.freeze
  
  ACCENT_COLORS = {
    'blue' => {
      name: 'Blue',
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#06b6d4'
    },
    'green' => {
      name: 'Green',
      primary: '#10b981',
      secondary: '#6b7280',
      accent: '#84cc16'
    },
    'purple' => {
      name: 'Purple',
      primary: '#8b5cf6',
      secondary: '#6b7280',
      accent: '#d946ef'
    },
    'orange' => {
      name: 'Orange',
      primary: '#f97316',
      secondary: '#6b7280',
      accent: '#eab308'
    },
    'red' => {
      name: 'Red',
      primary: '#ef4444',
      secondary: '#6b7280',
      accent: '#f59e0b'
    },
    'pink' => {
      name: 'Pink',
      primary: '#ec4899',
      secondary: '#6b7280',
      accent: '#a855f7'
    }
  }.freeze
  
  def self.available_themes
    THEMES
  end
  
  def self.available_accent_colors
    ACCENT_COLORS
  end
  
  def self.default_theme
    'light'
  end
  
  def self.default_accent_color
    'blue'
  end
  
  def self.valid_theme?(theme)
    THEMES.key?(theme.to_s)
  end
  
  def self.valid_accent_color?(color)
    ACCENT_COLORS.key?(color.to_s)
  end
  
  def self.get_theme_config(theme)
    THEMES[theme.to_s] || THEMES[default_theme]
  end
  
  def self.get_accent_config(color)
    ACCENT_COLORS[color.to_s] || ACCENT_COLORS[default_accent_color]
  end
  
  def self.generate_custom_css(accent_color)
    return '' unless valid_accent_color?(accent_color)
    
    config = get_accent_config(accent_color)
    
    <<~CSS
      :root {
        --custom-primary: #{config[:primary]};
        --custom-secondary: #{config[:secondary]};
        --custom-accent: #{config[:accent]};
      }
      
      .btn-primary {
        background-color: var(--custom-primary) !important;
        border-color: var(--custom-primary) !important;
      }
      
      .btn-primary:hover {
        background-color: color-mix(in srgb, var(--custom-primary) 90%, black) !important;
        border-color: color-mix(in srgb, var(--custom-primary) 90%, black) !important;
      }
      
      .text-primary {
        color: var(--custom-primary) !important;
      }
      
      .bg-primary {
        background-color: var(--custom-primary) !important;
      }
      
      .border-primary {
        border-color: var(--custom-primary) !important;
      }
      
      .link-primary {
        color: var(--custom-primary) !important;
      }
      
      .badge-primary {
        background-color: var(--custom-primary) !important;
        color: white !important;
      }
      
      .progress-primary {
        background-color: var(--custom-primary) !important;
      }
      
      .btn-secondary {
        background-color: var(--custom-secondary) !important;
        border-color: var(--custom-secondary) !important;
      }
      
      .btn-secondary:hover {
        background-color: color-mix(in srgb, var(--custom-secondary) 90%, black) !important;
        border-color: color-mix(in srgb, var(--custom-secondary) 90%, black) !important;
      }
      
      .text-secondary {
        color: var(--custom-secondary) !important;
      }
      
      .btn-accent {
        background-color: var(--custom-accent) !important;
        border-color: var(--custom-accent) !important;
      }
      
      .btn-accent:hover {
        background-color: color-mix(in srgb, var(--custom-accent) 90%, black) !important;
        border-color: color-mix(in srgb, var(--custom-accent) 90%, black) !important;
      }
      
      .text-accent {
        color: var(--custom-accent) !important;
      }
    CSS
  end
  
  # User preference methods
  def self.get_user_theme(user)
    return default_theme unless user&.theme_preference.present?
    valid_theme?(user.theme_preference) ? user.theme_preference : default_theme
  end
  
  def self.get_user_accent_color(user)
    return default_accent_color unless user&.accent_color_preference.present?
    valid_accent_color?(user.accent_color_preference) ? user.accent_color_preference : default_accent_color
  end
  
  def self.set_user_theme(user, theme)
    return false unless valid_theme?(theme)
    
    user.update(theme_preference: theme)
  end
  
  def self.set_user_accent_color(user, color)
    return false unless valid_accent_color?(color)
    
    user.update(accent_color_preference: color)
  end
  
  # Session-based preferences (for non-logged-in users)
  def self.get_session_theme(session)
    theme = session[:theme_preference]
    valid_theme?(theme) ? theme : default_theme
  end
  
  def self.get_session_accent_color(session)
    color = session[:accent_color_preference]
    valid_accent_color?(color) ? color : default_accent_color
  end
  
  def self.set_session_theme(session, theme)
    return false unless valid_theme?(theme)
    
    session[:theme_preference] = theme
    true
  end
  
  def self.set_session_accent_color(session, color)
    return false unless valid_accent_color?(color)
    
    session[:accent_color_preference] = color
    true
  end
  
  # Current theme detection
  def self.current_theme(user = nil, session = nil)
    if user
      get_user_theme(user)
    elsif session
      get_session_theme(session)
    else
      default_theme
    end
  end
  
  def self.current_accent_color(user = nil, session = nil)
    if user
      get_user_accent_color(user)
    elsif session
      get_session_accent_color(session)
    else
      default_accent_color
    end
  end
end