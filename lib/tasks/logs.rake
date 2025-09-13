namespace :logs do
  desc "Rotate log files when they get too large"
  task rotate: :environment do
    puts "Starting log rotation..."
    LoggingService.rotate_logs
    puts "Log rotation completed."
  end

  desc "Clean up old archived log files (default: older than 30 days)"
  task :cleanup, [:days] => :environment do |task, args|
    days_to_keep = (args[:days] || 30).to_i
    puts "Cleaning up log files older than #{days_to_keep} days..."
    LoggingService.cleanup_old_logs(days_to_keep)
    puts "Log cleanup completed."
  end

  desc "Full log maintenance (rotate + cleanup)"
  task maintain: [:rotate, :cleanup] do
    puts "Log maintenance completed."
  end

  desc "Show error summary for the last 24 hours"
  task :error_summary, [:hours] => :environment do |task, args|
    hours = (args[:hours] || 24).to_i
    puts "Error summary for the last #{hours} hours:"
    puts "=" * 50
    
    errors = LoggingService.get_error_summary(hours)
    
    if errors.empty?
      puts "No errors found in the specified time period."
    else
      errors.sort_by { |_error, count| -count }.each do |error, count|
        puts "#{error}: #{count} occurrences"
      end
    end
    
    puts "=" * 50
  end

  desc "Show recent security events"
  task :security_events, [:hours] => :environment do |task, args|
    hours = (args[:hours] || 24).to_i
    puts "Security events for the last #{hours} hours:"
    puts "=" * 60
    
    events = LoggingService.get_security_events(hours)
    
    if events.empty?
      puts "No security events found in the specified time period."
    else
      events.each do |event|
        timestamp = Time.parse(event['timestamp']).strftime('%Y-%m-%d %H:%M:%S')
        puts "[#{timestamp}] #{event['event_type']}"
        puts "  User ID: #{event['user_id'] || 'N/A'}"
        puts "  IP: #{event['ip_address'] || 'N/A'}"
        
        if event['details'].present?
          event['details'].each do |key, value|
            puts "  #{key.humanize}: #{value}"
          end
        end
        
        puts "-" * 40
      end
    end
    
    puts "=" * 60
  end

  desc "Show log file sizes and locations"
  task :status => :environment do
    puts "Log file status:"
    puts "=" * 50
    
    log_dir = Rails.root.join('log')
    log_files = Dir.glob(log_dir.join('*.log'))
    
    if log_files.empty?
      puts "No log files found."
    else
      log_files.sort.each do |file|
        size = File.size(file)
        size_human = size > 1.megabyte ? "#{(size / 1.megabyte.to_f).round(2)} MB" : "#{(size / 1.kilobyte.to_f).round(2)} KB"
        modified = File.mtime(file).strftime('%Y-%m-%d %H:%M:%S')
        
        puts "#{File.basename(file)}: #{size_human} (modified: #{modified})"
      end
    end
    
    # Show archived logs
    archived_files = Dir.glob(log_dir.join('*.log.*.gz'))
    if archived_files.any?
      puts "\nArchived log files:"
      puts "-" * 30
      
      archived_files.sort.each do |file|
        size = File.size(file)
        size_human = size > 1.megabyte ? "#{(size / 1.megabyte.to_f).round(2)} MB" : "#{(size / 1.kilobyte.to_f).round(2)} KB"
        modified = File.mtime(file).strftime('%Y-%m-%d %H:%M:%S')
        
        puts "#{File.basename(file)}: #{size_human} (archived: #{modified})"
      end
    end
    
    puts "=" * 50
  end

  desc "Tail a specific log file"
  task :tail, [:log_name, :lines] => :environment do |task, args|
    log_name = args[:log_name] || 'application'
    lines = (args[:lines] || 50).to_i
    
    log_file = Rails.root.join('log', "#{log_name}.log")
    
    unless File.exist?(log_file)
      puts "Log file not found: #{log_file}"
      puts "Available log files:"
      Dir.glob(Rails.root.join('log', '*.log')).each do |file|
        puts "  #{File.basename(file, '.log')}"
      end
      exit 1
    end
    
    puts "Showing last #{lines} lines of #{log_name}.log:"
    puts "=" * 60
    
    system("tail -n #{lines} #{log_file}")
  end

  desc "Search logs for a specific pattern"
  task :search, [:pattern, :log_name] => :environment do |task, args|
    pattern = args[:pattern]
    log_name = args[:log_name] || 'application'
    
    if pattern.blank?
      puts "Please provide a search pattern."
      puts "Usage: rails logs:search['error message','application']"
      exit 1
    end
    
    log_file = Rails.root.join('log', "#{log_name}.log")
    
    unless File.exist?(log_file)
      puts "Log file not found: #{log_file}"
      exit 1
    end
    
    puts "Searching for '#{pattern}' in #{log_name}.log:"
    puts "=" * 60
    
    system("grep -n -i '#{pattern}' #{log_file}")
  end

  desc "Monitor logs in real-time (like tail -f)"
  task :monitor, [:log_name] => :environment do |task, args|
    log_name = args[:log_name] || 'application'
    log_file = Rails.root.join('log', "#{log_name}.log")
    
    unless File.exist?(log_file)
      puts "Log file not found: #{log_file}"
      exit 1
    end
    
    puts "Monitoring #{log_name}.log in real-time (Press Ctrl+C to stop):"
    puts "=" * 60
    
    system("tail -f #{log_file}")
  end

  desc "Create log analysis report"
  task :report, [:hours] => :environment do |task, args|
    hours = (args[:hours] || 24).to_i
    timestamp = Time.current.strftime('%Y%m%d_%H%M%S')
    report_file = Rails.root.join('tmp', "log_report_#{timestamp}.txt")
    
    puts "Generating log analysis report for the last #{hours} hours..."
    
    File.open(report_file, 'w') do |file|
      file.puts "ShikshaGuru Log Analysis Report"
      file.puts "Generated: #{Time.current.strftime('%Y-%m-%d %H:%M:%S')}"
      file.puts "Time Period: Last #{hours} hours"
      file.puts "=" * 60
      file.puts
      
      # Error summary
      file.puts "ERROR SUMMARY:"
      file.puts "-" * 30
      errors = LoggingService.get_error_summary(hours)
      if errors.empty?
        file.puts "No errors found."
      else
        errors.sort_by { |_error, count| -count }.each do |error, count|
          file.puts "#{error}: #{count} occurrences"
        end
      end
      file.puts
      
      # Security events
      file.puts "SECURITY EVENTS:"
      file.puts "-" * 30
      events = LoggingService.get_security_events(hours)
      if events.empty?
        file.puts "No security events found."
      else
        events.each do |event|
          timestamp = Time.parse(event['timestamp']).strftime('%Y-%m-%d %H:%M:%S')
          file.puts "[#{timestamp}] #{event['event_type']} - User: #{event['user_id'] || 'N/A'} - IP: #{event['ip_address'] || 'N/A'}"
        end
      end
      file.puts
      
      # Log file status
      file.puts "LOG FILE STATUS:"
      file.puts "-" * 30
      Dir.glob(Rails.root.join('log', '*.log')).sort.each do |log_file|
        name = File.basename(log_file)
        size = File.size(log_file)
        size_human = size > 1.megabyte ? "#{(size / 1.megabyte.to_f).round(2)} MB" : "#{(size / 1.kilobyte.to_f).round(2)} KB"
        file.puts "#{name}: #{size_human}"
      end
    end
    
    puts "Report generated: #{report_file}"
  end
end