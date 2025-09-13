class AddCoordinatesToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :latitude, :decimal, precision: 10, scale: 6
    add_column :users, :longitude, :decimal, precision: 10, scale: 6
    
    add_index :users, [:latitude, :longitude], name: 'index_users_on_coordinates'
  end
end
