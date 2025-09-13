class ChatRoomParticipant < ApplicationRecord
  belongs_to :chat_room
  belongs_to :user

  validates :joined_at, presence: true
  validates :user_id, uniqueness: { scope: :chat_room_id }

  before_validation :set_joined_at, on: :create

  scope :active, -> { joins(:chat_room).where(chat_rooms: { is_active: true }) }
  scope :recent_activity, -> { order(last_read_at: :desc) }

  def online?
    # This could be extended with presence tracking
    last_read_at.present? && last_read_at > 5.minutes.ago
  end

  def unread_messages_count
    chat_room.unread_count_for(user)
  end

  def mark_as_read!
    update(last_read_at: Time.current)
  end

  def status_display
    if online?
      "Online"
    elsif last_read_at.present?
      if last_read_at.today?
        "Last seen #{last_read_at.strftime('%I:%M %p')}"
      elsif last_read_at > 1.week.ago
        "Last seen #{last_read_at.strftime('%A')}"
      else
        "Last seen #{last_read_at.strftime('%b %d')}"
      end
    else
      "Not seen yet"
    end
  end

  private

  def set_joined_at
    self.joined_at ||= Time.current
  end
end