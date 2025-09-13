class BlogTag < ApplicationRecord
  # Associations
  has_many :blog_post_tags, dependent: :destroy
  has_many :blog_posts, through: :blog_post_tags
  
  # Validations
  validates :name, presence: true, uniqueness: true, length: { maximum: 30 }
  validates :slug, presence: true, uniqueness: true, format: { with: /\A[a-z0-9\-]+\z/ }
  
  # Callbacks
  before_validation :generate_slug, if: :name_changed?
  before_validation :normalize_name
  
  # Scopes
  scope :popular, -> { 
    joins(:blog_posts)
      .select('blog_tags.*, COUNT(blog_posts.id) as posts_count')
      .group('blog_tags.id')
      .order('posts_count DESC')
  }
  scope :with_posts, -> { where(id: BlogPostTag.select(:blog_tag_id).distinct) }
  scope :ordered, -> { order(:name) }
  
  # Class methods
  def self.find_or_create_by_names(tag_names)
    return [] if tag_names.blank?
    
    names = tag_names.map(&:strip).reject(&:blank?).uniq
    existing_tags = where(name: names)
    
    new_tag_names = names - existing_tags.pluck(:name)
    new_tags = new_tag_names.map { |name| create(name: name) }
    
    existing_tags + new_tags
  end
  
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
  
  private
  
  def generate_slug
    self.slug = name.to_s.parameterize
  end
  
  def normalize_name
    self.name = name.to_s.strip.downcase if name.present?
  end
end