module BlogHelper
  def render_meta_tags
    return unless @meta_tags
    
    content = []
    
    # Basic meta tags
    content << tag.meta(name: 'description', content: @meta_tags[:description]) if @meta_tags[:description]
    content << tag.meta(name: 'keywords', content: @meta_tags[:keywords]) if @meta_tags[:keywords]
    
    # Open Graph tags
    content << tag.meta(property: 'og:title', content: @meta_tags[:og_title] || @meta_tags[:title]) if @meta_tags[:title]
    content << tag.meta(property: 'og:description', content: @meta_tags[:og_description] || @meta_tags[:description]) if @meta_tags[:description]
    content << tag.meta(property: 'og:image', content: @meta_tags[:og_image]) if @meta_tags[:og_image]
    content << tag.meta(property: 'og:url', content: @meta_tags[:og_url]) if @meta_tags[:og_url]
    content << tag.meta(property: 'og:type', content: @meta_tags[:og_type] || 'website')
    content << tag.meta(property: 'og:site_name', content: @meta_tags[:site_name]) if @meta_tags[:site_name]
    
    # Article specific tags
    content << tag.meta(property: 'article:author', content: @meta_tags[:article_author]) if @meta_tags[:article_author]
    content << tag.meta(property: 'article:published_time', content: @meta_tags[:article_published_time]) if @meta_tags[:article_published_time]
    content << tag.meta(property: 'article:section', content: @meta_tags[:article_section]) if @meta_tags[:article_section]
    content << tag.meta(property: 'article:tag', content: @meta_tags[:article_tag]) if @meta_tags[:article_tag]
    
    # Twitter tags
    content << tag.meta(name: 'twitter:card', content: @meta_tags[:twitter_card] || 'summary')
    content << tag.meta(name: 'twitter:site', content: @meta_tags[:twitter_site]) if @meta_tags[:twitter_site]
    content << tag.meta(name: 'twitter:creator', content: @meta_tags[:twitter_creator]) if @meta_tags[:twitter_creator]
    content << tag.meta(name: 'twitter:title', content: @meta_tags[:twitter_title] || @meta_tags[:title]) if @meta_tags[:title]
    content << tag.meta(name: 'twitter:description', content: @meta_tags[:twitter_description] || @meta_tags[:description]) if @meta_tags[:description]
    content << tag.meta(name: 'twitter:image', content: @meta_tags[:twitter_image] || @meta_tags[:og_image]) if @meta_tags[:og_image]
    
    safe_join(content, "\n")
  end
  
  def render_json_ld
    return unless @json_ld
    
    content_tag :script, type: 'application/ld+json' do
      @json_ld.to_json.html_safe
    end
  end
  
  def blog_post_excerpt(post, length = 150)
    return post.excerpt if post.excerpt.present?
    
    plain_text = strip_tags(post.content)
    truncate(plain_text, length: length, separator: ' ')
  end
  
  def blog_post_reading_time(post)
    time = post.estimated_read_time
    pluralize(time, 'minute')
  end
  
  def blog_post_featured_image(post, options = {})
    if post.featured_image.attached?
      image_tag post.featured_image, options
    elsif post.og_image_url.present?
      image_tag post.og_image_url, options
    else
      # Default blog image from Unsplash
      image_tag "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop", options
    end
  end
  
  def blog_category_badge(category)
    content_tag :span, category.name,
                class: "badge badge-sm",
                style: "background-color: #{category.color_with_default}; color: white;"
  end
  
  def blog_tag_link(tag)
    link_to "##{tag.name}", blog_tag_path(tag.slug),
            class: "text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors"
  end
  
  def blog_author_avatar(post, size: 'w-8 h-8')
    if post.author_avatar&.attached?
      image_tag post.author_avatar.variant(resize_to_fill: [32, 32, { gravity: 'center' }]),
                class: "#{size} rounded-full object-cover"
    else
      content_tag :div, post.author_name.first.upcase,
                  class: "#{size} bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm"
    end
  end
  
  def format_publish_date(date, format = :long)
    return 'Not published' unless date
    
    case format
    when :short
      date.strftime('%b %d, %Y')
    when :long
      date.strftime('%B %d, %Y')
    when :full
      date.strftime('%A, %B %d, %Y at %I:%M %p')
    else
      date.strftime('%B %d, %Y')
    end
  end
  
  def blog_share_url(post, platform)
    base_url = blog_post_url(post)
    title = post.title
    description = post.seo_description
    
    case platform.to_sym
    when :twitter
      "https://twitter.com/intent/tweet?url=#{CGI.escape(base_url)}&text=#{CGI.escape(title)}"
    when :facebook
      "https://www.facebook.com/sharer/sharer.php?u=#{CGI.escape(base_url)}"
    when :linkedin
      "https://www.linkedin.com/sharing/share-offsite/?url=#{CGI.escape(base_url)}"
    when :reddit
      "https://reddit.com/submit?url=#{CGI.escape(base_url)}&title=#{CGI.escape(title)}"
    when :whatsapp
      "https://api.whatsapp.com/send?text=#{CGI.escape("#{title} - #{base_url}")}"
    else
      base_url
    end
  end
  
  def blog_breadcrumbs
    breadcrumbs = [{ name: 'Home', url: root_path }]
    breadcrumbs << { name: 'Blog', url: blog_index_path }
    
    if @category
      breadcrumbs << { name: @category.name, url: blog_category_path(@category.slug) }
    elsif @tag
      breadcrumbs << { name: "##{@tag.name}", url: blog_tag_path(@tag.slug) }
    elsif @blog_post
      @blog_post.blog_categories.first.tap do |category|
        breadcrumbs << { name: category.name, url: blog_category_path(category.slug) } if category
      end
      breadcrumbs << { name: @blog_post.title, url: blog_post_path(@blog_post.slug) }
    end
    
    breadcrumbs
  end
  
  def render_blog_content(content)
    # Basic content processing - in production you might want to use a proper markdown processor
    # For now, we'll just handle basic HTML and ensure it's safe
    sanitized_content = sanitize(content, 
      tags: %w[p br strong b em i u h1 h2 h3 h4 h5 h6 ul ol li blockquote a img],
      attributes: %w[href src alt title]
    )
    
    # Convert line breaks to paragraphs if content doesn't contain HTML
    if !content.include?('<p>') && content.include?("\n")
      simple_format(sanitized_content)
    else
      sanitized_content.html_safe
    end
  end
  
  def popular_posts_widget(limit = 5)
    @popular_posts ||= BlogPost.popular(limit)
  end
  
  def recent_posts_widget(limit = 5)
    @recent_posts ||= BlogPost.published.recent.limit(limit)
  end
  
  def categories_widget
    @categories_widget ||= BlogService.popular_categories(10)
  end
  
  def tags_widget
    @tags_widget ||= BlogService.popular_tags(20)
  end
end