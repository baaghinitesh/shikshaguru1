import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Briefcase, Calendar, Building, Clock, DollarSign, Eye, Heart, Send } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  subject: string;
  salary: {
    min: number;
    max: number;
    period: 'hour' | 'month' | 'year';
  };
  experience: string;
  postedDate: string;
  urgency: 'low' | 'medium' | 'high';
  requirements: string[];
  benefits?: string[];
}

// Mock data for jobs
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Mathematics Tutor - High School Level',
    description: 'Seeking an experienced mathematics tutor to help high school students with algebra, geometry, and calculus. Must be patient and have excellent communication skills.',
    company: 'EduCore Academy',
    location: 'New York, NY',
    type: 'part-time',
    subject: 'Mathematics',
    salary: { min: 30, max: 45, period: 'hour' },
    experience: '2-5 years',
    postedDate: '2024-01-15',
    urgency: 'high',
    requirements: [
      'Bachelor\'s degree in Mathematics or related field',
      'Minimum 2 years tutoring experience',
      'Strong communication skills',
      'Flexible schedule'
    ],
    benefits: ['Flexible hours', 'Competitive pay', 'Professional development']
  },
  {
    id: '2',
    title: 'Online Computer Science Instructor',
    description: 'Remote position teaching computer science fundamentals, programming languages (Python, JavaScript), and web development to college-level students.',
    company: 'TechEd Solutions',
    location: 'Remote',
    type: 'full-time',
    subject: 'Computer Science',
    salary: { min: 60000, max: 80000, period: 'year' },
    experience: '3-7 years',
    postedDate: '2024-01-12',
    urgency: 'medium',
    requirements: [
      'Master\'s degree in Computer Science',
      'Proficiency in Python, JavaScript, React',
      'Online teaching experience preferred',
      'Strong presentation skills'
    ],
    benefits: ['Health insurance', 'Remote work', 'Professional development', 'Paid vacation']
  },
  {
    id: '3',
    title: 'Spanish Language Tutor - Conversational Focus',
    description: 'Native Spanish speaker needed for one-on-one conversation practice sessions. Help students improve their speaking fluency and pronunciation.',
    company: 'Language Bridge Institute',
    location: 'Miami, FL',
    type: 'freelance',
    subject: 'Spanish',
    salary: { min: 25, max: 35, period: 'hour' },
    experience: '1-3 years',
    postedDate: '2024-01-10',
    urgency: 'medium',
    requirements: [
      'Native Spanish speaker',
      'Bachelor\'s degree (any field)',
      'Experience in language instruction',
      'Cultural knowledge of Spanish-speaking countries'
    ]
  },
  {
    id: '4',
    title: 'Physics Lab Assistant & Tutor',
    description: 'Part-time position assisting with physics laboratory sessions and providing tutoring support for undergraduate students in mechanics and electromagnetism.',
    company: 'University Science Center',
    location: 'Boston, MA',
    type: 'part-time',
    subject: 'Physics',
    salary: { min: 20, max: 28, period: 'hour' },
    experience: 'Entry level',
    postedDate: '2024-01-08',
    urgency: 'low',
    requirements: [
      'Currently pursuing or completed Physics degree',
      'Laboratory experience',
      'Strong analytical skills',
      'Available during lab hours'
    ],
    benefits: ['Hands-on experience', 'Academic environment', 'Flexible schedule']
  },
  {
    id: '5',
    title: 'Executive English Writing Coach',
    description: 'Work with business professionals to improve their written English communication, including emails, reports, and presentations. Remote or in-person options available.',
    company: 'Business Language Solutions',
    location: 'Chicago, IL',
    type: 'contract',
    subject: 'English',
    salary: { min: 50, max: 70, period: 'hour' },
    experience: '5+ years',
    postedDate: '2024-01-05',
    urgency: 'high',
    requirements: [
      'Master\'s degree in English or Communications',
      'Business writing expertise',
      'Professional coaching experience',
      'Excellent interpersonal skills'
    ],
    benefits: ['High hourly rate', 'Professional network', 'Flexible location']
  }
];

