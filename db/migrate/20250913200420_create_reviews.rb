class CreateReviews < ActiveRecord::Migration[7.2]
  def change
    create_table :reviews do |t|
      t.integer :reviewer_id, null: false
      t.integer :reviewee_id, null: false
      t.references :job_request, null: false, foreign_key: true
      t.integer :rating, null: false
      t.text :comment
      t.boolean :anonymous, default: false, null: false

      t.timestamps
    end
    add_index :reviews, :reviewer_id
    add_index :reviews, :reviewee_id
    add_foreign_key :reviews, :users, column: :reviewer_id
    add_foreign_key :reviews, :users, column: :reviewee_id
    add_index :reviews, [:reviewer_id, :reviewee_id, :job_request_id], unique: true, name: 'index_reviews_unique'
  end
end
