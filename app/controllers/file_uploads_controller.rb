class FileUploadsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_attachment, only: [:destroy]
  
  def create
    @upload_service = FileUploadService.new(
      file: params[:file],
      file_type: params[:file_type],
      user: current_user,
      attachment_name: params[:attachment_name]
    )
    
    if @upload_service.call
      render json: {
        status: 'success',
        message: 'File uploaded successfully',
        file_info: {
          filename: params[:file].original_filename,
          size: params[:file].size,
          content_type: params[:file].content_type
        },
        attachment_name: params[:attachment_name]
      }
    else
      render json: {
        status: 'error',
        errors: @upload_service.errors.full_messages
      }, status: :unprocessable_entity
    end
  rescue => e
    LoggingService.log_error(
      "File upload controller error",
      e,
      {
        user_id: current_user&.id,
        params: params.except(:file).to_unsafe_h
      }
    )
    
    render json: {
      status: 'error',
      message: 'Upload failed. Please try again.'
    }, status: :internal_server_error
  end

  def destroy
    attachment_name = params[:attachment_name]
    attachment_id = params[:attachment_id]
    
    case attachment_name
    when 'profile_picture'
      if current_user.profile_picture.attached? && current_user.profile_picture.id.to_s == attachment_id
        current_user.profile_picture.purge
        message = 'Profile picture deleted successfully'
      else
        return render json: { status: 'error', message: 'File not found' }, status: :not_found
      end
    when 'documents', 'certificates'
      attachment = current_user.send(attachment_name).find_by(id: attachment_id)
      if attachment
        attachment.purge
        message = 'Document deleted successfully'
      else
        return render json: { status: 'error', message: 'Document not found' }, status: :not_found
      end
    else
      return render json: { status: 'error', message: 'Invalid attachment type' }, status: :bad_request
    end
    
    # Log the deletion
    LoggingService.app_logger.info({
      event: 'file_deleted',
      user_id: current_user.id,
      attachment_name: attachment_name,
      attachment_id: attachment_id,
      timestamp: Time.current.iso8601
    }.to_json)
    
    render json: {
      status: 'success',
      message: message
    }
  rescue => e
    LoggingService.log_error(
      "File deletion error",
      e,
      {
        user_id: current_user&.id,
        attachment_name: attachment_name,
        attachment_id: attachment_id
      }
    )
    
    render json: {
      status: 'error',
      message: 'Deletion failed. Please try again.'
    }, status: :internal_server_error
  end
  
  private
  
  def authenticate_user!
    render json: { status: 'error', message: 'Please sign in' }, status: :unauthorized unless user_signed_in?
  end
  
  def set_attachment
    # This is handled in the destroy method itself due to the dynamic nature of attachments
  end
end
