class ChatRoomChannel < ApplicationCable::Channel
  def subscribed
    # Authenticate user and check permissions
    reject unless current_user
    
    # Get the chat room ID from params
    chat_room = ChatRoom.find(params[:room_id])
    
    # Check if user is a participant in this chat room
    participant = chat_room.participants.find_by(user: current_user)
    reject unless participant
    
    # Stream from the specific chat room
    stream_from "chat_room_#{chat_room.id}"
    
    # Update last seen
    participant.update(last_read_at: Time.current)
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
    # Update user's last seen time if needed
    if params[:room_id].present? && current_user
      chat_room = ChatRoom.find_by(id: params[:room_id])
      if chat_room
        participant = chat_room.participants.find_by(user: current_user)
        participant&.update(last_read_at: Time.current)
      end
    end
  end
  
  def speak(data)
    # Create new message
    chat_room = ChatRoom.find(params[:room_id])
    participant = chat_room.participants.find_by(user: current_user)
    
    return unless participant
    
    message = chat_room.messages.build(
      user: current_user,
      content: data['message'],
      message_type: data['message_type'] || 'text'
    )
    
    if message.save
      # Broadcast will be handled by the Message model after_create callback
      # Update participant's last activity
      participant.update(last_read_at: Time.current)
    end
  end
  
  def mark_as_read(data)
    # Mark messages as read
    chat_room = ChatRoom.find(params[:room_id])
    participant = chat_room.participants.find_by(user: current_user)
    
    if participant
      participant.update(last_read_at: Time.current)
      
      # Broadcast read status to other participants
      ActionCable.server.broadcast(
        "chat_room_#{chat_room.id}",
        {
          type: 'message_read',
          user_id: current_user.id,
          timestamp: Time.current.iso8601
        }
      )
    end
  end
  
  private
  
  def current_user
    # This should be set in ApplicationCable::Connection
    connection.current_user
  end
end
