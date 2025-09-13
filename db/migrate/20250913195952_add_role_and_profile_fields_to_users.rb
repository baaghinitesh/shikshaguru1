class AddRoleAndProfileFieldsToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :role, :string, default: 'student', null: false
    add_column :users, :phone, :string
    add_column :users, :date_of_birth, :date
    add_column :users, :location, :string
    add_column :users, :bio, :text
    add_column :users, :profile_picture_url, :string
    add_column :users, :document_uploads, :text
    add_column :users, :consent_for_display, :boolean, default: false, null: false
  end
end
