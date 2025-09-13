class MessagesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_chat_room
  before_action :verify_participant

  def create
    @message = @chat_room.messages.build(message_params)
    @message.user = current_user
    
    if @message.save
      # Update participant's last activity
      participant = @chat_room.participants.find_by(user: current_user)
      participant&.update(last_read_at: Time.current)
      
      render json: {
        status: 'success',
        message: {
          id: @message.id,
          content: @message.content,
          user_name: @message.user.name,
          user_id: @message.user.id,
          created_at: @message.created_at.strftime('%I:%M %p'),
          message_type: @message.message_type
        }
      }
    else
      render json: {
        status: 'error',
        errors: @message.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  private

  def set_chat_room
    @chat_room = ChatRoom.find(params[:chat_room_id])
  rescue ActiveRecord::RecordNotFound
    render json: { status: 'error', message: 'Chat room not found' }, status: :not_found
  end

  def verify_participant
    unless @chat_room.participants.exists?(user: current_user)
      render json: { status: 'error', message: 'Unauthorized access' }, status: :forbidden
    end
  end
  
  def authenticate_user!
    render json: { status: 'error', message: 'Please sign in' }, status: :unauthorized unless user_signed_in?
  end

  def message_params
    params.require(:message).permit(:content, :message_type)
  end
end
