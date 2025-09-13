FactoryBot.define do
  factory :chat_room do
    name { "MyString" }
    job_request { nil }
    is_active { false }
  end
end
