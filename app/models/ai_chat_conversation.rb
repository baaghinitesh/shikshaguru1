class AiChatConversation < ApplicationRecord
  belongs_to :user
  has_many :ai_chat_messages, dependent: :destroy
  
  # Validations
  validates :status, inclusion: { in: %w[active archived completed] }
  validates :title, length: { maximum: 200 }
  validates :context, length: { maximum: 1000 }
  
  # Scopes
  scope :active, -> { where(status: 'active') }
  scope :recent, -> { order(updated_at: :desc) }
  
  # Enums
  enum :status, { active: 'active', archived: 'archived', completed: 'completed' }
  
  # Instance methods
  def messages_ordered
    ai_chat_messages.order(:timestamp)
  end
  
  def last_message
    ai_chat_messages.order(:timestamp).last
  end
  
  def user_messages_count
    ai_chat_messages.where(role: 'user').count
  end
  
  def assistant_messages_count
    ai_chat_messages.where(role: 'assistant').count
  end
  
  def generate_title_if_blank
    return if title.present?
    return unless ai_chat_messages.any?
    
    first_user_message = ai_chat_messages.where(role: 'user').first&.content
    if first_user_message.present?
      # Generate a title from the first user message (first 50 characters)
      self.title = first_user_message.truncate(50)
      save
    end
  end
  
  def add_message(role, content)
    ai_chat_messages.create!(
      role: role,
      content: content,
      timestamp: Time.current
    )
    touch # Update conversation timestamp
  end
  
  def conversation_context
    messages = messages_ordered.limit(10).map do |message|
      {
        role: message.role,
        content: message.content
      }
    end
    
    system_context = build_system_context
    [system_context] + messages
  end
  
  private
  
  def build_system_context
    base_context = "You are an AI assistant for ShikshaGuru, an educational platform that connects students with teachers and tutors. Your role is to help users with educational questions, learning strategies, study tips, and general academic guidance."
    
    user_context = ""
    if user.present?
      role_context = case user.role
      when 'student'
        " The user is a student looking for learning assistance."
      when 'teacher'
        " The user is a teacher who may need help with teaching strategies or educational content."
      when 'admin'
        " The user is an administrator who may need help with platform-related questions."
      else
        " The user's role is not specified."
      end
      user_context = role_context
    end
    
    additional_context = context.present? ? " Additional context: #{context}" : ""
    
    {
      role: 'system',
      content: base_context + user_context + additional_context
    }
  end
end