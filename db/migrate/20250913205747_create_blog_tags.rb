class CreateBlogTags < ActiveRecord::Migration[7.2]
  def change
    create_table :blog_tags do |t|
      t.string :name
      t.string :slug

      t.timestamps
    end
  end
end
