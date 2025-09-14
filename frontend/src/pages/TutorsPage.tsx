import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Star, Book, Award, Clock, Globe, MessageCircle } from 'lucide-react';
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
}

// Mock data for tutors
const mockTutors: Tutor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=3b82f6&color=ffffff&size=200',
    subjects: ['Mathematics', 'Calculus', 'Linear Algebra', 'Statistics'],
    bio: 'PhD in Mathematics with 15+ years of teaching experience. Specialized in advanced calculus and linear algebra.',
    location: 'New York, NY',
    rating: 4.9,
    totalReviews: 127,
    hourlyRate: 85,
    experience: 15,
    languages: ['English', 'Spanish'],
    teachingModes: ['online', 'offline'],
    qualifications: ['PhD Mathematics - MIT', 'MS Applied Mathematics - Stanford'],
    availability: 'Available Mon-Fri'
  },
  {
    id: '2',
    name: 'Prof. Michael Chen',
    avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=ffffff&size=200',
    subjects: ['Computer Science', 'Web Development', 'Python', 'JavaScript'],
    bio: 'Computer Science professor with expertise in web development, AI, and data structures. Former software engineer at Google.',
    location: 'San Francisco, CA',
    rating: 4.8,
    totalReviews: 89,
    hourlyRate: 95,
    experience: 12,
    languages: ['English', 'Mandarin'],
    teachingModes: ['online', 'offline'],
    qualifications: ['PhD Computer Science - Stanford', 'BS Engineering - UC Berkeley'],
    availability: 'Available Mon-Fri'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    avatar: 'https://ui-avatars.com/api/?name=Emma+Rodriguez&background=dc2626&color=ffffff&size=200',
    subjects: ['Spanish', 'Language Learning', 'Business Spanish'],
    bio: 'Native Spanish speaker with Master\'s in Language Education. Specializing in conversational Spanish and business Spanish.',
    location: 'Miami, FL',
    rating: 4.7,
    totalReviews: 156,
    hourlyRate: 65,
    experience: 8,
    languages: ['Spanish', 'English', 'Portuguese'],
    teachingModes: ['online', 'offline'],
    qualifications: ['MA Language Education', 'DELE Certified Teacher'],
    availability: 'Available Mon-Sat'
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=7c3aed&color=ffffff&size=200',
    subjects: ['Physics', 'Quantum Mechanics', 'Astrophysics'],
    bio: 'Physics researcher and educator with expertise in quantum mechanics and astrophysics. Published author with 50+ research papers.',
    location: 'Boston, MA',
    rating: 4.9,
    totalReviews: 73,
    hourlyRate: 90,
    experience: 20,
    languages: ['English', 'German'],
    teachingModes: ['online', 'offline'],
    qualifications: ['PhD Physics - Harvard', 'MS Theoretical Physics - MIT'],
    availability: 'Available Tue-Sat'
  },
  {
    id: '5',
    name: 'Lisa Park',
    avatar: 'https://ui-avatars.com/api/?name=Lisa+Park&background=f59e0b&color=ffffff&size=200',
    subjects: ['English Literature', 'Creative Writing', 'Essay Writing'],
    bio: 'Creative writing and literature expert with MFA from Columbia. Published novelist and experienced writing coach.',
    location: 'Chicago, IL',
    rating: 4.8,
    totalReviews: 92,
    hourlyRate: 70,
    experience: 10,
    languages: ['English', 'Korean'],
    teachingModes: ['online', 'offline'],
    qualifications: ['MFA Creative Writing - Columbia', 'BA English Literature'],
    availability: 'Available Mon-Sat'
  }
];

