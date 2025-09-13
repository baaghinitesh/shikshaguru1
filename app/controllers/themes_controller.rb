class ThemesController < ApplicationController
  before_action :set_theme_data
  
  def show
    # Show current theme settings
    render json: {
      current_theme: @current_theme,
      current_accent_color: @current_accent_color,
      available_themes: ThemeService.available_themes,
      available_accent_colors: ThemeService.available_accent_colors
    }
  end
  
  def update
    # Handle preview-only requests
    if params[:preview_only] == true || params[:preview_only] == 'true'
      theme = params[:theme] || @current_theme
      accent_color = params[:accent_color] || @current_accent_color
      
      render json: {
        success: true,
        custom_css: ThemeService.generate_custom_css(accent_color),
        theme: theme,
        accent_color: accent_color
      }
      return
    end
    
    success = true
    
    # Update theme if provided
    if params[:theme].present?
      if user_signed_in?
        success = ThemeService.set_user_theme(Current.user, params[:theme])
      else
        success = ThemeService.set_session_theme(session, params[:theme])
      end
    end
    
    # Update accent color if provided
    if params[:accent_color].present?
      if user_signed_in?
        accent_success = ThemeService.set_user_accent_color(Current.user, params[:accent_color])
      else
        accent_success = ThemeService.set_session_accent_color(session, params[:accent_color])
      end
      success = success && accent_success
    end
    
    if success
      # Log theme change
      LoggingService.log_security_event(
        'theme_change',
        user_signed_in? ? Current.user.id : nil,
        request.remote_ip,
        {
          theme: params[:theme],
          accent_color: params[:accent_color],
          user_signed_in: user_signed_in?
        }
      )
      
      respond_to do |format|
        format.json {
          render json: {
            success: true,
            message: 'Theme updated successfully',
            theme: ThemeService.current_theme(Current.user, session),
            accent_color: ThemeService.current_accent_color(Current.user, session),
            custom_css: ThemeService.generate_custom_css(ThemeService.current_accent_color(Current.user, session))
          }
        }
        format.html {
          flash[:success] = 'Theme updated successfully'
          redirect_back(fallback_location: root_path)
        }
      end
    else
      respond_to do |format|
        format.json {
          render json: {
            success: false,
            message: 'Invalid theme or accent color'
          }, status: :unprocessable_entity
        }
        format.html {
          flash[:error] = 'Invalid theme or accent color'
          redirect_back(fallback_location: root_path)
        }
      end
    end
  end
  
  def reset
    if user_signed_in?
      Current.user.update(
        theme_preference: nil,
        accent_color_preference: nil
      )
    else
      session[:theme_preference] = nil
      session[:accent_color_preference] = nil
    end
    
    # Log theme reset
    LoggingService.log_security_event(
      'theme_reset',
      user_signed_in? ? Current.user.id : nil,
      request.remote_ip,
      {
        user_signed_in: user_signed_in?
      }
    )
    
    respond_to do |format|
      format.json {
        render json: {
          success: true,
          message: 'Theme reset to default',
          theme: ThemeService.default_theme,
          accent_color: ThemeService.default_accent_color,
          custom_css: ThemeService.generate_custom_css(ThemeService.default_accent_color)
        }
      }
      format.html {
        flash[:success] = 'Theme reset to default'
        redirect_back(fallback_location: root_path)
      }
    end
  end
  
  private
  
  def set_theme_data
    @current_theme = ThemeService.current_theme(Current.user, session)
    @current_accent_color = ThemeService.current_accent_color(Current.user, session)
  end
end