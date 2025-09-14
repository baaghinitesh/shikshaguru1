import { Request } from 'express';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

// Re-export Express types
export * from './express';

// User Types
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  name: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin';
  isVerified: boolean;
  googleId?: string;
  profile?: IUserProfile;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  theme?: IThemePreference;
  
  // Authentication fields
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  loginAttempts?: number;
  lockUntil?: Date;
  
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAvatar(): string;
  updateLastLogin(): Promise<IUser>;
  getPublicProfile(): Partial<IUser>;
  createPasswordResetToken(): string;
  createEmailVerificationToken(): string;
  incLoginAttempts(): Promise<IUser>;
  resetLoginAttempts(): Promise<IUser>;
  isLocked: boolean;
}

// User model interface with static methods
export interface IUserModel extends mongoose.Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findActiveTeachers(filters?: any): Promise<IUser[]>;
}

export interface IUserProfile extends Document {
  userId: Types.ObjectId;
  phone?: string;
  address?: IAddress;
  bio?: string;
  website?: string;
  socialLinks?: ISocialLinks;
  location?: ILocation;
  preferences?: IUserPreferences;
  // Teacher specific fields
  teachingExperience?: number;
  subjects: string[];
  qualifications: IQualification[];
  certifications: ICertification[];
  availability: IAvailability;
  hourlyRate?: number;
  languages: string[];
  teachingMode: ('online' | 'offline' | 'both')[];
  rating?: number;
  totalReviews?: number;
  completedJobs?: number;
}

export interface IAddress {
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

export interface ISocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
}

export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

export interface IUserPreferences {
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

export interface IQualification {
  degree: string;
  institution: string;
  year: number;
  grade?: string;
  document?: string;
}

export interface ICertification {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  document?: string;
}

export interface IAvailability {
  monday: ITimeSlot[];
  tuesday: ITimeSlot[];
  wednesday: ITimeSlot[];
  thursday: ITimeSlot[];
  friday: ITimeSlot[];
  saturday: ITimeSlot[];
  sunday: ITimeSlot[];
}

export interface ITimeSlot {
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  isAvailable: boolean;
}

// Theme Types
export interface IThemePreference {
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

// Job Types
export interface IJob extends Document {
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
  location: ILocation;
  mode: 'online' | 'offline' | 'both';
  requirements: string[];
  postedBy: Types.ObjectId;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  applications: Types.ObjectId[];
  selectedTeacher?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
  tags: string[];
}

export interface IJobApplication extends Document {
  jobId: Types.ObjectId;
  teacherId: Types.ObjectId;
  coverLetter: string;
  proposedRate: number;
  estimatedDuration: {
    value: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface IReview extends Document {
  jobId: Types.ObjectId;
  reviewerId: Types.ObjectId; // Student who gives review
  revieweeId: Types.ObjectId; // Teacher who receives review
  rating: number; // 1-5
  comment: string;
  aspects: {
    teaching: number;
    communication: number;
    punctuality: number;
    knowledge: number;
  };
  createdAt: Date;
  updatedAt: Date;
  isVisible: boolean;
}

// Chat Types
export interface IChat extends Document {
  participants: Types.ObjectId[];
  jobId?: Types.ObjectId;
  messages: IMessage[];
  lastMessage?: IMessage;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface IMessage {
  senderId: Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'file' | 'location';
  timestamp: Date;
  isRead: boolean;
  fileUrl?: string;
  fileName?: string;
}

// Notification Types
export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: 'job' | 'application' | 'message' | 'review' | 'system';
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

// Search Types
export interface ISearchFilters {
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

// Express Request Extensions
export interface AuthRequest extends Request {
  user?: IUser;
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

// Socket.IO Types
import { Server as SocketIOServer } from 'socket.io';

export interface ISocketUser {
  userId: string;
  socketId: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface ISocketMessage {
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'location';
  timestamp: Date;
}

// Extended Socket.IO Server interface
export interface ExtendedSocketIOServer extends SocketIOServer {
  getActiveUsers(): ISocketUser[];
  isUserOnline(userId: string): boolean;
  sendNotification(userId: string, notification: any): void;
}

// File Upload Types
export interface IUploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  filename: string;
  path: string;
  size: number;
}

// Analytics Types
export interface IAnalytics {
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
    date: Date;
    users: number;
  }>;
}