class LoggingService
  class << self
    # Application-level loggers
    def app_logger
      @app_logger ||= create_logger('application.log', Logger::INFO)
    end

    def error_logger
      @error_logger ||= create_logger('errors.log', Logger::ERROR)
    end

    def security_logger
      @security_logger ||= create_logger('security.log', Logger::WARN)
    end

    def performance_logger
      @performance_logger ||= create_logger('performance.log', Logger::INFO)
    end

    def chat_logger
      @chat_logger ||= create_logger('chat.log', Logger::INFO)
    end

    def job_logger
      @job_logger ||= create_logger('jobs.log', Logger::INFO)
    end

    def auth_logger
      @auth_logger ||= create_logger('auth.log', Logger::INFO)
    end

    # Convenience methods for different log types
    def log_error(message, exception = nil, context = {})
      log_data = {
        message: message,
        timestamp: Time.current.iso8601,
        context: context
      }
      
      if exception
        log_data[:exception] = {
          class: exception.class.name,
          message: exception.message,
          backtrace: exception.backtrace&.first(10)
        }
      end
      
      error_logger.error(log_data.to_json)
      
      # Also log to Rails logger for development
      Rails.logger.error("#{message}: #{exception&.message}")
    end

    def log_security_event(event_type, user_id = nil, ip_address = nil, details = {})
      log_data = {
        event_type: event_type,
        user_id: user_id,
        ip_address: ip_address,
        timestamp: Time.current.iso8601,
        details: details
      }
      
      security_logger.warn(log_data.to_json)
    end

    def log_performance(action, duration_ms, context = {})
      log_data = {
        action: action,
        duration_ms: duration_ms,
        timestamp: Time.current.iso8601,
        context: context
      }
      
      performance_logger.info(log_data.to_json)
    end

    def log_chat_event(event_type, chat_room_id, user_id, details = {})
      log_data = {
        event_type: event_type,
        chat_room_id: chat_room_id,
        user_id: user_id,
        timestamp: Time.current.iso8601,
        details: details
      }
      
      chat_logger.info(log_data.to_json)
    end

    def log_job_event(event_type, job_request_id, user_id, details = {})
      log_data = {
        event_type: event_type,
        job_request_id: job_request_id,
        user_id: user_id,
        timestamp: Time.current.iso8601,
        details: details
      }
      
      job_logger.info(log_data.to_json)
    end

    def log_auth_event(event_type, user_id = nil, email = nil, ip_address = nil, details = {})
      log_data = {
        event_type: event_type,
        user_id: user_id,
        email: email,
        ip_address: ip_address,
        timestamp: Time.current.iso8601,
        details: details
      }
      
      auth_logger.info(log_data.to_json)
    end

    # Log rotation and cleanup methods
    def rotate_logs
      log_files = Dir.glob(Rails.root.join('log', '*.log'))
      
      log_files.each do |file|
        next if File.size(file) < 100.megabytes # Only rotate files larger than 100MB
        
        timestamp = Time.current.strftime('%Y%m%d_%H%M%S')
        archive_name = "#{file}.#{timestamp}"
        
        File.rename(file, archive_name)
        
        # Compress the archived file
        system("gzip #{archive_name}")
        
        app_logger.info("Rotated log file: #{file} -> #{archive_name}.gz")
      end
    end

    def cleanup_old_logs(days_to_keep = 30)
      cutoff_time = days_to_keep.days.ago
      
      archived_logs = Dir.glob(Rails.root.join('log', '*.log.*.gz'))
      
      archived_logs.each do |file|
        if File.mtime(file) < cutoff_time
          File.delete(file)
          app_logger.info("Deleted old log archive: #{file}")
        end
      end
    end

    # Log analysis methods
    def get_error_summary(hours = 24)
      log_file = Rails.root.join('log', 'errors.log')
      return {} unless File.exist?(log_file)
      
      errors = {}
      cutoff_time = hours.hours.ago
      
      File.foreach(log_file) do |line|
        begin
          data = JSON.parse(line)
          timestamp = Time.parse(data['timestamp'])
          
          next if timestamp < cutoff_time
          
          error_class = data.dig('exception', 'class') || 'Unknown'
          errors[error_class] ||= 0
          errors[error_class] += 1
        rescue JSON::ParserError, ArgumentError
          # Skip malformed lines
        end
      end
      
      errors
    end

    def get_security_events(hours = 24)
      log_file = Rails.root.join('log', 'security.log')
      return [] unless File.exist?(log_file)
      
      events = []
      cutoff_time = hours.hours.ago
      
      File.foreach(log_file) do |line|
        begin
          data = JSON.parse(line)
          timestamp = Time.parse(data['timestamp'])
          
          next if timestamp < cutoff_time
          
          events << data
        rescue JSON::ParserError, ArgumentError
          # Skip malformed lines
        end
      end
      
      events.sort_by { |event| event['timestamp'] }.reverse
    end

    private

    def create_logger(filename, level)
      log_file = Rails.root.join('log', filename)
      
      # Ensure log directory exists
      FileUtils.mkdir_p(File.dirname(log_file))
      
      logger = Logger.new(log_file)
      logger.level = level
      logger.formatter = proc do |severity, datetime, progname, msg|
        "#{datetime.strftime('%Y-%m-%d %H:%M:%S')} [#{severity}] #{msg}\n"
      end
      
      logger
    end
  end
end