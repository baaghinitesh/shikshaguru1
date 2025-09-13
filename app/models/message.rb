class Message < ApplicationRecord
  MESSAGE_TYPES = %w[text image file system].freeze

  belongs_to :chat_room
  belongs_to :user

  validates :content, presence: true, length: { minimum: 1, maximum: 2000 }
  validates :message_type, presence: true, inclusion: { in: MESSAGE_TYPES }
  validate :user_can_send_message

  scope :recent, -> { order(created_at: :desc) }
  scope :unread_for, ->(user) { 
    joins(chat_room: :chat_room_participants)
      .where(chat_room_participants: { user: user })
      .where('messages.created_at > COALESCE(chat_room_participants.last_read_at, ?)', 1.year.ago)
  }

  after_create_commit :broadcast_message
  after_create :update_participant_activity
  after_create :log_message_created

  def read_by?(user)
    participant = chat_room.chat_room_participants.find_by(user: user)
    return false unless participant&.last_read_at

    created_at <= participant.last_read_at
  end

  def system_message?
    message_type == 'system'
  end

  def formatted_time
    if created_at.today?
      created_at.strftime("%I:%M %p")
    elsif created_at.year == Date.current.year
      created_at.strftime("%b %d, %I:%M %p")
    else
      created_at.strftime("%b %d %Y, %I:%M %p")
    end
  end

  def self.create_system_message(chat_room, content)
    create!(
      chat_room: chat_room,
      user: chat_room.job_request.user, # Use job poster as system message sender
      content: content,
      message_type: 'system'
    )
  end

  private

  def user_can_send_message
    unless chat_room&.can_participate?(user)
      errors.add(:user, "is not authorized to send messages in this chat room")
    end
  end

  def broadcast_message
    ActionCable.server.broadcast(
      "chat_room_#{chat_room.id}",
      {
        id: id,
        content: content,
        message_type: message_type,
        user_name: user.display_name,
        user_id: user.id,
        formatted_time: formatted_time,
        html: ApplicationController.render(
          partial: 'messages/message',
          locals: { message: self, current_user: nil }
        )
      }
    )
  end

  def update_participant_activity
    participant = chat_room.chat_room_participants.find_by(user: user)
    participant&.touch(:last_read_at)
  end
  
  def log_message_created
    LoggingService.log_chat_event(
      'message_sent',
      chat_room.id,
      user.id,
      {
        message_type: message_type,
        content_length: content.length,
        chat_room_name: chat_room.name,
        job_request_id: chat_room.job_request_id
      }
    )
  end
end