const TutorsPage: React.FC = () => {
  const [tutors] = useState<Tutor[]>(mockTutors);
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>(mockTutors);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200 });
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique subjects and locations for filter options
  const allSubjects = Array.from(new Set(tutors.flatMap(tutor => tutor.subjects))).sort();
  const allLocations = Array.from(new Set(tutors.map(tutor => tutor.location))).sort();

  // Filter tutors based on search and filters
  useEffect(() => {
    let filtered = tutors;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tutor =>
        tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.subjects.some(subject => 
          subject.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        tutor.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Subject filter
    if (selectedSubject) {
      filtered = filtered.filter(tutor =>
        tutor.subjects.includes(selectedSubject)
      );
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(tutor =>
        tutor.location === selectedLocation
      );
    }

    // Price range filter
    filtered = filtered.filter(tutor =>
      tutor.hourlyRate >= priceRange.min && tutor.hourlyRate <= priceRange.max
    );

    // Rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(tutor =>
        tutor.rating >= ratingFilter
      );
    }

    setFilteredTutors(filtered);
  }, [tutors, searchQuery, selectedSubject, selectedLocation, priceRange, ratingFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubject('');
    setSelectedLocation('');
    setPriceRange({ min: 0, max: 200 });
    setRatingFilter(0);
  };

  const navigate = useNavigate();

  const handleViewDetails = (tutorId: string) => {
    navigate(`/tutors/${tutorId}`);
  };

  const TutorCard: React.FC<{ tutor: Tutor }> = ({ tutor }) => (
    <Card className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden h-full">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-50/20 dark:to-primary-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-4 h-full flex flex-col">
        {/* Header Section */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={tutor.avatar}
                alt={tutor.name}
                className="w-16 h-16 rounded-lg object-cover ring-2 ring-white dark:ring-gray-700 shadow-md"
              />
              {/* Online Status */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>
          </div>

          {/* Name, Location & Price */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
              {tutor.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 mb-2">
              <MapPin className="w-3 h-3 text-primary-500" />
              <span className="truncate">{tutor.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                ${tutor.hourlyRate}
                <span className="text-sm font-normal text-gray-500">/hr</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Star className="w-3 h-3 fill-current text-yellow-500" />
                <span className="font-medium text-gray-900 dark:text-white">{tutor.rating}</span>
                <span className="text-gray-500">({tutor.totalReviews})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Preview */}
        <p className="text-gray-600 dark:text-gray-300 text-xs mb-3 line-clamp-2 leading-relaxed">
          {tutor.bio}
        </p>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-md p-2 text-center">
            <Award className="w-4 h-4 text-primary-600 dark:text-primary-400 mx-auto mb-1" />
            <div className="text-xs font-medium text-primary-700 dark:text-primary-300">
              {tutor.experience}Y
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-2 text-center">
            <Globe className="w-4 h-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
            <div className="text-xs font-medium text-green-700 dark:text-green-300">
              {tutor.languages.length} Lang{tutor.languages.length > 1 ? 's' : ''}
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-2 text-center">
            <Book className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
            <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
              {tutor.teachingModes.includes('online') && tutor.teachingModes.includes('offline') ? 'Both' : 
               tutor.teachingModes[0] === 'online' ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>

        {/* Subjects Preview */}
        <div className="mb-4 flex-1">
          <div className="flex flex-wrap gap-1">
            {tutor.subjects.slice(0, 2).map((subject, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-800 dark:to-primary-700 text-primary-800 dark:text-primary-200 rounded-full border border-primary-200 dark:border-primary-600"
              >
                {subject}
              </span>
            ))}
            {tutor.subjects.length > 2 && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600">
                +{tutor.subjects.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <Button 
            variant="primary" 
            size="sm" 
            className="flex-1 text-xs py-2 group/btn relative overflow-hidden"
            onClick={() => handleViewDetails(tutor.id)}
          >
            <span className="relative z-10 flex items-center justify-center gap-1">
              <Book className="w-3 h-3" />
              Details
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs py-2 border-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300 dark:hover:border-primary-600"
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            Contact
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-theme-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-text mb-2">Find Expert Tutors</h1>
          <p className="text-theme-muted">
            Connect with qualified tutors across all subjects and skill levels
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-theme-background border border-theme-border rounded-lg p-6 mb-6">
          {/* Search Bar */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-theme-muted" />
              </div>
              <input
                type="text"
                placeholder="Search tutors, subjects, or keywords..."
                className="input pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-theme-border">
              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-md text-theme-text"
                >
                  <option value="">All Subjects</option>
                  {allSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-md text-theme-text"
                >
                  <option value="">All Locations</option>
                  {allLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Price Range (${priceRange.min} - ${priceRange.max}/hr)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="w-full px-2 py-1 text-sm border border-theme-border rounded text-theme-text bg-theme-background"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                    className="w-full px-2 py-1 text-sm border border-theme-border rounded text-theme-text bg-theme-background"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">Minimum Rating</label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-md text-theme-text"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                  <option value={4.8}>4.8+ Stars</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="md:col-span-4 flex justify-end">
                <Button variant="ghost" onClick={clearFilters} className="text-sm">
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-theme-text">
            {filteredTutors.length} {filteredTutors.length === 1 ? 'Tutor' : 'Tutors'} Found
          </h2>
          <div className="flex items-center gap-2 text-sm text-theme-muted">
            <Book className="w-4 h-4" />
            Showing quality tutors near you
          </div>
        </div>

        {/* Tutors Grid */}
        {filteredTutors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTutors.map(tutor => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-theme-text mb-2">No tutors found</h3>
            <p className="text-theme-muted mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}

        {/* Load More */}
        {filteredTutors.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Tutors
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorsPage;