class User < ApplicationRecord
  MIN_PASSWORD = 4
  ROLES = %w[student teacher institute admin].freeze

  has_secure_password validations: false

  generates_token_for :email_verification, expires_in: 2.days do
    email
  end
  generates_token_for :password_reset, expires_in: 20.minutes

  has_many :sessions, dependent: :destroy
  
  # Active Storage associations
  has_one_attached :profile_picture
  has_many_attached :documents
  has_many_attached :certificates
  
  # Job-related associations
  has_many :job_requests, dependent: :destroy
  has_many :job_applications, dependent: :destroy
  
  # Review associations
  has_many :given_reviews, class_name: 'Review', foreign_key: 'reviewer_id', dependent: :destroy
  has_many :received_reviews, class_name: 'Review', foreign_key: 'reviewee_id', dependent: :destroy
  
  # Chat associations
  has_many :messages, dependent: :destroy
  has_many :chat_room_participants, dependent: :destroy
  has_many :chat_rooms, through: :chat_room_participants

  validates :name, presence: true, length: { minimum: 4 }
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, allow_nil: true, length: { minimum: MIN_PASSWORD }, if: :password_required?
  validates :role, presence: true, inclusion: { in: ROLES }
  validates :phone, format: { with: /\A[+]?[0-9\s\-()]+\z/, message: 'Invalid phone format' }, allow_blank: true

  normalizes :email, with: -> { _1.strip.downcase }

  before_validation if: :email_changed?, on: :update do
    self.verified = false
  end

  after_update if: :password_digest_previously_changed? do
    sessions.where.not(id: Current.session).delete_all
  end
  
  # Logging callbacks
  after_create :log_user_creation
  after_update :log_profile_updates
  before_destroy :log_user_deletion

  # OAuth methods
  def self.from_omniauth(auth)
    user = find_or_create_by(email: auth.info.email) do |u|
      u.name = auth.info.name
      u.email = auth.info.email
      u.provider = auth.provider
      u.uid = auth.uid
      u.verified = true
    end
    
    # Log OAuth authentication event
    LoggingService.log_auth_event(
      user.persisted? ? 'oauth_signin' : 'oauth_signup',
      user.id,
      user.email,
      nil, # IP will be logged by middleware
      {
        provider: auth.provider,
        provider_uid: auth.uid,
        name: auth.info.name
      }
    )
    
    user
  end

  def oauth_user?
    provider.present? && uid.present?
  end

  # Role-based methods
  def student?
    role == 'student'
  end

  def teacher?
    role == 'teacher'
  end

  def institute?
    role == 'institute'
  end

  def admin?
    role == 'admin'
  end

  def display_name
    name.present? ? name : email.split('@').first.titleize
  end

  def profile_complete?
    case role
    when 'student'
      name.present? && location.present?
    when 'teacher'
      name.present? && location.present? && bio.present? && phone.present?
    when 'institute'
      name.present? && location.present? && bio.present?
    else
      true
    end
  end

  def average_rating
    return 0 if received_reviews.empty?
    received_reviews.average(:rating).to_f.round(1)
  end

  def total_reviews
    received_reviews.count
  end

  def can_apply_to_job?(job_request)
    return false unless teacher?
    return false if job_request.user == self
    return false if job_applications.exists?(job_request: job_request)
    job_request.status == 'open'
  end

  def can_post_job?
    student? || role == 'institute'
  end

  def unread_messages_count
    chat_room_participants.joins(:chat_room)
      .where(chat_rooms: { is_active: true })
      .sum { |participant| participant.unread_messages_count }
  end

  def recent_chat_rooms
    chat_rooms.active.joins(:messages)
      .order('messages.created_at DESC')
      .distinct
      .limit(10)
  end

  def can_chat_with?(other_user)
    return false unless other_user
    return false if self == other_user

    # Can chat if they have a mutual job request with accepted application
    mutual_job_requests = JobRequest.joins(:job_applications)
      .where(
        '(job_requests.user_id = ? AND job_applications.user_id = ? AND job_applications.status = ?) OR (job_requests.user_id = ? AND job_applications.user_id = ? AND job_applications.status = ?)',
        id, other_user.id, 'accepted',
        other_user.id, id, 'accepted'
      )
    
    mutual_job_requests.exists?
  end
  
  # File and image helper methods
  def profile_picture_url(variant: :original)
    return nil unless profile_picture.attached?
    
    case variant
    when :thumbnail
      profile_picture.variant(resize_to_fill: [150, 150, { gravity: 'center' }])
    when :medium
      profile_picture.variant(resize_to_limit: [400, 400])
    when :large
      profile_picture.variant(resize_to_limit: [800, 800])
    else
      profile_picture
    end
  end
  
  def has_documents?
    documents.attached? && documents.any?
  end
  
  def has_certificates?
    certificates.attached? && certificates.any?
  end
  
  def total_file_size
    total_size = 0
    total_size += profile_picture.blob.byte_size if profile_picture.attached?
    total_size += documents.sum { |doc| doc.blob.byte_size } if has_documents?
    total_size += certificates.sum { |cert| cert.blob.byte_size } if has_certificates?
    total_size
  end
  
  def file_storage_percentage
    max_storage = 50.megabytes # 50MB per user
    (total_file_size.to_f / max_storage * 100).round(1)
  end
  
  def can_upload_more_files?
    file_storage_percentage < 95 # Leave 5% buffer
  end

  private

  def password_required?
    return false if oauth_user?
    password_digest.blank? || password.present?
  end
  
  def log_user_creation
    LoggingService.log_auth_event(
      'user_registration',
      id,
      email,
      nil, # IP will be logged by middleware
      {
        role: role,
        name: name,
        provider: provider || 'email',
        verified: verified
      }
    )
  end
  
  def log_profile_updates
    if saved_changes.present?
      # Don't log password changes (security)
      changes_to_log = saved_changes.except('password_digest', 'updated_at')
      
      if changes_to_log.present?
        LoggingService.app_logger.info({
          event: 'profile_updated',
          user_id: id,
          email: email,
          changes: changes_to_log.keys,
          timestamp: Time.current.iso8601
        }.to_json)
      end
    end
  end
  
  def log_user_deletion
    LoggingService.log_auth_event(
      'user_deletion',
      id,
      email,
      nil,
      {
        role: role,
        name: name,
        total_job_requests: job_requests.count,
        total_applications: job_applications.count,
        total_reviews: received_reviews.count
      }
    )
  end

end
