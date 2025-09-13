class CreateBlogPostTags < ActiveRecord::Migration[7.2]
  def change
    create_table :blog_post_tags do |t|
      t.references :blog_post, null: false, foreign_key: true
      t.references :blog_tag, null: false, foreign_key: true

      t.timestamps
    end
  end
end
