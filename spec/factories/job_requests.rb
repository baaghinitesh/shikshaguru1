FactoryBot.define do
  factory :job_request do
    user { nil }
    title { "MyString" }
    description { "MyText" }
    subject { "MyString" }
    level { "MyString" }
    budget_min { "9.99" }
    budget_max { "9.99" }
    preferred_location { "MyString" }
    online_sessions { false }
    in_person_sessions { false }
    duration { "MyString" }
    schedule_preference { "MyText" }
    status { "MyString" }
    expires_at { "2025-09-13 16:03:49" }
  end
end
