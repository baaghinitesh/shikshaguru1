FactoryBot.define do
  factory :job_application do
    job_request { nil }
    user { nil }
    message { "MyText" }
    proposed_rate { "9.99" }
    status { "MyString" }
    applied_at { "2025-09-13 16:03:57" }
  end
end
