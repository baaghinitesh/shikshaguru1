import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Star, MapPin, Clock, Globe, Award, Book, 
  MessageCircle, Heart, Calendar, CheckCircle, GraduationCap,
  Target, TrendingUp, Video, Home, Shield
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Tutor {
  id: string;
  name: string;
  avatar: string;
  subjects: string[];
  bio: string;
  location: string;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  experience: number;
  languages: string[];
  teachingModes: string[];
  qualifications: string[];
  availability: string;
  specialties?: string[];
  achievements?: string[];
  teachingPhilosophy?: string;
  responseTime?: string;
  completedLessons?: number;
  studentsSatisfaction?: number;
}

// Mock data - in real app, this would come from API
const mockTutors: Tutor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=3b82f6&color=ffffff&size=200',
    subjects: ['Mathematics', 'Calculus', 'Linear Algebra', 'Statistics', 'Advanced Mathematics', 'Discrete Mathematics'],
    bio: 'PhD in Mathematics with 15+ years of teaching experience. Specialized in advanced calculus and linear algebra. I have taught at prestigious universities and helped hundreds of students achieve their academic goals.',
    location: 'New York, NY',
    rating: 4.9,
    totalReviews: 127,
    hourlyRate: 85,
    experience: 15,
    languages: ['English', 'Spanish', 'French'],
    teachingModes: ['online', 'offline'],
    qualifications: [
      'PhD in Mathematics - Massachusetts Institute of Technology (MIT)',
      'MS in Applied Mathematics - Stanford University',
      'BS in Mathematics - Harvard University',
      'Certified Mathematics Instructor (CMI)'
    ],
    availability: 'Available Monday to Friday, 9 AM - 8 PM EST',
    specialties: [
      'Advanced Calculus & Analysis',
      'Linear Algebra & Matrix Theory',
      'Statistics & Probability',
      'Mathematical Modeling',
      'Research Methods in Mathematics'
    ],
    achievements: [
      'Published 25+ research papers in peer-reviewed journals',
      'Winner of Excellence in Teaching Award 2019, 2021',
      'Supervised 50+ graduate thesis projects',
      'Guest lecturer at 15+ international conferences'
    ],
    teachingPhilosophy: 'I believe mathematics is not just about formulas and calculations, but about developing logical thinking and problem-solving skills. My approach focuses on building strong foundations while encouraging students to explore mathematical concepts creatively.',
    responseTime: 'Usually responds within 2 hours',
    completedLessons: 1200,
    studentsSatisfaction: 98
  },
  {
    id: '2',
    name: 'Prof. Michael Chen',
    avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=ffffff&size=200',
    subjects: ['Computer Science', 'Web Development', 'Python', 'JavaScript', 'Data Structures', 'Algorithms'],
    bio: 'Computer Science professor with expertise in web development, AI, and data structures. Former software engineer at Google with a passion for teaching the next generation of developers.',
    location: 'San Francisco, CA',
    rating: 4.8,
    totalReviews: 89,
    hourlyRate: 95,
    experience: 12,
    languages: ['English', 'Mandarin', 'Cantonese'],
    teachingModes: ['online', 'offline'],
    qualifications: [
      'PhD in Computer Science - Stanford University',
      'MS in Software Engineering - Carnegie Mellon University',
      'BS in Computer Engineering - UC Berkeley',
      'Google Cloud Professional Developer Certification'
    ],
    availability: 'Available Monday to Friday, 10 AM - 9 PM PST',
    specialties: [
      'Full-Stack Web Development',
      'Python Programming & Flask/Django',
      'JavaScript & React/Node.js',
      'Data Structures & Algorithms',
      'Machine Learning Fundamentals'
    ],
    achievements: [
      'Former Senior Software Engineer at Google (5 years)',
      'Published author: "Modern Web Development Practices"',
      'Creator of popular programming tutorial series (100k+ students)',
      'Winner of Best Instructor Award - Tech Education Conference 2020'
    ],
    teachingPhilosophy: 'Programming is both an art and a science. I focus on teaching not just the syntax, but the thinking patterns and best practices that make great developers. Every student learns differently, so I adapt my teaching style to match their learning preferences.',
    responseTime: 'Usually responds within 1 hour',
    completedLessons: 850,
    studentsSatisfaction: 96
  }
];

const TutorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isFavorited, setIsFavorited] = useState(false);

  // Find tutor by ID
  const tutor = mockTutors.find(t => t.id === id);

  if (!tutor) {
    return (
      <div className="min-h-screen bg-theme-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-theme-text mb-4">Tutor Not Found</h1>
            <Button onClick={() => navigate('/tutors')}>Back to Tutors</Button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'qualifications', label: 'Qualifications', icon: GraduationCap },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'schedule', label: 'Schedule', icon: Calendar }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/tutors')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tutors
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tutor Header Card */}
            <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
              <div className="flex gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={tutor.avatar}
                      alt={tutor.name}
                      className="w-32 h-32 rounded-2xl object-cover ring-4 ring-white dark:ring-gray-700 shadow-xl"
                    />
                    {/* Online Status */}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {tutor.name}
                      </h1>
                      <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-5 h-5 text-primary-500" />
                          <span>{tutor.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-5 h-5 text-primary-500" />
                          <span>{tutor.responseTime}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsFavorited(!isFavorited)}
                      className={`p-2 rounded-full transition-colors ${
                        isFavorited 
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-6 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-bold text-gray-900 dark:text-white">{tutor.rating}</span>
                      </div>
                      <div className="text-sm text-gray-500">{tutor.totalReviews} reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-primary-500 mb-1">
                        <Award className="w-5 h-5" />
                        <span className="font-bold text-gray-900 dark:text-white">{tutor.experience}</span>
                      </div>
                      <div className="text-sm text-gray-500">Years exp</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-bold text-gray-900 dark:text-white">{tutor.completedLessons}</span>
                      </div>
                      <div className="text-sm text-gray-500">Lessons</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-bold text-gray-900 dark:text-white">{tutor.studentsSatisfaction}%</span>
                      </div>
                      <div className="text-sm text-gray-500">Satisfaction</div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {tutor.bio}
                  </p>
                </div>
              </div>
            </Card>

            {/* Navigation Tabs */}
            <Card className="p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="flex">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        selectedTab === tab.id
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Tab Content */}
            <div className="space-y-6">
              {selectedTab === 'overview' && (
                <div className="space-y-6">
                  {/* Subjects */}
                  <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Book className="w-5 h-5 text-primary-500" />
                      Subjects I Teach
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {tutor.subjects.map((subject, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg border border-primary-200 dark:border-primary-700"
                        >
                          <Target className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
                            {subject}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Specialties */}
                  {tutor.specialties && (
                    <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary-500" />
                        My Specialties
                      </h3>
                      <div className="space-y-3">
                        {tutor.specialties.map((specialty, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-primary-500 rounded-full" />
                            <span className="text-gray-700 dark:text-gray-300">{specialty}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Teaching Philosophy */}
                  {tutor.teachingPhilosophy && (
                    <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-primary-500" />
                        My Teaching Philosophy
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
                        "{tutor.teachingPhilosophy}"
                      </p>
                    </Card>
                  )}
                </div>
              )}

              {selectedTab === 'qualifications' && (
                <div className="space-y-6">
                  {/* Education */}
                  <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary-500" />
                      Education & Certifications
                    </h3>
                    <div className="space-y-4">
                      {tutor.qualifications.map((qualification, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700"
                        >
                          <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" />
                          <span className="text-green-800 dark:text-green-200 font-medium">
                            {qualification}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Achievements */}
                  {tutor.achievements && (
                    <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary-500" />
                        Key Achievements
                      </h3>
                      <div className="space-y-4">
                        {tutor.achievements.map((achievement, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700"
                          >
                            <CheckCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                            <span className="text-yellow-800 dark:text-yellow-200">
                              {achievement}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Languages */}
                  <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary-500" />
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {tutor.languages.map((language, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full border border-blue-200 dark:border-blue-700"
                        >
                          <Globe className="w-4 h-4" />
                          {language}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {selectedTab === 'reviews' && (
                <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Reviews Coming Soon
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Review system will be implemented in the next update.
                  </p>
                </Card>
              )}

              {selectedTab === 'schedule' && (
                <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-500" />
                    Availability
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="font-medium text-green-800 dark:text-green-200">
                          Current Availability
                        </span>
                      </div>
                      <p className="text-green-700 dark:text-green-300">{tutor.availability}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-blue-800 dark:text-blue-200">Online Sessions</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Home className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-purple-800 dark:text-purple-200">In-Person Available</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price & Book Card */}
            <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg sticky top-8">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  ${tutor.hourlyRate}
                  <span className="text-lg font-normal text-gray-500">/hour</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Professional tutoring rate
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book a Lesson
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full border-2 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>100% Secure Booking</span>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>• Free cancellation up to 24h before</div>
                  <div>• Money-back guarantee</div>
                  <div>• Verified tutor profile</div>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Response Time</span>
                  <span className="font-medium text-gray-900 dark:text-white">{tutor.responseTime?.replace('Usually responds within ', '')}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Teaching Modes</span>
                  <div className="flex gap-1">
                    {tutor.teachingModes.includes('online') && (
                      <Video className="w-4 h-4 text-blue-500" />
                    )}
                    {tutor.teachingModes.includes('offline') && (
                      <Home className="w-4 h-4 text-purple-500" />
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Total Students</span>
                  <span className="font-medium text-gray-900 dark:text-white">{Math.floor((tutor.completedLessons || 0) / 8)}+</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Success Rate</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{tutor.studentsSatisfaction}%</span>
                </div>
              </div>
            </Card>

            {/* Teaching Methods */}
            <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Teaching Methods
              </h3>
              
              <div className="space-y-3">
                {tutor.teachingModes.includes('online') && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="font-medium text-blue-800 dark:text-blue-200">Online Sessions</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">Video calls, screen sharing</div>
                    </div>
                  </div>
                )}
                
                {tutor.teachingModes.includes('offline') && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Home className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <div className="font-medium text-purple-800 dark:text-purple-200">In-Person</div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">Face-to-face sessions</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDetailPage;