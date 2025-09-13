class Review < ApplicationRecord
  belongs_to :reviewer, class_name: 'User'
  belongs_to :reviewee, class_name: 'User'
  belongs_to :job_request

  validates :rating, presence: true, inclusion: { in: 1..5 }
  validates :comment, length: { maximum: 1000 }
  validate :reviewer_and_reviewee_must_be_different
  validate :must_be_part_of_job_request

  scope :visible, -> { where(anonymous: false) }
  scope :recent, -> { order(created_at: :desc) }
  scope :by_rating, ->(rating) { where(rating: rating) if rating.present? }

  def display_reviewer_name
    if anonymous?
      "Anonymous"
    else
      reviewer.display_name
    end
  end

  def stars_display
    "★" * rating + "☆" * (5 - rating)
  end

  def helpful_count
    # This could be extended later with a helpful_votes table
    0
  end

  private

  def reviewer_and_reviewee_must_be_different
    if reviewer_id == reviewee_id
      errors.add(:base, "You cannot review yourself")
    end
  end

  def must_be_part_of_job_request
    return unless reviewer && reviewee && job_request

    # Either the reviewer is the job poster and reviewee is an applicant
    # Or the reviewer is an applicant and reviewee is the job poster
    job_poster = job_request.user
    applicants = job_request.applicants

    unless (reviewer == job_poster && applicants.include?(reviewee)) ||
           (applicants.include?(reviewer) && reviewee == job_poster)
      errors.add(:base, "You can only review users you've worked with through this job")
    end
  end
end