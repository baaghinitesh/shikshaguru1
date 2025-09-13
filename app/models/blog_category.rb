class BlogCategory < ApplicationRecord
  # Associations
  has_many :blog_post_categories, dependent: :destroy
  has_many :blog_posts, through: :blog_post_categories
  
  # Validations
  validates :name, presence: true, uniqueness: true, length: { maximum: 50 }
  validates :slug, presence: true, uniqueness: true, format: { with: /\A[a-z0-9\-]+\z/ }
  validates :description, length: { maximum: 500 }
  validates :color, format: { with: /\A#[0-9A-Fa-f]{6}\z/, message: 'must be a valid hex color' }, allow_blank: true
  
  # Callbacks
  before_validation :generate_slug, if: :name_changed?
  before_validation :set_default_color, if: :color_blank?
  
  # Scopes
  scope :with_posts, -> { joins(:blog_posts).distinct }
  scope :ordered, -> { order(:name) }
  
  # Instance methods
  def published_posts
    blog_posts.published
  end
  
  def posts_count
    blog_posts.published.count
  end
  
  def to_param
    slug
  end
  
  def color_with_default
    color.presence || default_colors.sample
  end
  
  private
  
  def generate_slug
    self.slug = name.to_s.parameterize
  end
  
  def color_blank?
    color.blank?
  end
  
  def set_default_color
    self.color = default_colors.sample
  end
  
  def default_colors
    [
      '#3b82f6', # Blue
      '#10b981', # Green
      '#8b5cf6', # Purple
      '#f97316', # Orange
      '#ef4444', # Red
      '#ec4899', # Pink
      '#06b6d4', # Cyan
      '#84cc16'  # Lime
    ]
  end
end