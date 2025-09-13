class CreateJobApplications < ActiveRecord::Migration[7.2]
  def change
    create_table :job_applications do |t|
      t.references :job_request, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.text :message, null: false
      t.decimal :proposed_rate, precision: 8, scale: 2
      t.string :status, default: 'pending', null: false
      t.datetime :applied_at, null: false

      t.timestamps
    end
    
    add_index :job_applications, [:job_request_id, :user_id], unique: true
  end
end
