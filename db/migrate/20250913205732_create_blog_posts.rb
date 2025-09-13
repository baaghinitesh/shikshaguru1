class CreateBlogPosts < ActiveRecord::Migration[7.2]
  def change
    create_table :blog_posts do |t|
      t.string :title
      t.string :slug
      t.text :content
      t.text :excerpt
      t.references :author, polymorphic: true, null: false
      t.string :status
      t.boolean :featured
      t.datetime :published_at
      t.string :meta_title
      t.text :meta_description
      t.string :meta_keywords
      t.string :og_image_url
      t.integer :reading_time
      t.integer :views_count

      t.timestamps
    end
  end
end
