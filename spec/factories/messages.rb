FactoryBot.define do
  factory :message do
    chat_room { nil }
    user { nil }
    content { "MyText" }
    message_type { "MyString" }
    read_at { "2025-09-13 16:16:25" }
  end
end
