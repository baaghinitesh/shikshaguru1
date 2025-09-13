class CreateBlogCategories < ActiveRecord::Migration[7.2]
  def change
    create_table :blog_categories do |t|
      t.string :name
      t.string :slug
      t.text :description
      t.string :color

      t.timestamps
    end
  end
end
