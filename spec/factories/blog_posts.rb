FactoryBot.define do
  factory :blog_post do
    title { "MyString" }
    slug { "MyString" }
    content { "MyText" }
    excerpt { "MyText" }
    author { nil }
    status { "MyString" }
    featured { false }
    published_at { "2025-09-13 16:57:33" }
    meta_title { "MyString" }
    meta_description { "MyText" }
    meta_keywords { "MyString" }
    og_image_url { "MyString" }
    reading_time { 1 }
    views_count { 1 }
  end
end
