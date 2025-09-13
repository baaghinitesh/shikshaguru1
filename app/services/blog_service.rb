class BlogService
  class << self
    # Blog post creation and management
    def create_post(author, params)
      blog_post = BlogPost.new(params.except(:categories, :tags))
      blog_post.author = author
      
      if blog_post.save
        assign_categories(blog_post, params[:categories]) if params[:categories].present?
        assign_tags(blog_post, params[:tags]) if params[:tags].present?
        
        LoggingService.log_security_event(
          'blog_service_create_success',
          get_author_id(author),
          nil,
          {
            blog_post_id: blog_post.id,
            title: blog_post.title,
            status: blog_post.status
          }
        )
        
        { success: true, blog_post: blog_post }
      else
        LoggingService.log_error(
          'Blog post creation failed',
          nil,
          {
            author_id: get_author_id(author),
            errors: blog_post.errors.full_messages
          }
        )
        
        { success: false, errors: blog_post.errors.full_messages }
      end
    end
    
    def update_post(blog_post, params)
      old_status = blog_post.status
      
      if blog_post.update(params.except(:categories, :tags))
        assign_categories(blog_post, params[:categories]) if params[:categories].present?
        assign_tags(blog_post, params[:tags]) if params[:tags].present?
        
        if old_status != blog_post.status
          LoggingService.log_security_event(
            'blog_post_status_updated',
            get_author_id(blog_post.author),
            nil,
            {
              blog_post_id: blog_post.id,
              title: blog_post.title,
              old_status: old_status,
              new_status: blog_post.status
            }
          )
        end
        
        { success: true, blog_post: blog_post }
      else
        { success: false, errors: blog_post.errors.full_messages }
      end
    end
    
    def publish_post(blog_post)
      return { success: false, error: 'Post cannot be published' } unless blog_post.can_be_published?
      
      if blog_post.publish!
        LoggingService.log_security_event(
          'blog_post_published',
          get_author_id(blog_post.author),
          nil,
          {
            blog_post_id: blog_post.id,
            title: blog_post.title,
            published_at: blog_post.published_at
          }
        )
        
        { success: true, blog_post: blog_post }
      else
        { success: false, errors: blog_post.errors.full_messages }
      end
    end
    
    def archive_post(blog_post)
      if blog_post.archive!
        LoggingService.log_security_event(
          'blog_post_archived',
          get_author_id(blog_post.author),
          nil,
          {
            blog_post_id: blog_post.id,
            title: blog_post.title
          }
        )
        
        { success: true, blog_post: blog_post }
      else
        { success: false, errors: blog_post.errors.full_messages }
      end
    end
    
    # Blog post search and filtering
    def search_posts(params = {})
      posts = BlogPost.published
      
      # Text search
      if params[:query].present?
        posts = posts.search(params[:query])
      end
      
      # Category filter
      if params[:category].present?
        category = BlogCategory.find_by(slug: params[:category])
        posts = posts.by_category(category) if category
      end
      
      # Tag filter
      if params[:tag].present?
        tag = BlogTag.find_by(slug: params[:tag])
        posts = posts.by_tag(tag) if tag
      end
      
      # Author filter
      if params[:author_id].present?
        author = find_author(params[:author_id], params[:author_type])
        posts = posts.by_author(author) if author
      end
      
      # Featured filter
      if params[:featured] == 'true'
        posts = posts.featured
      end
      
      # Date range filter
      if params[:from_date].present?
        posts = posts.where('published_at >= ?', Date.parse(params[:from_date]))
      end
      
      if params[:to_date].present?
        posts = posts.where('published_at <= ?', Date.parse(params[:to_date]))
      end
      
      # Sorting
      case params[:sort]
      when 'oldest'
        posts = posts.order(published_at: :asc)
      when 'popular'
        posts = posts.order(views_count: :desc)
      when 'title'
        posts = posts.order(:title)
      else
        posts = posts.recent
      end
      
      posts
    end
    
    # SEO and meta tag generation
    def generate_meta_tags(blog_post)
      {
        title: blog_post.seo_title,
        description: blog_post.seo_description,
        keywords: blog_post.seo_keywords,
        og_title: blog_post.seo_title,
        og_description: blog_post.seo_description,
        og_image: blog_post.featured_image_url,
        og_url: blog_post_url(blog_post),
        og_type: 'article',
        article_author: blog_post.author_name,
        article_published_time: blog_post.published_at&.iso8601,
        article_section: blog_post.category_names.first,
        article_tag: blog_post.tag_names.join(','),
        twitter_card: 'summary_large_image',
        twitter_title: blog_post.seo_title,
        twitter_description: blog_post.seo_description,
        twitter_image: blog_post.featured_image_url
      }
    end
    
    def generate_json_ld(blog_post)
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blog_post.title,
        description: blog_post.seo_description,
        image: blog_post.featured_image_url,
        author: {
          '@type': 'Person',
          name: blog_post.author_name
        },
        publisher: {
          '@type': 'Organization',
          name: 'ShikshaGuru',
          logo: {
            '@type': 'ImageObject',
            url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop'
          }
        },
        datePublished: blog_post.published_at&.iso8601,
        dateModified: blog_post.updated_at.iso8601,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': blog_post_url(blog_post)
        },
        keywords: blog_post.seo_keywords,
        articleSection: blog_post.category_names,
        wordCount: blog_post.content.present? ? ActionView::Base.full_sanitizer.sanitize(blog_post.content).split.length : 0,
        timeRequired: "PT#{blog_post.estimated_read_time}M"
      }.compact
    end
    
    # Analytics and statistics
    def get_blog_statistics
      {
        total_posts: BlogPost.count,
        published_posts: BlogPost.published.count,
        draft_posts: BlogPost.draft.count,
        scheduled_posts: BlogPost.scheduled.count,
        archived_posts: BlogPost.archived.count,
        total_views: BlogPost.sum(:views_count),
        categories_count: BlogCategory.count,
        tags_count: BlogTag.count,
        featured_posts: BlogPost.featured.count,
        recent_posts: BlogPost.published.where('published_at >= ?', 7.days.ago).count,
        popular_posts: BlogPost.popular(5).pluck(:title, :views_count),
        trending_posts: BlogPost.trending(5).pluck(:title, :views_count)
      }
    end
    
    def increment_post_views(blog_post, request = nil)
      # Simple view tracking - in production you might want to use cookies or sessions
      # to prevent duplicate views from same user
      blog_post.increment_views!
      
      LoggingService.log_security_event(
        'blog_post_viewed',
        nil,
        request&.remote_ip,
        {
          blog_post_id: blog_post.id,
          title: blog_post.title,
          views_count: blog_post.views_count
        }
      )
    end
    
    # Category and tag management
    def create_category(params)
      category = BlogCategory.new(params)
      
      if category.save
        { success: true, category: category }
      else
        { success: false, errors: category.errors.full_messages }
      end
    end
    
    def create_tag(name)
      tag = BlogTag.find_or_create_by(name: name.strip.downcase)
      { success: true, tag: tag }
    end
    
    def popular_tags(limit = 20)
      BlogTag.popular.with_posts.limit(limit)
    end
    
    def popular_categories(limit = 10)
      BlogCategory.joins(:blog_posts)
        .select('blog_categories.*, COUNT(blog_posts.id) as posts_count')
        .group('blog_categories.id')
        .order('posts_count DESC')
        .limit(limit)
    end
    
    # RSS feed generation
    def generate_rss_feed
      posts = BlogPost.published.recent.limit(20)
      
      {
        title: 'ShikshaGuru Blog',
        description: 'Latest educational insights and tips from ShikshaGuru',
        link: blog_index_url,
        posts: posts.map do |post|
          {
            title: post.title,
            description: post.excerpt,
            link: blog_post_url(post),
            pub_date: post.published_at,
            author: post.author_name,
            categories: post.category_names
          }
        end
      }
    end
    
    # Sitemap generation
    def generate_sitemap_entries
      BlogPost.published.map do |post|
        {
          url: blog_post_url(post),
          lastmod: post.updated_at,
          changefreq: 'weekly',
          priority: post.featured? ? 0.9 : 0.7
        }
      end
    end
    
    private
    
    def assign_categories(blog_post, category_ids)
      return unless category_ids.present?
      
      blog_post.blog_post_categories.destroy_all
      
      valid_category_ids = BlogCategory.where(id: category_ids).pluck(:id)
      valid_category_ids.each do |category_id|
        blog_post.blog_post_categories.create(blog_category_id: category_id)
      end
    end
    
    def assign_tags(blog_post, tag_names)
      return unless tag_names.present?
      
      blog_post.blog_post_tags.destroy_all
      
      # Handle both array of strings and comma-separated string
      names = tag_names.is_a?(Array) ? tag_names : tag_names.split(',')
      tags = BlogTag.find_or_create_by_names(names)
      
      tags.each do |tag|
        blog_post.blog_post_tags.create(blog_tag: tag)
      end
    end
    
    def find_author(author_id, author_type)
      case author_type
      when 'User'
        User.find_by(id: author_id)
      when 'Administrator'
        Administrator.find_by(id: author_id)
      else
        nil
      end
    end
    
    def get_author_id(author)
      author&.id
    end
    
    def blog_post_url(blog_post)
      Rails.application.routes.url_helpers.blog_post_url(blog_post)
    end
    
    def blog_index_url
      Rails.application.routes.url_helpers.blog_index_url
    end
  end
end