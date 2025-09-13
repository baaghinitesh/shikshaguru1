class SearchService
  include ActiveModel::Model
  
  # Search parameters
  attr_accessor :query, :user_type, :subjects, :levels, :min_rate, :max_rate,
                :location, :max_distance, :online_only, :in_person_only,
                :experience_min, :rating_min, :page, :per_page, :sort_by
  
  # Location coordinates for distance calculations
  attr_accessor :latitude, :longitude
  
  # Search results
  attr_reader :users, :total_count, :filters_applied
  
  SORT_OPTIONS = {
    'relevance' => 'Relevance',
    'rating' => 'Highest Rated',
    'experience' => 'Most Experienced',
    'rate_low' => 'Lowest Rate',
    'rate_high' => 'Highest Rate',
    'distance' => 'Nearest First',
    'recent' => 'Recently Joined'
  }.freeze
  
  def initialize(attributes = {})
    super
    @page = (page || 1).to_i
    @per_page = (per_page || 20).to_i
    @sort_by = sort_by || 'relevance'
    @filters_applied = []
    @total_count = 0
  end
  
  def call
    @users = build_base_query
    apply_filters
    apply_sorting
    apply_pagination
    
    # Log search activity
    log_search_activity
    
    self
  end
  
  def has_results?
    @total_count > 0
  end
  
  def has_filters?
    @filters_applied.any?
  end
  
  def pagination_info
    {
      current_page: @page,
      per_page: @per_page,
      total_pages: (@total_count / @per_page.to_f).ceil,
      total_count: @total_count,
      has_next: @page < (@total_count / @per_page.to_f).ceil,
      has_prev: @page > 1
    }
  end
  
  private
  
  def build_base_query
    base = User.includes(:profile_picture_attachment, :received_reviews)
               .where(consent_for_display: true)
    
    # Filter by user type
    if user_type.present?
      base = base.where(role: user_type)
      @filters_applied << "Role: #{user_type.titleize}"
    end
    
    base
  end
  
  def apply_filters
    apply_text_search if query.present?
    apply_subject_filter if subjects.present?
    apply_level_filter if levels.present?
    apply_rate_filter if min_rate.present? || max_rate.present?
    apply_location_filter if location.present?
    apply_distance_filter if max_distance.present? && has_coordinates?
    apply_teaching_mode_filter
    apply_experience_filter if experience_min.present?
    apply_rating_filter if rating_min.present?
    
    @total_count = @users.count
  end
  
  def apply_text_search
    return unless query.present?
    
    search_query = "%#{query.downcase}%"
    @users = @users.where(
      "LOWER(name) LIKE ? OR LOWER(bio) LIKE ? OR LOWER(qualification) LIKE ? OR LOWER(preferred_subjects) LIKE ?",
      search_query, search_query, search_query, search_query
    )
    @filters_applied << "Search: \"#{query}\""
  end
  
  def apply_subject_filter
    return unless subjects.present?
    
    subject_conditions = subjects.map do |subject|
      "LOWER(preferred_subjects) LIKE ?"
    end.join(" OR ")
    
    subject_values = subjects.map { |s| "%#{s.downcase}%" }
    
    @users = @users.where(subject_conditions, *subject_values)
    @filters_applied << "Subjects: #{subjects.join(', ')}"
  end
  
  def apply_level_filter
    return unless levels.present?
    
    level_conditions = levels.map do |level|
      "LOWER(teaching_levels) LIKE ?"
    end.join(" OR ")
    
    level_values = levels.map { |l| "%#{l.downcase}%" }
    
    @users = @users.where(level_conditions, *level_values)
    @filters_applied << "Levels: #{levels.join(', ')}"
  end
  
  def apply_rate_filter
    conditions = []
    values = []
    
    if min_rate.present?
      conditions << "hourly_rate_min >= ?"
      values << min_rate.to_f
    end
    
    if max_rate.present?
      conditions << "hourly_rate_max <= ?"
      values << max_rate.to_f
    end
    
    if conditions.any?
      @users = @users.where(conditions.join(" AND "), *values)
      rate_text = []
      rate_text << "Min ₹#{min_rate}" if min_rate.present?
      rate_text << "Max ₹#{max_rate}" if max_rate.present?
      @filters_applied << "Rate: #{rate_text.join(', ')}"
    end
  end
  
  def apply_location_filter
    return unless location.present?
    
    @users = @users.where("LOWER(location) LIKE ?", "%#{location.downcase}%")
    @filters_applied << "Location: #{location}"
  end
  
  def apply_distance_filter
    return unless max_distance.present? && has_coordinates?
    
    # Using Haversine formula for distance calculation
    # This is a simplified version - in production, you'd use PostGIS or similar
    distance_sql = <<-SQL
      (6371 * acos(
        cos(radians(?)) * 
        cos(radians(latitude)) * 
        cos(radians(longitude) - radians(?)) + 
        sin(radians(?)) * 
        sin(radians(latitude))
      ))
    SQL
    
    @users = @users.where(
      "#{distance_sql} <= ?",
      latitude, longitude, latitude, max_distance.to_f
    )
    @filters_applied << "Within #{max_distance}km"
  end
  
  def apply_teaching_mode_filter
    conditions = []
    
    if online_only == '1' || online_only == true
      conditions << "online_teaching = true"
      @filters_applied << "Online Teaching"
    end
    
    if in_person_only == '1' || in_person_only == true
      conditions << "in_person_teaching = true"
      @filters_applied << "In-Person Teaching"
    end
    
    if conditions.any?
      @users = @users.where(conditions.join(" AND "))
    end
  end
  
  def apply_experience_filter
    return unless experience_min.present?
    
    @users = @users.where("experience_years >= ?", experience_min.to_i)
    @filters_applied << "Experience: #{experience_min}+ years"
  end
  
  def apply_rating_filter
    return unless rating_min.present?
    
    # Subquery to get users with average rating >= rating_min
    @users = @users.joins(:received_reviews)
                   .group('users.id')
                   .having('AVG(reviews.rating) >= ?', rating_min.to_f)
    @filters_applied << "Rating: #{rating_min}+ stars"
  end
  
  def apply_sorting
    case @sort_by
    when 'rating'
      @users = @users.left_joins(:received_reviews)
                     .group('users.id')
                     .order('AVG(reviews.rating) DESC NULLS LAST, users.created_at DESC')
    when 'experience'
      @users = @users.order('experience_years DESC NULLS LAST, created_at DESC')
    when 'rate_low'
      @users = @users.order('hourly_rate_min ASC NULLS LAST, created_at DESC')
    when 'rate_high'
      @users = @users.order('hourly_rate_max DESC NULLS LAST, created_at DESC')
    when 'distance'
      if has_coordinates?
        distance_sql = <<-SQL
          (6371 * acos(
            cos(radians(?)) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians(?)) + 
            sin(radians(?)) * 
            sin(radians(latitude))
          ))
        SQL
        @users = @users.order(Arel.sql("#{distance_sql} ASC"), latitude, longitude, latitude)
      else
        @users = @users.order('created_at DESC')
      end
    when 'recent'
      @users = @users.order('created_at DESC')
    else # relevance
      if query.present?
        # Simple relevance scoring based on text matches
        relevance_sql = <<-SQL
          (CASE 
            WHEN LOWER(name) LIKE ? THEN 100
            WHEN LOWER(preferred_subjects) LIKE ? THEN 80
            WHEN LOWER(qualification) LIKE ? THEN 60
            WHEN LOWER(bio) LIKE ? THEN 40
            ELSE 0
          END)
        SQL
        search_term = "%#{query.downcase}%"
        @users = @users.order(
          Arel.sql("#{relevance_sql} DESC"),
          search_term, search_term, search_term, search_term
        ).order('created_at DESC')
      else
        @users = @users.order('created_at DESC')
      end
    end
  end
  
  def apply_pagination
    @users = @users.page(@page).per(@per_page)
  end
  
  def has_coordinates?
    latitude.present? && longitude.present?
  end
  
  def log_search_activity
    LoggingService.app_logger.info({
      event: 'search_performed',
      query: query,
      user_type: user_type,
      filters_count: @filters_applied.length,
      results_count: @total_count,
      page: @page,
      sort_by: @sort_by,
      timestamp: Time.current.iso8601
    }.to_json)
  end
end