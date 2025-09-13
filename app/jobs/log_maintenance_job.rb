class LogMaintenanceJob < ApplicationJob
  queue_as :default

  def perform
    Rails.logger.info "Starting log maintenance job..."
    
    begin
      # Rotate large log files
      LoggingService.rotate_logs
      
      # Clean up old archived logs (older than 30 days)
      LoggingService.cleanup_old_logs(30)
      
      # Log the maintenance completion
      LoggingService.app_logger.info({
        event: 'log_maintenance_completed',
        timestamp: Time.current.iso8601,
        details: {
          total_log_files: Dir.glob(Rails.root.join('log', '*.log')).count,
          total_archived_files: Dir.glob(Rails.root.join('log', '*.log.*.gz')).count
        }
      }.to_json)
      
      Rails.logger.info "Log maintenance job completed successfully"
      
    rescue => exception
      # Log the error
      LoggingService.log_error(
        "Log maintenance job failed",
        exception,
        { job_class: self.class.name }
      )
      
      Rails.logger.error "Log maintenance job failed: #{exception.message}"
      
      # Re-raise to mark job as failed
      raise exception
    end
  end
end