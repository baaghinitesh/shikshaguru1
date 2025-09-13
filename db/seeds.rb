# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# IMPORTANT: Do NOT add Administrator data here!
# Administrator accounts should be created manually or through separate admin setup commands.
# This seeds file is only for application data (products, categories, etc.)

# Create super admin user for ShikshaGuru
User.find_or_create_by(email: 'baaghinitesh@gmail.com') do |user|
  user.name = 'Nitesh Baaghi'
  user.password = 'nitesh123'
  user.role = 'admin'
  user.verified = true
  user.consent_for_display = false
end

puts "Seeded super admin: baaghinitesh@gmail.com / nitesh123"
