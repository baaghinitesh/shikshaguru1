class SearchController < ApplicationController
  before_action :set_search_params
  before_action :geocode_location, if: -> { @search_params[:location].present? }
  
  def index
    @search_service = SearchService.new(@search_params)
    @search_service.call
    
    @users = @search_service.users
    @pagination = @search_service.pagination_info
    @filters_applied = @search_service.filters_applied
    @total_count = @search_service.total_count
    
    # For the search form
    @available_subjects = JobRequest::SUBJECTS
    @available_levels = JobRequest::LEVELS
    @sort_options = SearchService::SORT_OPTIONS
    
    respond_to do |format|
      format.html
      format.json {
        render json: {
          users: @users.map { |user| user_search_result(user) },
          pagination: @pagination,
          filters_applied: @filters_applied,
          total_count: @total_count
        }
      }
    end
  end
  
  def suggestions
    # AJAX endpoint for search suggestions
    query = params[:q]&.strip
    return render json: [] if query.blank? || query.length < 2
    
    suggestions = []
    
    # Subject suggestions
    matching_subjects = JobRequest::SUBJECTS.select do |subject|
      subject.downcase.include?(query.downcase)
    end
    suggestions += matching_subjects.first(5).map { |s| { type: 'subject', value: s, label: s.titleize } }
    
    # User name suggestions
    matching_users = User.where(consent_for_display: true)
                        .where("LOWER(name) LIKE ?", "%#{query.downcase}%")
                        .limit(5)
                        .pluck(:name, :role)
    matching_users.each do |name, role|
      suggestions << { type: 'user', value: name, label: "#{name} (#{role.titleize})" }
    end
    
    # Location suggestions (simplified - in production you'd use a geocoding service)
    if query.length >= 3
      location_suggestions = User.where(consent_for_display: true)
                               .where("LOWER(location) LIKE ?", "%#{query.downcase}%")
                               .distinct
                               .limit(3)
                               .pluck(:location)
                               .compact
      location_suggestions.each do |location|
        suggestions << { type: 'location', value: location, label: location }
      end
    end
    
    render json: suggestions.first(10)
  end
  
  private
  
  def set_search_params
    @search_params = {
      query: params[:q],
      user_type: params[:user_type],
      subjects: params[:subjects]&.reject(&:blank?),
      levels: params[:levels]&.reject(&:blank?),
      min_rate: params[:min_rate],
      max_rate: params[:max_rate],
      location: params[:location],
      max_distance: params[:max_distance],
      online_only: params[:online_only],
      in_person_only: params[:in_person_only],
      experience_min: params[:experience_min],
      rating_min: params[:rating_min],
      page: params[:page],
      per_page: params[:per_page],
      sort_by: params[:sort_by]
    }.compact
  end
  
  def geocode_location
    # In a real application, you'd use a geocoding service like Google Maps API
    # For now, we'll use some mock coordinates for major Indian cities
    coordinates = city_coordinates(@search_params[:location])
    
    if coordinates
      @search_params[:latitude] = coordinates[:lat]
      @search_params[:longitude] = coordinates[:lng]
    end
  end
  
  def city_coordinates(location)
    # Mock coordinates for major Indian cities
    # In production, use Google Geocoding API or similar
    coordinates_map = {
      'mumbai' => { lat: 19.0760, lng: 72.8777 },
      'delhi' => { lat: 28.7041, lng: 77.1025 },
      'bangalore' => { lat: 12.9716, lng: 77.5946 },
      'hyderabad' => { lat: 17.3850, lng: 78.4867 },
      'chennai' => { lat: 13.0827, lng: 80.2707 },
      'kolkata' => { lat: 22.5726, lng: 88.3639 },
      'pune' => { lat: 18.5204, lng: 73.8567 },
      'ahmedabad' => { lat: 23.0225, lng: 72.5714 },
      'jaipur' => { lat: 26.9124, lng: 75.7873 },
      'lucknow' => { lat: 26.8467, lng: 80.9462 }
    }
    
    city_key = location.downcase.strip
    coordinates_map[city_key] || coordinates_map.find { |k, v| k.include?(city_key) }&.last
  end
  
  def user_search_result(user)
    {
      id: user.id,
      name: user.name,
      role: user.role.titleize,
      location: user.location,
      bio: user.bio&.truncate(150),
      experience_years: user.experience_years,
      hourly_rate_range: user.teacher? ? "₹#{user.hourly_rate_min}-#{user.hourly_rate_max}" : nil,
      subjects: user.preferred_subjects&.split(',')&.map(&:strip)&.first(3),
      average_rating: user.average_rating,
      total_reviews: user.total_reviews,
      profile_picture_url: user.profile_picture.attached? ? 
        url_for(user.profile_picture.variant(resize_to_fill: [100, 100, { gravity: 'center' }])) : nil,
      online_teaching: user.online_teaching,
      in_person_teaching: user.in_person_teaching,
      profile_url: user_path(user) # Assuming you have user show routes
    }
  end
end
