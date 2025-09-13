class AddThemePreferencesToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :theme_preference, :string
    add_column :users, :accent_color_preference, :string
  end
end
