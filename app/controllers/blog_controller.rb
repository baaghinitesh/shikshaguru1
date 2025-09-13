class BlogController < ApplicationController
  before_action :set_blog_post, only: [:show]
  before_action :set_seo_defaults
  
  def index
    @blog_posts = BlogService.search_posts(search_params)
                             .includes(:author, :blog_categories, :blog_tags, featured_image_attachment: :blob)
                             .page(params[:page] || 1)
                             .per(12)
    
    @featured_posts = BlogPost.published.featured.recent.limit(3)
    @popular_categories = BlogService.popular_categories(8)
    @popular_tags = BlogService.popular_tags(15)
    
    # SEO for index page
    set_meta_tags(
      title: params[:query].present? ? "Search Results for '#{params[:query]}'" : 'Educational Blog',
      description: 'Discover educational insights, teaching tips, and learning resources on the ShikshaGuru blog',
      keywords: 'education, teaching, learning, tips, resources, ShikshaGuru',
      og_image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop'
    )
  end
  
  def show
    # Increment view count
    BlogService.increment_post_views(@blog_post, request)
    
    # Get related posts
    @related_posts = BlogPost.related_to(@blog_post, 3)
    
    # SEO for individual post
    meta_tags = BlogService.generate_meta_tags(@blog_post)
    set_meta_tags(meta_tags)
    
    # JSON-LD structured data
    @json_ld = BlogService.generate_json_ld(@blog_post)
    
    respond_to do |format|
      format.html
      format.json { render json: @blog_post }
    end
  end
  
  def category
    @category = BlogCategory.find_by!(slug: params[:slug])
    @blog_posts = BlogPost.published
                         .by_category(@category)
                         .recent
                         .includes(:author, :blog_categories, :blog_tags, featured_image_attachment: :blob)
                         .page(params[:page] || 1)
                         .per(12)
    
    set_meta_tags(
      title: "#{@category.name} - Educational Articles",
      description: @category.description.presence || "Read articles about #{@category.name} on ShikshaGuru blog",
      keywords: "#{@category.name}, education, teaching, learning",
      og_image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop'
    )
  end
  
  def tag
    @tag = BlogTag.find_by!(slug: params[:slug])
    @blog_posts = BlogPost.published
                         .by_tag(@tag)
                         .recent
                         .includes(:author, :blog_categories, :blog_tags, featured_image_attachment: :blob)
                         .page(params[:page] || 1)
                         .per(12)
    
    set_meta_tags(
      title: "#{@tag.name.titleize} - Educational Articles",
      description: "Articles tagged with #{@tag.name} on ShikshaGuru blog",
      keywords: "#{@tag.name}, education, teaching, learning",
      og_image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop'
    )
  end
  
  def search
    @query = params[:q]
    @blog_posts = BlogPost.published
                         .search(@query)
                         .recent
                         .includes(:author, :blog_categories, :blog_tags, featured_image_attachment: :blob)
                         .page(params[:page] || 1)
                         .per(12)
    
    @search_suggestions = generate_search_suggestions(@query) if @blog_posts.empty?
    
    set_meta_tags(
      title: @query.present? ? "Search Results for '#{@query}'" : 'Blog Search',
      description: "Search results for educational articles on ShikshaGuru blog",
      keywords: "search, #{@query}, education, articles"
    )
    
    respond_to do |format|
      format.html { render :index }
      format.json { 
        render json: {
          posts: @blog_posts,
          query: @query,
          total_count: @blog_posts.total_count,
          suggestions: @search_suggestions
        }
      }
    end
  end
  
  def feed
    @feed_data = BlogService.generate_rss_feed
    
    respond_to do |format|
      format.rss { render layout: false }
      format.xml { render :feed, layout: false }
    end
  end
  
  def sitemap
    @sitemap_entries = BlogService.generate_sitemap_entries
    
    respond_to do |format|
      format.xml { render layout: false }
    end
  end
  
  private
  
  def set_blog_post
    @blog_post = BlogPost.published.find_by!(slug: params[:slug])
  rescue ActiveRecord::RecordNotFound
    redirect_to blog_index_path, alert: 'Blog post not found'
  end
  
  def search_params
    params.permit(:query, :category, :tag, :author_id, :author_type, :featured, :from_date, :to_date, :sort, :q)
          .tap { |p| p[:query] = p[:q] if p[:q].present? }
  end
  
  def set_seo_defaults
    @seo_defaults = {
      site_name: 'ShikshaGuru',
      og_type: 'website',
      twitter_site: '@ShikshaGuru',
      twitter_creator: '@ShikshaGuru'
    }
  end
  
  def set_meta_tags(tags = {})
    @meta_tags = @seo_defaults.merge(tags)
  end
  
  def generate_search_suggestions(query)
    return [] if query.blank?
    
    # Get similar tags and categories
    suggestions = []
    
    # Similar tags
    similar_tags = BlogTag.where("name ILIKE ?", "%#{query}%").limit(3)
    suggestions += similar_tags.map { |tag| { type: 'tag', name: tag.name, slug: tag.slug } }
    
    # Similar categories  
    similar_categories = BlogCategory.where("name ILIKE ?", "%#{query}%").limit(3)
    suggestions += similar_categories.map { |cat| { type: 'category', name: cat.name, slug: cat.slug } }
    
    # Popular posts with similar words
    popular_posts = BlogPost.published
                           .where("title ILIKE ? OR excerpt ILIKE ?", "%#{query}%", "%#{query}%")
                           .order(views_count: :desc)
                           .limit(3)
    suggestions += popular_posts.map { |post| { type: 'post', name: post.title, slug: post.slug } }
    
    suggestions.first(5)
  end
end