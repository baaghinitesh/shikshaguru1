class CreateMessages < ActiveRecord::Migration[7.2]
  def change
    create_table :messages do |t|
      t.references :chat_room, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.text :content, null: false
      t.string :message_type, default: 'text', null: false
      t.datetime :read_at

      t.timestamps
    end
    
    add_index :messages, [:chat_room_id, :created_at]
  end
end
