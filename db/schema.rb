# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2025_09_13_211327) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "administrators", force: :cascade do |t|
    t.string "name", null: false
    t.string "password_digest"
    t.string "role", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_administrators_on_name", unique: true
    t.index ["role"], name: "index_administrators_on_role"
  end

  create_table "ai_chat_conversations", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title"
    t.text "context"
    t.string "status", default: "active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_ai_chat_conversations_on_user_id"
  end

  create_table "ai_chat_messages", force: :cascade do |t|
    t.bigint "ai_chat_conversation_id", null: false
    t.string "role", null: false
    t.text "content", null: false
    t.datetime "timestamp", default: -> { "CURRENT_TIMESTAMP" }
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ai_chat_conversation_id", "timestamp"], name: "idx_on_ai_chat_conversation_id_timestamp_abaab114b2"
    t.index ["ai_chat_conversation_id"], name: "index_ai_chat_messages_on_ai_chat_conversation_id"
    t.index ["role"], name: "index_ai_chat_messages_on_role"
  end

  create_table "blog_categories", force: :cascade do |t|
    t.string "name"
    t.string "slug"
    t.text "description"
    t.string "color"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "blog_post_categories", force: :cascade do |t|
    t.bigint "blog_post_id", null: false
    t.bigint "blog_category_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["blog_category_id"], name: "index_blog_post_categories_on_blog_category_id"
    t.index ["blog_post_id"], name: "index_blog_post_categories_on_blog_post_id"
  end

  create_table "blog_post_tags", force: :cascade do |t|
    t.bigint "blog_post_id", null: false
    t.bigint "blog_tag_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["blog_post_id"], name: "index_blog_post_tags_on_blog_post_id"
    t.index ["blog_tag_id"], name: "index_blog_post_tags_on_blog_tag_id"
  end

  create_table "blog_posts", force: :cascade do |t|
    t.string "title"
    t.string "slug"
    t.text "content"
    t.text "excerpt"
    t.string "author_type", null: false
    t.bigint "author_id", null: false
    t.string "status"
    t.boolean "featured"
    t.datetime "published_at"
    t.string "meta_title"
    t.text "meta_description"
    t.string "meta_keywords"
    t.string "og_image_url"
    t.integer "reading_time"
    t.integer "views_count"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_type", "author_id"], name: "index_blog_posts_on_author"
  end

  create_table "blog_tags", force: :cascade do |t|
    t.string "name"
    t.string "slug"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "chat_room_participants", force: :cascade do |t|
    t.bigint "chat_room_id", null: false
    t.bigint "user_id", null: false
    t.datetime "joined_at", null: false
    t.datetime "last_read_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chat_room_id", "user_id"], name: "index_chat_room_participants_on_chat_room_id_and_user_id", unique: true
    t.index ["chat_room_id"], name: "index_chat_room_participants_on_chat_room_id"
    t.index ["user_id"], name: "index_chat_room_participants_on_user_id"
  end

  create_table "chat_rooms", force: :cascade do |t|
    t.string "name", null: false
    t.bigint "job_request_id", null: false
    t.boolean "is_active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["job_request_id"], name: "index_chat_rooms_on_job_request_id"
  end

  create_table "good_job_batches", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "description"
    t.jsonb "serialized_properties"
    t.text "on_finish"
    t.text "on_success"
    t.text "on_discard"
    t.text "callback_queue_name"
    t.integer "callback_priority"
    t.datetime "enqueued_at"
    t.datetime "discarded_at"
    t.datetime "finished_at"
    t.datetime "jobs_finished_at"
  end

  create_table "good_job_executions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "active_job_id", null: false
    t.text "job_class"
    t.text "queue_name"
    t.jsonb "serialized_params"
    t.datetime "scheduled_at"
    t.datetime "finished_at"
    t.text "error"
    t.integer "error_event", limit: 2
    t.text "error_backtrace", array: true
    t.uuid "process_id"
    t.interval "duration"
    t.index ["active_job_id", "created_at"], name: "index_good_job_executions_on_active_job_id_and_created_at"
    t.index ["process_id", "created_at"], name: "index_good_job_executions_on_process_id_and_created_at"
  end

  create_table "good_job_processes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "state"
    t.integer "lock_type", limit: 2
  end

  create_table "good_job_settings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "key"
    t.jsonb "value"
    t.index ["key"], name: "index_good_job_settings_on_key", unique: true
  end

  create_table "good_jobs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "queue_name"
    t.integer "priority"
    t.jsonb "serialized_params"
    t.datetime "scheduled_at"
    t.datetime "performed_at"
    t.datetime "finished_at"
    t.text "error"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "active_job_id"
    t.text "concurrency_key"
    t.text "cron_key"
    t.uuid "retried_good_job_id"
    t.datetime "cron_at"
    t.uuid "batch_id"
    t.uuid "batch_callback_id"
    t.boolean "is_discrete"
    t.integer "executions_count"
    t.text "job_class"
    t.integer "error_event", limit: 2
    t.text "labels", array: true
    t.uuid "locked_by_id"
    t.datetime "locked_at"
    t.index ["active_job_id", "created_at"], name: "index_good_jobs_on_active_job_id_and_created_at"
    t.index ["batch_callback_id"], name: "index_good_jobs_on_batch_callback_id", where: "(batch_callback_id IS NOT NULL)"
    t.index ["batch_id"], name: "index_good_jobs_on_batch_id", where: "(batch_id IS NOT NULL)"
    t.index ["concurrency_key", "created_at"], name: "index_good_jobs_on_concurrency_key_and_created_at"
    t.index ["concurrency_key"], name: "index_good_jobs_on_concurrency_key_when_unfinished", where: "(finished_at IS NULL)"
    t.index ["cron_key", "created_at"], name: "index_good_jobs_on_cron_key_and_created_at_cond", where: "(cron_key IS NOT NULL)"
    t.index ["cron_key", "cron_at"], name: "index_good_jobs_on_cron_key_and_cron_at_cond", unique: true, where: "(cron_key IS NOT NULL)"
    t.index ["finished_at"], name: "index_good_jobs_jobs_on_finished_at", where: "((retried_good_job_id IS NULL) AND (finished_at IS NOT NULL))"
    t.index ["labels"], name: "index_good_jobs_on_labels", where: "(labels IS NOT NULL)", using: :gin
    t.index ["locked_by_id"], name: "index_good_jobs_on_locked_by_id", where: "(locked_by_id IS NOT NULL)"
    t.index ["priority", "created_at"], name: "index_good_job_jobs_for_candidate_lookup", where: "(finished_at IS NULL)"
    t.index ["priority", "created_at"], name: "index_good_jobs_jobs_on_priority_created_at_when_unfinished", order: { priority: "DESC NULLS LAST" }, where: "(finished_at IS NULL)"
    t.index ["priority", "scheduled_at"], name: "index_good_jobs_on_priority_scheduled_at_unfinished_unlocked", where: "((finished_at IS NULL) AND (locked_by_id IS NULL))"
    t.index ["queue_name", "scheduled_at"], name: "index_good_jobs_on_queue_name_and_scheduled_at", where: "(finished_at IS NULL)"
    t.index ["scheduled_at"], name: "index_good_jobs_on_scheduled_at", where: "(finished_at IS NULL)"
  end

  create_table "job_applications", force: :cascade do |t|
    t.bigint "job_request_id", null: false
    t.bigint "user_id", null: false
    t.text "message", null: false
    t.decimal "proposed_rate", precision: 8, scale: 2
    t.string "status", default: "pending", null: false
    t.datetime "applied_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["job_request_id", "user_id"], name: "index_job_applications_on_job_request_id_and_user_id", unique: true
    t.index ["job_request_id"], name: "index_job_applications_on_job_request_id"
    t.index ["user_id"], name: "index_job_applications_on_user_id"
  end

  create_table "job_requests", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title", null: false
    t.text "description", null: false
    t.string "subject", null: false
    t.string "level", null: false
    t.decimal "budget_min", precision: 8, scale: 2
    t.decimal "budget_max", precision: 8, scale: 2
    t.string "preferred_location"
    t.boolean "online_sessions", default: false, null: false
    t.boolean "in_person_sessions", default: false, null: false
    t.string "duration"
    t.text "schedule_preference"
    t.string "status", default: "open", null: false
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_job_requests_on_user_id"
  end

  create_table "messages", force: :cascade do |t|
    t.bigint "chat_room_id", null: false
    t.bigint "user_id", null: false
    t.text "content", null: false
    t.string "message_type", default: "text", null: false
    t.datetime "read_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chat_room_id", "created_at"], name: "index_messages_on_chat_room_id_and_created_at"
    t.index ["chat_room_id"], name: "index_messages_on_chat_room_id"
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "posts", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "title"
    t.text "content"
    t.boolean "published"
    t.string "slug"
  end

  create_table "products", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.decimal "price"
    t.boolean "active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "reviews", force: :cascade do |t|
    t.integer "reviewer_id", null: false
    t.integer "reviewee_id", null: false
    t.bigint "job_request_id", null: false
    t.integer "rating", null: false
    t.text "comment"
    t.boolean "anonymous", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["job_request_id"], name: "index_reviews_on_job_request_id"
    t.index ["reviewee_id"], name: "index_reviews_on_reviewee_id"
    t.index ["reviewer_id", "reviewee_id", "job_request_id"], name: "index_reviews_unique", unique: true
    t.index ["reviewer_id"], name: "index_reviews_on_reviewer_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "user_agent"
    t.string "ip_address"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "test_models", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "email", null: false
    t.string "password_digest"
    t.boolean "verified", default: false, null: false
    t.string "provider"
    t.string "uid"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "role", default: "student", null: false
    t.string "phone"
    t.date "date_of_birth"
    t.string "location"
    t.text "bio"
    t.string "profile_picture_url"
    t.text "document_uploads"
    t.boolean "consent_for_display", default: false, null: false
    t.decimal "latitude", precision: 10, scale: 6
    t.decimal "longitude", precision: 10, scale: 6
    t.string "theme_preference"
    t.string "accent_color_preference"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["latitude", "longitude"], name: "index_users_on_coordinates"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "ai_chat_conversations", "users"
  add_foreign_key "ai_chat_messages", "ai_chat_conversations"
  add_foreign_key "blog_post_categories", "blog_categories"
  add_foreign_key "blog_post_categories", "blog_posts"
  add_foreign_key "blog_post_tags", "blog_posts"
  add_foreign_key "blog_post_tags", "blog_tags"
  add_foreign_key "chat_room_participants", "chat_rooms"
  add_foreign_key "chat_room_participants", "users"
  add_foreign_key "chat_rooms", "job_requests"
  add_foreign_key "job_applications", "job_requests"
  add_foreign_key "job_applications", "users"
  add_foreign_key "job_requests", "users"
  add_foreign_key "messages", "chat_rooms"
  add_foreign_key "messages", "users"
  add_foreign_key "reviews", "job_requests"
  add_foreign_key "reviews", "users", column: "reviewee_id"
  add_foreign_key "reviews", "users", column: "reviewer_id"
  add_foreign_key "sessions", "users"
end
