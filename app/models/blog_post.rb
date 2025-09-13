class BlogPost < ApplicationRecord
  belongs_to :author, polymorphic: true
  
  # Associations for categories and tags
  has_many :blog_post_categories, dependent: :destroy
  has_many :blog_categories, through: :blog_post_categories
  has_many :blog_post_tags, dependent: :destroy
  has_many :blog_tags, through: :blog_post_tags
  
  # Active Storage for featured image
  has_one_attached :featured_image
  
  # Enums for status
  enum :status, { draft: 'draft', published: 'published', archived: 'archived', scheduled: 'scheduled' }
  
  # Validations
  validates :title, presence: true, length: { maximum: 200 }
  validates :slug, presence: true, uniqueness: true, format: { with: /\A[a-z0-9\-]+\z/ }
  validates :content, presence: true
  validates :excerpt, length: { maximum: 500 }
  validates :status, presence: true
  validates :meta_title, length: { maximum: 60 }
  validates :meta_description, length: { maximum: 160 }
  validates :meta_keywords, length: { maximum: 255 }
  validates :reading_time, numericality: { greater_than: 0, allow_nil: true }
  validates :views_count, numericality: { greater_than_or_equal_to: 0 }
  
  # Callbacks
  before_validation :generate_slug, if: :title_changed?
  before_validation :generate_excerpt, if: :content_changed?
  before_validation :calculate_reading_time, if: :content_changed?
  before_validation :generate_meta_tags, if: :title_changed?
  after_create :log_blog_creation
  after_update :log_blog_updates, if: :saved_change_to_status?
  
  # Scopes
  scope :published, -> { where(status: 'published').where('published_at <= ?', Time.current) }
  scope :featured, -> { where(featured: true) }
  scope :recent, -> { order(published_at: :desc) }
  scope :by_author, ->(author) { where(author: author) }
  scope :by_category, ->(category) { joins(:blog_categories).where(blog_categories: { id: category.id }) }
  scope :by_tag, ->(tag) { joins(:blog_tags).where(blog_tags: { id: tag.id }) }
  scope :search, ->(query) { where("title ILIKE ? OR content ILIKE ?", "%#{query}%", "%#{query}%") }
  
  # Class methods
  def self.trending(limit = 5)
    published.where('created_at >= ?', 7.days.ago)
             .order(views_count: :desc)
             .limit(limit)
  end
  
  def self.popular(limit = 5)
    published.order(views_count: :desc).limit(limit)
  end
  
  def self.related_to(post, limit = 3)
    return none unless post.blog_categories.any? || post.blog_tags.any?
    
    related_posts = published.where.not(id: post.id)
    
    if post.blog_categories.any?
      category_ids = post.blog_categories.pluck(:id)
      related_posts = related_posts.joins(:blog_categories)
                                 .where(blog_categories: { id: category_ids })
    end
    
    if post.blog_tags.any?
      tag_ids = post.blog_tags.pluck(:id)
      related_posts = related_posts.joins(:blog_tags)
                                 .where(blog_tags: { id: tag_ids })
    end
    
    related_posts.distinct.limit(limit)
  end
  
  # Instance methods
  def published?
    status == 'published' && published_at.present? && published_at <= Time.current
  end
  
  def scheduled?
    status == 'scheduled' && published_at.present? && published_at > Time.current
  end
  
  def can_be_published?
    draft? || scheduled?
  end
  
  def publish!
    update!(status: 'published', published_at: Time.current)
  end
  
  def archive!
    update!(status: 'archived')
  end
  
  def increment_views!
    increment!(:views_count)
  end
  
  def author_name
    case author_type
    when 'User'
      author.name
    when 'Administrator'
      author.name
    else
      'Unknown Author'
    end
  end
  
  def author_avatar
    case author_type
    when 'User'
      author.profile_picture.attached? ? author.profile_picture : nil
    when 'Administrator'
      nil # Admins don't have profile pictures in this system
    else
      nil
    end
  end
  
  def featured_image_url
    return og_image_url if og_image_url.present?
    return Rails.application.routes.url_helpers.url_for(featured_image) if featured_image.attached?
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=630&fit=crop" # Default blog image
  end
  
  def to_param
    slug
  end
  
  def estimated_read_time
    reading_time || calculate_reading_time_value
  end
  
  def category_names
    blog_categories.pluck(:name)
  end
  
  def tag_names
    blog_tags.pluck(:name)
  end
  
  def seo_title
    meta_title.presence || title
  end
  
  def seo_description
    meta_description.presence || excerpt.presence || content.truncate(160)
  end
  
  def seo_keywords
    meta_keywords.presence || tag_names.join(', ')
  end
  
  private
  
  def generate_slug
    return if slug.present? && !title_changed?
    
    base_slug = title.to_s.parameterize
    counter = 0
    loop do
      candidate_slug = counter.zero? ? base_slug : "#{base_slug}-#{counter}"
      break if BlogPost.where.not(id: id).where(slug: candidate_slug).empty?
      counter += 1
    end
    self.slug = counter.zero? ? base_slug : "#{base_slug}-#{counter}"
  end
  
  def generate_excerpt
    return if excerpt.present?
    return unless content.present?
    
    # Remove HTML tags and get first 150 words
    plain_text = ActionView::Base.full_sanitizer.sanitize(content)
    words = plain_text.split(/\s+/)
    self.excerpt = words.first(30).join(' ') + (words.length > 30 ? '...' : '')
  end
  
  def calculate_reading_time
    self.reading_time = calculate_reading_time_value
  end
  
  def calculate_reading_time_value
    return 1 unless content.present?
    
    # Average reading speed: 200 words per minute
    words_per_minute = 200
    word_count = ActionView::Base.full_sanitizer.sanitize(content).split(/\s+/).length
    minutes = (word_count.to_f / words_per_minute).ceil
    [minutes, 1].max # Minimum 1 minute
  end
  
  def generate_meta_tags
    return unless title.present?
    
    self.meta_title ||= title.truncate(60)
    self.meta_description ||= excerpt.presence&.truncate(160) || content&.truncate(160)
  end
  
  def log_blog_creation
    LoggingService.log_security_event(
      'blog_post_created',
      author_id,
      nil,
      {
        blog_post_id: id,
        title: title,
        status: status,
        author_type: author_type
      }
    )
  end
  
  def log_blog_updates
    LoggingService.log_security_event(
      'blog_post_status_changed',
      author_id,
      nil,
      {
        blog_post_id: id,
        title: title,
        old_status: status_before_last_save,
        new_status: status,
        author_type: author_type
      }
    )
  end
  
  def author_id
    case author_type
    when 'User'
      author.id
    when 'Administrator'
      author.id
    else
      nil
    end
  end
end