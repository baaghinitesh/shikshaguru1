class ChatRoom < ApplicationRecord
  belongs_to :job_request
  has_many :messages, dependent: :destroy
  has_many :chat_room_participants, dependent: :destroy
  has_many :participants, through: :chat_room_participants, source: :user

  validates :name, presence: true, length: { minimum: 3, maximum: 100 }
  validates :job_request_id, uniqueness: true

  before_validation :set_default_name, on: :create
  after_create :add_initial_participants

  scope :active, -> { where(is_active: true) }
  scope :for_user, ->(user) { joins(:chat_room_participants).where(chat_room_participants: { user: user }) }

  def self.find_or_create_for_job_request(job_request)
    find_or_create_by(job_request: job_request) do |chat_room|
      chat_room.name = "Job: #{job_request.title}"
      chat_room.is_active = true
    end
  end

  def last_message
    messages.order(created_at: :desc).first
  end

  def unread_count_for(user)
    participant = chat_room_participants.find_by(user: user)
    return 0 unless participant

    if participant.last_read_at.present?
      messages.where('created_at > ?', participant.last_read_at).count
    else
      messages.count
    end
  end

  def mark_as_read_for(user)
    participant = chat_room_participants.find_by(user: user)
    participant&.update(last_read_at: Time.current)
  end

  def can_participate?(user)
    return false unless user

    # Job poster and accepted applicant can participate
    job_poster = job_request.user
    accepted_application = job_request.job_applications.accepted.first
    accepted_applicant = accepted_application&.user

    user == job_poster || user == accepted_applicant
  end

  def add_participant(user)
    return false unless can_participate?(user)

    chat_room_participants.find_or_create_by(user: user) do |participant|
      participant.joined_at = Time.current
    end
  end

  def participant_names
    participants.pluck(:name).join(', ')
  end

  def other_participant_for(user)
    participants.where.not(id: user.id).first
  end

  private

  def set_default_name
    if job_request.present? && name.blank?
      self.name = "Chat: #{job_request.title}"
    end
  end

  def add_initial_participants
    # Add job poster
    add_participant(job_request.user)
    
    # Add accepted applicant if exists
    accepted_application = job_request.job_applications.accepted.first
    if accepted_application
      add_participant(accepted_application.user)
    end
  end
end