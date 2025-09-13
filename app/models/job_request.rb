class JobRequest < ApplicationRecord
  STATUSES = %w[open closed completed expired].freeze
  LEVELS = %w[beginner intermediate advanced expert].freeze
  SUBJECTS = %w[
    mathematics physics chemistry biology english hindi history geography 
    economics political_science sociology psychology philosophy computer_science
    arts music dance singing painting drawing sports yoga cooking languages
    competitive_exams jee neet upsc cat gmat gre ielts toefl gate other
  ].freeze

  belongs_to :user
  has_many :job_applications, dependent: :destroy
  has_many :reviews, dependent: :destroy
  has_many :applicants, through: :job_applications, source: :user
  has_one :chat_room, dependent: :destroy

  validates :title, presence: true, length: { minimum: 10, maximum: 100 }
  validates :description, presence: true, length: { minimum: 50, maximum: 2000 }
  validates :subject, presence: true, inclusion: { in: SUBJECTS }
  validates :level, presence: true, inclusion: { in: LEVELS }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :budget_max, numericality: { greater_than_or_equal_to: :budget_min }, allow_blank: true
  validates :budget_min, numericality: { greater_than: 0 }, allow_blank: true
  validate :at_least_one_session_type
  validate :expires_at_in_future, on: :create

  scope :active, -> { where(status: 'open') }
  scope :by_subject, ->(subject) { where(subject: subject) if subject.present? }
  scope :by_level, ->(level) { where(level: level) if level.present? }
  scope :by_location, ->(location) { where('preferred_location ILIKE ?', "%#{location}%") if location.present? }
  scope :within_budget, ->(min, max) { 
    if min.present? && max.present?
      where('(budget_min IS NULL OR budget_min <= ?) AND (budget_max IS NULL OR budget_max >= ?)', max, min)
    end
  }

  before_create :set_default_expires_at
  
  # Logging callbacks
  after_create :log_job_creation
  after_update :log_status_changes

  def expired?
    expires_at && expires_at < Time.current
  end

  def can_apply?(user)
    user&.can_apply_to_job?(self)
  end

  def applied_by?(user)
    return false unless user
    job_applications.exists?(user: user)
  end

  def budget_range
    if budget_min.present? && budget_max.present?
      "₹#{budget_min.to_i} - ₹#{budget_max.to_i}"
    elsif budget_min.present?
      "₹#{budget_min.to_i}+"
    elsif budget_max.present?
      "Up to ₹#{budget_max.to_i}"
    else
      "Budget negotiable"
    end
  end

  def session_types
    types = []
    types << "Online" if online_sessions?
    types << "In-person" if in_person_sessions?
    types.join(", ")
  end

  def mark_expired!
    update!(status: 'expired')
  end

  def close!
    update!(status: 'closed')
  end

  def complete!
    update!(status: 'completed')
  end

  private

  def at_least_one_session_type
    unless online_sessions? || in_person_sessions?
      errors.add(:base, "Please select at least one session type (online or in-person)")
    end
  end

  def expires_at_in_future
    if expires_at.present? && expires_at <= Time.current
      errors.add(:expires_at, "must be in the future")
    end
  end

  def set_default_expires_at
    self.expires_at ||= 30.days.from_now
  end
  
  def log_job_creation
    LoggingService.log_job_event(
      'job_request_created',
      id,
      user.id,
      {
        title: title,
        subject: subject,
        level: level,
        budget_min: budget_min,
        budget_max: budget_max,
        session_types: session_types,
        location: preferred_location
      }
    )
  end
  
  def log_status_changes
    if saved_change_to_status?
      old_status, new_status = saved_change_to_status
      
      LoggingService.log_job_event(
        'job_request_status_changed',
        id,
        user.id,
        {
          old_status: old_status,
          new_status: new_status,
          title: title,
          total_applications: job_applications.count
        }
      )
    end
  end
end