class CreateAiChatConversations < ActiveRecord::Migration[7.2]
  def change
    create_table :ai_chat_conversations do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title
      t.text :context
      t.string :status, default: 'active'

      t.timestamps
    end
  end
end
