class BlogPostTag < ApplicationRecord
  belongs_to :blog_post
  belongs_to :blog_tag
  
  # Validations
  validates :blog_post_id, uniqueness: { scope: :blog_tag_id }
end