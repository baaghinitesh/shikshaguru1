module ApplicationHelper
  # Generate `{controller}-{action}-page` class for body element
  def body_class
    path = controller_path.tr('/_', '-')
    action_name_map = {
      index: 'index',
      new: 'edit',
      edit: 'edit',
      update: 'edit',
      patch: 'edit',
      create: 'edit',
      destory: 'index'
    }
    mapped_action_name = action_name_map[action_name.to_sym] || action_name
    body_class_page = format('%s-%s-page', path, mapped_action_name)
    body_class_page
  end

  # Admin active for helper
  def admin_active_for(controller_name, navbar_name)
    if controller_name.to_s == admin_root_path
      return controller_name.to_s == navbar_name.to_s ? "active" : ""
    end
    navbar_name.to_s.include?(controller_name.to_s) ? 'active' : ''
  end

  def current_path
    request.env['PATH_INFO']
  end


  # DaisyUI flash message class helper with lighter colors
  def flash_daisy_class(level)
    case level.to_sym
    when :notice, :success
      'bg-green-100 text-green-800 border border-green-200'
    when :info
      'bg-blue-100 text-blue-800 border border-blue-200'
    when :warning
      'bg-yellow-100 text-yellow-800 border border-yellow-200'
    when :alert, :error
      'bg-red-100 text-red-800 border border-red-200'
    else
      'bg-blue-100 text-blue-800 border border-blue-200'
    end
  end

  # Dynamic validation helpers for admin forms
  def field_required?(model, field_name)
    model.class.validators_on(field_name.to_sym).any? { |v| v.is_a?(ActiveModel::Validations::PresenceValidator) }
  end
  
  # Theme helpers
  def current_theme
    ThemeService.current_theme(Current.user, session)
  end
  
  def current_accent_color
    ThemeService.current_accent_color(Current.user, session)
  end
  
  def theme_data_attribute
    current_theme
  end
  
  def custom_theme_css
    ThemeService.generate_custom_css(current_accent_color)
  end
  
  def available_themes
    ThemeService.available_themes
  end
  
  def available_accent_colors
    ThemeService.available_accent_colors
  end
  
  def theme_icon(theme_key)
    icons = {
      'light' => '☀️',
      'dark' => '🌙',
      'cupcake' => '🧁',
      'synthwave' => '🌃',
      'valentine' => '💖',
      'autumn' => '🍂',
      'forest' => '🌲',
      'corporate' => '💼'
    }
    icons[theme_key] || '🎨'
  end
  
  def accent_color_sample(color_key)
    config = ThemeService.get_accent_config(color_key)
    content_tag :div, '', 
                class: 'w-4 h-4 rounded-full inline-block',
                style: "background-color: #{config[:primary]}"
  end
end
