# Load custom middleware
require Rails.root.join('lib', 'middleware', 'request_logging_middleware')

# Add middleware to the stack in application config
Rails.application.configure do
  config.middleware.use RequestLoggingMiddleware
end