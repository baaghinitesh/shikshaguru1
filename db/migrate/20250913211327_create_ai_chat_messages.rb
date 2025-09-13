class CreateAiChatMessages < ActiveRecord::Migration[7.2]
  def change
    create_table :ai_chat_messages do |t|
      t.references :ai_chat_conversation, null: false, foreign_key: true
      t.string :role, null: false # 'user' or 'assistant'
      t.text :content, null: false
      t.datetime :timestamp, default: -> { 'CURRENT_TIMESTAMP' }

      t.timestamps
    end
    
    add_index :ai_chat_messages, [:ai_chat_conversation_id, :timestamp]
    add_index :ai_chat_messages, :role
  end
end
