class CreateChatRooms < ActiveRecord::Migration[7.2]
  def change
    create_table :chat_rooms do |t|
      t.string :name, null: false
      t.references :job_request, null: false, foreign_key: true
      t.boolean :is_active, default: true, null: false

      t.timestamps
    end
  end
end