const JobsPage: React.FC = () => {
  const [jobs] = useState<Job[]>(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(mockJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique filter options
  const allSubjects = Array.from(new Set(jobs.map(job => job.subject))).sort();
  const allTypes = Array.from(new Set(jobs.map(job => job.type))).sort();
  const allLocations = Array.from(new Set(jobs.map(job => job.location))).sort();
  const urgencyOptions = ['low', 'medium', 'high'];

  // Filter jobs based on search and filters
  useEffect(() => {
    let filtered = jobs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Subject filter
    if (selectedSubject) {
      filtered = filtered.filter(job => job.subject === selectedSubject);
    }

    // Type filter
    if (selectedType) {
      filtered = filtered.filter(job => job.type === selectedType);
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(job => job.location === selectedLocation);
    }

    // Urgency filter
    if (urgencyFilter) {
      filtered = filtered.filter(job => job.urgency === urgencyFilter);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchQuery, selectedSubject, selectedType, selectedLocation, urgencyFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubject('');
    setSelectedType('');
    setSelectedLocation('');
    setUrgencyFilter('');
  };

  const formatSalary = (job: Job) => {
    const { min, max, period } = job.salary;
    const periodText = period === 'hour' ? '/hr' : period === 'month' ? '/month' : '/year';
    
    if (min === max) {
      return `$${min.toLocaleString()}${periodText}`;
    }
    return `$${min.toLocaleString()} - $${max.toLocaleString()}${periodText}`;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'text-blue-600 bg-blue-100';
      case 'part-time': return 'text-green-600 bg-green-100';
      case 'contract': return 'text-purple-600 bg-purple-100';
      case 'freelance': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const navigate = useNavigate();

  const handleViewDetails = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const JobCard: React.FC<{ job: Job }> = ({ job }) => (
    <Card className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden h-full">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-50/20 dark:to-primary-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-4 h-full flex flex-col">
        {/* Header Section */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight">
                {job.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 mb-2">
                <Building className="w-3 h-3 text-primary-500" />
                <span className="font-medium">{job.company}</span>
                <span className="text-gray-400">•</span>
                <MapPin className="w-3 h-3 text-primary-500" />
                <span className="truncate">{job.location}</span>
              </div>
            </div>
            <div className="ml-3 flex-shrink-0">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getUrgencyColor(job.urgency)}`}>
                {job.urgency}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
              {formatSalary(job)}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{new Date(job.postedDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Description Preview */}
        <p className="text-gray-600 dark:text-gray-300 text-xs mb-3 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Key Info Cards */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className={`rounded-md p-2 text-center ${getTypeColor(job.type)}`}>
            <Briefcase className="w-4 h-4 mx-auto mb-1" />
            <div className="text-xs font-medium capitalize">
              {job.type.replace('-', ' ')}
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-2 text-center">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
            <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
              {job.experience}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-md p-2 text-center">
            <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
            <div className="text-xs font-medium text-purple-700 dark:text-purple-300">
              {job.subject}
            </div>
          </div>
        </div>

        {/* Requirements Preview */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="mb-3 flex-1">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Requirements:</h4>
            <div className="space-y-1">
              {job.requirements.slice(0, 2).map((req, index) => (
                <div key={index} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-1 h-1 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                  <span className="line-clamp-1">{req}</span>
                </div>
              ))}
              {job.requirements.length > 2 && (
                <div className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                  +{job.requirements.length - 2} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Benefits Preview */}
        {job.benefits && job.benefits.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {job.benefits.slice(0, 2).map((benefit, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full"
                >
                  {benefit}
                </span>
              ))}
              {job.benefits.length > 2 && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  +{job.benefits.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <Button 
            variant="primary" 
            size="sm" 
            className="flex-1 text-xs py-2 group/btn relative overflow-hidden"
            onClick={() => handleViewDetails(job.id)}
          >
            <span className="relative z-10 flex items-center justify-center gap-1">
              <Eye className="w-3 h-3" />
              View
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs py-2 border-2 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600"
          >
            <Send className="w-3 h-3 mr-1" />
            Apply
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Heart className="w-3 h-3" />
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
          <h1 className="text-3xl font-bold text-theme-text mb-2">Teaching Job Opportunities</h1>
          <p className="text-theme-muted">
            Discover rewarding teaching positions and tutoring opportunities
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
                placeholder="Search jobs, companies, or subjects..."
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

              {/* Job Type Filter */}
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">Job Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-md text-theme-text"
                >
                  <option value="">All Types</option>
                  {allTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
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

              {/* Urgency Filter */}
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">Priority</label>
                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-md text-theme-text"
                >
                  <option value="">All Priorities</option>
                  {urgencyOptions.map(urgency => (
                    <option key={urgency} value={urgency}>
                      {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
                    </option>
                  ))}
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
            {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Available
          </h2>
          <div className="flex items-center gap-2 text-sm text-theme-muted">
            <Briefcase className="w-4 h-4" />
            Fresh opportunities updated daily
          </div>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-xl font-semibold text-theme-text mb-2">No jobs found</h3>
            <p className="text-theme-muted mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}

        {/* Load More */}
        {filteredJobs.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Jobs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;