class ProfilesController < ApplicationController
  before_action :authenticate

  def show
    @user = current_user
  end

  def edit
    @user = current_user
  end

  def update
    @user = current_user

    if @user.update(user_params)
      redirect_to profile_path, notice: "Profile updated"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def edit_password
    @user = current_user
  end

  def update_password
    @user = current_user

    unless @user.authenticate(params[:current_password])
      flash.now[:alert] = "Password not correct"
      render :edit_password, status: :unprocessable_entity
      return
    end

    if @user.update(password_params)
      redirect_to profile_path, notice: "Password updated"
    else
      render :edit_password, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(
      :name, :email, :role, :phone, :location, :bio, :experience_years,
      :hourly_rate_min, :hourly_rate_max, :preferred_subjects, :teaching_levels,
      :online_teaching, :in_person_teaching, :availability,
      :qualification, :specialization, :institute_name, :website_url,
      :consent_data_usage, :consent_profile_display, :marketing_emails
    )
  end

  def password_params
    params.require(:user).permit(:password, :password_confirmation)
  end
end
