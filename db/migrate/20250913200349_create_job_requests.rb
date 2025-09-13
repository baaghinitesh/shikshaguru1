class CreateJobRequests < ActiveRecord::Migration[7.2]
  def change
    create_table :job_requests do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description, null: false
      t.string :subject, null: false
      t.string :level, null: false
      t.decimal :budget_min, precision: 8, scale: 2
      t.decimal :budget_max, precision: 8, scale: 2
      t.string :preferred_location
      t.boolean :online_sessions, default: false, null: false
      t.boolean :in_person_sessions, default: false, null: false
      t.string :duration
      t.text :schedule_preference
      t.string :status, default: 'open', null: false
      t.datetime :expires_at

      t.timestamps
    end
  end
end
