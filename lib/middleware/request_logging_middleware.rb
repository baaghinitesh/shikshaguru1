class RequestLoggingMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    start_time = Time.current
    request = ActionDispatch::Request.new(env)
    
    # Log request start
    log_request_start(request)
    
    begin
      status, headers, response = @app.call(env)
      
      # Calculate response time
      duration_ms = ((Time.current - start_time) * 1000).round(2)
      
      # Log successful request
      log_request_completion(request, status, duration_ms)
      
      # Log performance if slow
      if duration_ms > 1000 # Log requests slower than 1 second
        LoggingService.log_performance(
          "slow_request",
          duration_ms,
          {
            method: request.method,
            path: request.path,
            controller_action: extract_controller_action(env),
            status: status,
            user_id: extract_user_id(env)
          }
        )
      end
      
      [status, headers, response]
    rescue => exception
      # Calculate response time for failed requests too
      duration_ms = ((Time.current - start_time) * 1000).round(2)
      
      # Log error
      LoggingService.log_error(
        "Request failed: #{request.method} #{request.path}",
        exception,
        {
          method: request.method,
          path: request.path,
          params: sanitize_params(request.params),
          ip_address: request.remote_ip,
          user_agent: request.user_agent,
          duration_ms: duration_ms,
          user_id: extract_user_id(env)
        }
      )
      
      # Re-raise the exception
      raise exception
    end
  end

  private

  def log_request_start(request)
    # Only log in development for debugging, or for specific paths in production
    return unless Rails.env.development? || should_log_request?(request)
    
    LoggingService.app_logger.info({
      event: 'request_start',
      method: request.method,
      path: request.path,
      ip_address: request.remote_ip,
      user_agent: request.user_agent,
      timestamp: Time.current.iso8601
    }.to_json)
  end

  def log_request_completion(request, status, duration_ms)
    # Log all completed requests
    LoggingService.app_logger.info({
      event: 'request_completed',
      method: request.method,
      path: request.path,
      status: status,
      duration_ms: duration_ms,
      ip_address: request.remote_ip,
      timestamp: Time.current.iso8601
    }.to_json)
    
    # Log security events for failed auth attempts
    if status == 401 || status == 403
      LoggingService.log_security_event(
        'unauthorized_access_attempt',
        extract_user_id(request.env),
        request.remote_ip,
        {
          method: request.method,
          path: request.path,
          status: status,
          user_agent: request.user_agent
        }
      )
    end
  end

  def should_log_request?(request)
    # Log API requests, admin requests, and authentication requests
    request.path.start_with?('/api/') ||
    request.path.start_with?('/admin/') ||
    request.path.include?('sign_in') ||
    request.path.include?('sign_up') ||
    request.path.include?('sign_out')
  end

  def extract_controller_action(env)
    controller = env['action_controller.instance']
    return nil unless controller
    
    "#{controller.class.name}##{controller.action_name}"
  end

  def extract_user_id(env)
    # Try to extract user ID from session or current_user
    session = env['rack.session']
    return nil unless session
    
    session[:user_id] || session[:current_user_id]
  end

  def sanitize_params(params)
    # Remove sensitive parameters from logging
    sensitive_keys = %w[password password_confirmation token secret key]
    
    params.except(*sensitive_keys).transform_values do |value|
      if value.is_a?(String) && value.length > 100
        "#{value.first(100)}...[truncated]"
      else
        value
      end
    end
  end
end