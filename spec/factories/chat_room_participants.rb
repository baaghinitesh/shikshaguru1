FactoryBot.define do
  factory :chat_room_participant do
    chat_room { nil }
    user { nil }
    joined_at { "2025-09-13 16:16:33" }
    last_read_at { "2025-09-13 16:16:33" }
  end
end
