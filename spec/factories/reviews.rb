FactoryBot.define do
  factory :review do
    reviewer_id { 1 }
    reviewee_id { 1 }
    job_request { nil }
    rating { 1 }
    comment { "MyText" }
    anonymous { false }
  end
end
