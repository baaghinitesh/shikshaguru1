import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, UserProfile } from '../src/models/User';

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shikshaguru');

    // Skip clearing existing users to avoid auth issues
    console.log('Adding test users to existing database...');

    // Create test users
    const users = [
      // Test Teachers
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@shikshatest.com',
        password: await bcrypt.hash('Password123!', 12),
        role: 'teacher',
        isVerified: true,
        profile: {
          bio: 'PhD in Mathematics with 15+ years of teaching experience. Specialized in advanced calculus and linear algebra.',
          location: 'New York, NY',
          phone: '+1-555-0101',
          subjects: ['Mathematics', 'Calculus', 'Linear Algebra', 'Statistics'],
          experience: 15,
          education: 'PhD in Mathematics - MIT',
          hourlyRate: 85,
          availability: {
            monday: ['9:00 AM', '5:00 PM'],
            tuesday: ['9:00 AM', '5:00 PM'],
            wednesday: ['9:00 AM', '5:00 PM'],
            thursday: ['9:00 AM', '5:00 PM'],
            friday: ['9:00 AM', '3:00 PM']
          },
          rating: 4.9,
          totalReviews: 127,
          languages: ['English', 'Spanish'],
          teachingModes: ['online', 'offline'],
          qualifications: ['PhD Mathematics - MIT', 'MS Applied Mathematics - Stanford']
        }
      },
      {
        name: 'Prof. Michael Chen',
        email: 'michael.chen@shikshatest.com',
        password: await bcrypt.hash('Password123!', 12),
        role: 'teacher',
        isVerified: true,
        profile: {
          bio: 'Computer Science professor with expertise in web development, AI, and data structures. Former software engineer at Google.',
          location: 'San Francisco, CA',
          phone: '+1-555-0102',
          subjects: ['Computer Science', 'Web Development', 'Python', 'JavaScript', 'Data Structures'],
          experience: 12,
          education: 'PhD in Computer Science - Stanford',
          hourlyRate: 95,
          availability: {
            monday: ['10:00 AM', '6:00 PM'],
            tuesday: ['10:00 AM', '6:00 PM'],
            wednesday: ['2:00 PM', '8:00 PM'],
            thursday: ['10:00 AM', '6:00 PM'],
            friday: ['10:00 AM', '4:00 PM']
          },
          rating: 4.8,
          totalReviews: 89,
          languages: ['English', 'Mandarin'],
          teachingModes: ['online', 'offline'],
          qualifications: ['PhD Computer Science - Stanford', 'BS Engineering - UC Berkeley']
        }
      },
      {
        name: 'Emma Rodriguez',
        email: 'emma.rodriguez@shikshatest.com',
        password: await bcrypt.hash('Password123!', 12),
        role: 'teacher',
        isVerified: true,
        profile: {
          bio: 'Native Spanish speaker with Master\'s in Language Education. Specializing in conversational Spanish and business Spanish.',
          location: 'Miami, FL',
          phone: '+1-555-0103',
          subjects: ['Spanish', 'Language Learning', 'Business Spanish', 'DELE Preparation'],
          experience: 8,
          education: 'MA in Language Education - University of Miami',
          hourlyRate: 65,
          availability: {
            monday: ['8:00 AM', '4:00 PM'],
            tuesday: ['8:00 AM', '4:00 PM'],
            wednesday: ['8:00 AM', '4:00 PM'],
            thursday: ['8:00 AM', '4:00 PM'],
            friday: ['8:00 AM', '2:00 PM'],
            saturday: ['9:00 AM', '1:00 PM']
          },
          rating: 4.7,
          totalReviews: 156,
          languages: ['Spanish', 'English', 'Portuguese'],
          teachingModes: ['online', 'offline'],
          qualifications: ['MA Language Education', 'DELE Certified Teacher', 'TESOL Certification']
        }
      },
      {
        name: 'Dr. James Wilson',
        email: 'james.wilson@shikshatest.com',
        password: await bcrypt.hash('Password123!', 12),
        role: 'teacher',
        isVerified: true,
        profile: {
          bio: 'Physics researcher and educator with expertise in quantum mechanics and astrophysics. Published author with 50+ research papers.',
          location: 'Boston, MA',
          phone: '+1-555-0104',
          subjects: ['Physics', 'Quantum Mechanics', 'Astrophysics', 'Classical Mechanics'],
          experience: 20,
          education: 'PhD in Physics - Harvard University',
          hourlyRate: 90,
          availability: {
            tuesday: ['1:00 PM', '7:00 PM'],
            wednesday: ['1:00 PM', '7:00 PM'],
            thursday: ['1:00 PM', '7:00 PM'],
            saturday: ['10:00 AM', '4:00 PM']
          },
          rating: 4.9,
          totalReviews: 73,
          languages: ['English', 'German'],
          teachingModes: ['online', 'offline'],
          qualifications: ['PhD Physics - Harvard', 'MS Theoretical Physics - MIT']
        }
      },
      {
        name: 'Lisa Park',
        email: 'lisa.park@shikshatest.com',
        password: await bcrypt.hash('Password123!', 12),
        role: 'teacher',
        isVerified: true,
        profile: {
          bio: 'Creative writing and literature expert with MFA from Columbia. Published novelist and experienced writing coach.',
          location: 'Chicago, IL',
          phone: '+1-555-0105',
          subjects: ['English Literature', 'Creative Writing', 'Essay Writing', 'SAT Prep'],
          experience: 10,
          education: 'MFA Creative Writing - Columbia University',
          hourlyRate: 70,
          availability: {
            monday: ['9:00 AM', '3:00 PM'],
            tuesday: ['9:00 AM', '3:00 PM'],
            wednesday: ['9:00 AM', '3:00 PM'],
            friday: ['9:00 AM', '3:00 PM'],
            saturday: ['10:00 AM', '2:00 PM']
          },
          rating: 4.8,
          totalReviews: 92,
          languages: ['English', 'Korean'],
          teachingModes: ['online', 'offline'],
          qualifications: ['MFA Creative Writing - Columbia', 'BA English Literature - Northwestern']
        }
      },
      
      // Test Students
      {
        name: 'Alex Thompson',
        email: 'alex.thompson@shikshatest.com',
        password: await bcrypt.hash('Password123!', 12),
        role: 'student',
        isVerified: true,
        profile: {
          bio: 'High school senior preparing for college entrance exams. Need help with advanced mathematics and physics.',
          location: 'Austin, TX',
          phone: '+1-555-0201',
          subjects: ['Mathematics', 'Physics', 'SAT Prep'],
          grade: '12th Grade',
          institution: 'Austin High School',
          goals: ['College Preparation', 'SAT Improvement', 'Advanced Math']
        }
      },
      {
        name: 'Maria Garcia',
        email: 'maria.garcia@shikshatest.com',
        password: await bcrypt.hash('Password123!', 12),
        role: 'student',
        isVerified: true,
        profile: {
          bio: 'Computer Science undergraduate looking for help with data structures and algorithms for technical interviews.',
          location: 'Seattle, WA',
          phone: '+1-555-0202',
          subjects: ['Computer Science', 'Data Structures', 'Algorithms', 'Python'],
          grade: 'Undergraduate',
          institution: 'University of Washington',
          goals: ['Technical Interview Prep', 'Algorithm Mastery', 'Career Development']
        }
      },
      {
        name: 'David Kim',
        email: 'david.kim@shikshatest.com',
        password: await bcrypt.hash('Password123!', 12),
        role: 'student',
        isVerified: true,
        profile: {
          bio: 'Working professional looking to improve Spanish skills for career advancement in international business.',
          location: 'Los Angeles, CA',
          phone: '+1-555-0203',
          subjects: ['Spanish', 'Business Spanish', 'Conversational Spanish'],
          grade: 'Professional',
          institution: 'Working Professional',
          goals: ['Business Communication', 'Fluency', 'Career Advancement']
        }
      },

      // Test Institution
      {
        name: 'Bright Minds Academy',
        email: 'admin@brightminds.edu',
        password: await bcrypt.hash('Password123!', 12),
        role: 'admin', // Using admin instead of institution since role enum doesn't include institution
        isVerified: true,
        profile: {
          bio: 'Premier educational institution offering comprehensive tutoring services across all subjects and grade levels.',
          location: 'Multiple Locations - New York, NY',
          phone: '+1-555-0301',
          website: 'https://brightminds.edu',
          subjects: ['All Subjects', 'K-12', 'Test Prep', 'College Counseling'],
          established: '2010',
          totalTeachers: 45,
          totalStudents: 1200,
          accreditation: ['NEASC', 'College Board Approved'],
          services: ['Individual Tutoring', 'Group Classes', 'Test Preparation', 'College Counseling']
        }
      }
    ];

    // Create users and profiles separately
    const createdUsers = [];
    
    for (const userData of users) {
      // Extract profile data
      const profileData = userData.profile;
      delete (userData as any).profile;
      
      // Create the user first
      const user = await User.create(userData);
      
      // If there's profile data, create the profile
      if (profileData) {
        const profile = await UserProfile.create({
          userId: user._id,
          ...profileData
        });
        
        // Update user with profile reference
        user.profile = profile._id as any;
        await user.save();
      }
      
      createdUsers.push(user);
    }
    console.log(`✅ Created ${createdUsers.length} test users successfully!`);
    
    // Display created users for reference
    console.log('\\n📋 Test Users Created:');
    console.log('=======================');
    
    console.log('\\n👨‍🏫 TEACHERS:');
    createdUsers.filter(user => user.role === 'teacher').forEach(user => {
      console.log(`📧 ${user.email} | ${user.name} | ${user.profile?.subjects?.join(', ')}`);
    });
    
    console.log('\\n👨‍🎓 STUDENTS:');
    createdUsers.filter(user => user.role === 'student').forEach(user => {
      console.log(`📧 ${user.email} | ${user.name} | ${user.profile?.subjects?.join(', ')}`);
    });
    
    console.log('\\n🏫 INSTITUTIONS:');
    createdUsers.filter(user => user.role === 'admin').forEach(user => {
      console.log(`📧 ${user.email} | ${user.name}`);
    });
    
    console.log('\\n🔐 All passwords: Password123!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
  }
};

export default seedUsers;

// Run if called directly
if (require.main === module) {
  seedUsers();
}