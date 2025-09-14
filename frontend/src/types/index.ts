// User and Authentication Types
export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  profile?: UserProfile;
  theme?: ThemePreference;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface UserProfile {
  _id: string;
  userId: string;
  phone?: string;
  address?: Address;
  bio?: string;
  website?: string;
  socialLinks?: SocialLinks;
  location?: Location;
  preferences?: UserPreferences;
  // Teacher specific fields
  teachingExperience?: number;
  subjects: string[];
  qualifications: Qualification[];
  certifications: Certification[];
  availability: Availability;
  hourlyRate?: number;
  languages: string[];
  teachingMode: ('online' | 'offline' | 'both')[];
  rating?: number;
  totalReviews?: number;
  completedJobs?: number;
}

export interface Address {
  street?: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
}

export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
  };
  communication: {
    allowWhatsApp: boolean;
    allowDirectCall: boolean;
  };
}

export interface Qualification {
  degree: string;
  institution: string;
  year: number;
  grade?: string;
  document?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  document?: string;
}

export interface Availability {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  isAvailable: boolean;
}

// Theme Types
export interface ThemePreference {
  currentTheme: string;
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: string;
  animations: boolean;
}

export interface ThemeOption {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  preview: string;
  category: 'light' | 'dark' | 'colorful';
}

// Job Types
export interface Job {
  _id: string;
  title: string;
  description: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  duration: {
    value: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  location: Location;
  mode: 'online' | 'offline' | 'both';
  requirements: string[];
  postedBy: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  applications: string[];
  selectedTeacher?: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  tags: string[];
}

export interface JobApplication {
  _id: string;
  jobId: string;
  teacherId: string;
  coverLetter: string;
  proposedRate: number;
  estimatedDuration: {
    value: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
}

// Review Types
export interface Review {
  _id: string;
  jobId: string;
  reviewerId: string; // Student who gives review
  revieweeId: string; // Teacher who receives review
  rating: number; // 1-5
  comment: string;
  aspects: {
    teaching: number;
    communication: number;
    punctuality: number;
    knowledge: number;
  };
  createdAt: string;
  updatedAt: string;
  isVisible: boolean;
}

// Chat Types
export interface Chat {
  _id: string;
  participants: User[];
  jobId?: string;
  messages: Message[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Message {
  _id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'location';
  timestamp: string;
  isRead: boolean;
  fileUrl?: string;
  fileName?: string;
}

// Notification Types
export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'job' | 'application' | 'message' | 'review' | 'system';
  data?: any;
  isRead: boolean;
  createdAt: string;
}

// Search Types
export interface SearchFilters {
  query?: string;
  subjects?: string[];
  location?: {
    coordinates: [number, number];
    radius: number; // in kilometers
  };
  budget?: {
    min?: number;
    max?: number;
  };
  rating?: number;
  availability?: boolean;
  mode?: ('online' | 'offline' | 'both')[];
  sortBy?: 'rating' | 'price' | 'distance' | 'reviews' | 'recent';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'teacher';
}

export interface ProfileFormData {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  website?: string;
  address?: Partial<Address>;
  socialLinks?: Partial<SocialLinks>;
}

export interface JobFormData {
  title: string;
  description: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  duration: {
    value: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  location: Partial<Location>;
  mode: 'online' | 'offline' | 'both';
  requirements: string[];
  deadline?: string;
  tags: string[];
}

// Component Props Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Context Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<ProfileFormData>) => Promise<void>;
  updateTheme: (theme: Partial<ThemePreference>) => Promise<void>;
}

export interface ThemeContextType {
  theme: ThemePreference;
  themes: ThemeOption[];
  setTheme: (theme: string) => void;
  setCustomColors: (colors: Partial<NonNullable<ThemePreference['customColors']>>) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setFontFamily: (family: string) => void;
  toggleAnimations: () => void;
}

export interface SocketContextType {
  socket: any; // Socket.IO client instance
  isConnected: boolean;
  onlineUsers: string[];
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (chatId: string, content: string, type?: string) => void;
  markMessagesAsRead: (chatId: string, messageIds: string[]) => void;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ErrorState {
  message: string;
  code?: string;
  details?: any;
}

// Device and Responsive Types
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Animation Types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

// File Upload Types
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  progress?: number;
  error?: string;
}

// Analytics Types
export interface Analytics {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalJobs: number;
  completedJobs: number;
  totalRevenue: number;
  averageRating: number;
  popularSubjects: Array<{
    subject: string;
    count: number;
  }>;
  userGrowth: Array<{
    date: string;
    users: number;
  }>;
}