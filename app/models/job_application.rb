class JobApplication < ApplicationRecord
  STATUSES = %w[pending accepted rejected withdrawn].freeze

  belongs_to :job_request
  belongs_to :user
  
  validates :message, presence: true, length: { minimum: 20, maximum: 1000 }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :proposed_rate, numericality: { greater_than: 0 }, allow_blank: true
  validates :applied_at, presence: true
  validate :user_must_be_teacher
  validate :cannot_apply_to_own_job
  validate :job_must_be_open

  before_validation :set_applied_at, on: :create

  scope :pending, -> { where(status: 'pending') }
  scope :accepted, -> { where(status: 'accepted') }
  scope :rejected, -> { where(status: 'rejected') }
  scope :recent, -> { order(applied_at: :desc) }

  def accept!
    transaction do
      update!(status: 'accepted')
      # Reject all other applications for this job
      job_request.job_applications.where.not(id: id).update_all(status: 'rejected')
      job_request.close!
    end
  end

  def reject!
    update!(status: 'rejected')
  end

  def withdraw!
    update!(status: 'withdrawn')
  end

  def pending?
    status == 'pending'
  end

  def accepted?
    status == 'accepted'
  end

  def rejected?
    status == 'rejected'
  end

  def withdrawn?
    status == 'withdrawn'
  end

  def rate_display
    if proposed_rate.present?
      "₹#{proposed_rate.to_i}/session"
    else
      "Rate negotiable"
    end
  end

  private

  def user_must_be_teacher
    unless user&.teacher?
      errors.add(:user, "must be a teacher to apply for jobs")
    end
  end

  def cannot_apply_to_own_job
    if user && job_request && user == job_request.user
      errors.add(:base, "You cannot apply to your own job request")
    end
  end

  def job_must_be_open
    if job_request && job_request.status != 'open'
      errors.add(:job_request, "is no longer accepting applications")
    end
  end

  def set_applied_at
    self.applied_at ||= Time.current
  end
end