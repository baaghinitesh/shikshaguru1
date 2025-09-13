class ChatRoomsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_chat_room, only: [:show]
  before_action :verify_participant, only: [:show]

  def index
    # Get all chat rooms where the current user is a participant
    @chat_rooms = current_user.chat_rooms
                             .includes(:job_request, :participants, :messages)
                             .order('messages.created_at DESC NULLS LAST')
                             .distinct
  end

  def show
    # Load messages for the chat room with pagination
    @messages = @chat_room.messages
                          .includes(:user)
                          .order(:created_at)
                          .limit(50) # Load last 50 messages
    
    # Mark messages as read for current user
    participant = @chat_room.participants.find_by(user: current_user)
    participant&.update(last_read_at: Time.current)
    
    # Get other participants for display
    @other_participants = @chat_room.participants
                                   .includes(:user)
                                   .where.not(user: current_user)
  end
  
  def create
    # Create chat room for a job request
    job_request = JobRequest.find(params[:job_request_id])
    job_application = job_request.job_applications.find(params[:job_application_id])
    
    # Verify user can create chat (either student who posted job or teacher who applied)
    unless current_user == job_request.user || current_user == job_application.user
      redirect_to root_path, alert: 'Unauthorized access'
      return
    end
    
    # Find or create chat room
    @chat_room = job_request.chat_room
    
    if @chat_room.nil?
      @chat_room = ChatRoom.create!(
        name: "Chat for: #{job_request.title}",
        job_request: job_request,
        is_active: true
      )
      
      # Add both users as participants
      @chat_room.participants.create!(user: job_request.user, joined_at: Time.current)
      @chat_room.participants.create!(user: job_application.user, joined_at: Time.current)
    end
    
    redirect_to chat_room_path(@chat_room)
  end

  private

  def set_chat_room
    @chat_room = ChatRoom.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to chat_rooms_path, alert: 'Chat room not found'
  end

  def verify_participant
    unless @chat_room.participants.exists?(user: current_user)
      redirect_to chat_rooms_path, alert: 'You are not authorized to access this chat'
    end
  end
  
  def authenticate_user!
    redirect_to root_path, notice: 'Please sign in to access chat' unless user_signed_in?
  end
end
