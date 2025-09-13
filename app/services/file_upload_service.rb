require 'mini_magick'

class FileUploadService
  include ActiveModel::Model
  
  MAX_FILE_SIZE = 2.megabytes
  
  ALLOWED_IMAGE_TYPES = %w[image/jpeg image/png image/gif image/webp].freeze
  ALLOWED_DOCUMENT_TYPES = %w[
    application/pdf
    application/msword
    application/vnd.openxmlformats-officedocument.wordprocessingml.document
    application/vnd.ms-excel
    application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
    text/plain
  ].freeze
  
  attr_accessor :file, :file_type, :user, :attachment_name
  
  validates :file, presence: true
  validates :file_type, inclusion: { in: %w[image document] }
  validates :user, presence: true
  validates :attachment_name, presence: true
  
  def initialize(attributes = {})
    super
    @errors = ActiveModel::Errors.new(self)
  end
  
  def call
    return false unless valid?
    return false unless validate_file_size
    return false unless validate_file_type
    
    case file_type
    when 'image'
      process_image_upload
    when 'document'
      process_document_upload
    else
      errors.add(:file_type, 'Invalid file type')
      false
    end
  rescue => e
    LoggingService.log_error("File upload failed", e, {
      user_id: user&.id,
      file_type: file_type,
      attachment_name: attachment_name,
      file_size: file&.size
    })
    errors.add(:base, 'File upload failed. Please try again.')
    false
  end
  
  private
  
  def process_image_upload
    # Compress and resize image
    compressed_file = compress_image(file)
    
    # Create thumbnail for profile pictures
    thumbnail = nil
    if attachment_name == 'profile_picture'
      thumbnail = create_thumbnail(compressed_file)
    end
    
    # Attach the files
    case attachment_name
    when 'profile_picture'
      user.profile_picture.attach(
        io: File.open(compressed_file.path),
        filename: generate_filename(file.original_filename, 'compressed'),
        content_type: file.content_type
      )
      
      # Store thumbnail as variant metadata
      if thumbnail
        user.profile_picture.blob.update(
          metadata: user.profile_picture.blob.metadata.merge(
            thumbnail_processed: true
          )
        )
      end
    else
      user.send(attachment_name).attach(
        io: File.open(compressed_file.path),
        filename: generate_filename(file.original_filename, 'compressed'),
        content_type: file.content_type
      )
    end
    
    # Clean up temporary files
    compressed_file.unlink if compressed_file
    thumbnail&.unlink
    
    log_upload_success('image')
    true
  end
  
  def process_document_upload
    # For documents, we don't compress but we do validate and scan
    validate_document_content
    
    user.send(attachment_name).attach(
      io: file.tempfile,
      filename: file.original_filename,
      content_type: file.content_type
    )
    
    log_upload_success('document')
    true
  end
  
  def compress_image(uploaded_file)
    temp_file = Tempfile.new(['compressed', File.extname(uploaded_file.original_filename)])
    temp_file.binmode
    
    # Use MiniMagick to compress and resize
    image = MiniMagick::Image.read(uploaded_file.tempfile.read)
    
    # Resize if too large (max 1200x1200 for regular images, 400x400 for profile pics)
    max_dimension = attachment_name == 'profile_picture' ? 400 : 1200
    
    if image.width > max_dimension || image.height > max_dimension
      image.resize "#{max_dimension}x#{max_dimension}>"
    end
    
    # Compress based on file type
    case file.content_type
    when 'image/jpeg', 'image/jpg'
      image.format 'jpg'
      image.quality '85'
    when 'image/png'
      image.format 'png'
      # PNG compression is lossless, so we optimize instead
      image.define 'png:compression-level=9'
    when 'image/webp'
      image.format 'webp'
      image.quality '85'
    else
      # Convert other formats to JPEG
      image.format 'jpg'
      image.quality '85'
    end
    
    # Write to temp file
    temp_file.write(image.to_blob)
    temp_file.rewind
    temp_file
  end
  
  def create_thumbnail(image_file)
    return nil unless attachment_name == 'profile_picture'
    
    temp_file = Tempfile.new(['thumbnail', '.jpg'])
    temp_file.binmode
    
    # Create 150x150 thumbnail for profile pictures
    image = MiniMagick::Image.read(image_file.read)
    image_file.rewind
    
    image.resize '150x150^'
    image.gravity 'center'
    image.crop '150x150+0+0'
    image.format 'jpg'
    image.quality '80'
    
    temp_file.write(image.to_blob)
    temp_file.rewind
    temp_file
  end
  
  def validate_file_size
    if file.size > MAX_FILE_SIZE
      errors.add(:file, "File size must be less than #{MAX_FILE_SIZE / 1.megabyte}MB")
      return false
    end
    true
  end
  
  def validate_file_type
    allowed_types = case file_type
                   when 'image'
                     ALLOWED_IMAGE_TYPES
                   when 'document'
                     ALLOWED_DOCUMENT_TYPES
                   else
                     []
                   end
    
    unless allowed_types.include?(file.content_type)
      errors.add(:file, "File type #{file.content_type} is not allowed")
      return false
    end
    
    true
  end
  
  def validate_document_content
    # Basic content validation for documents
    # This is where you could add virus scanning, content analysis, etc.
    
    # Check file extension matches MIME type
    extension = File.extname(file.original_filename).downcase
    valid_extensions = {
      'application/pdf' => ['.pdf'],
      'application/msword' => ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => ['.docx'],
      'application/vnd.ms-excel' => ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => ['.xlsx'],
      'text/plain' => ['.txt']
    }
    
    expected_extensions = valid_extensions[file.content_type] || []
    
    unless expected_extensions.include?(extension)
      errors.add(:file, 'File extension does not match file type')
      return false
    end
    
    true
  end
  
  def generate_filename(original_filename, suffix = nil)
    name = File.basename(original_filename, File.extname(original_filename))
    extension = File.extname(original_filename)
    timestamp = Time.current.strftime('%Y%m%d_%H%M%S')
    
    if suffix
      "#{name}_#{suffix}_#{timestamp}#{extension}"
    else
      "#{name}_#{timestamp}#{extension}"
    end
  end
  
  def log_upload_success(type)
    LoggingService.app_logger.info({
      event: 'file_uploaded',
      user_id: user.id,
      file_type: type,
      attachment_name: attachment_name,
      file_size: file.size,
      filename: file.original_filename,
      timestamp: Time.current.iso8601
    }.to_json)
  end
end