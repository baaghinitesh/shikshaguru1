import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { IUser, IUserModel, IUserProfile, IThemePreference } from '@/types';

// Theme preference schema
const themePreferenceSchema = new Schema<IThemePreference>({
  currentTheme: {
    type: String,
    default: 'light',
    enum: [
      'light', 'dark', 'blue-ocean', 'sunset', 'forest', 'purple-rain',
      'ocean-breeze', 'golden-hour', 'midnight', 'cherry-blossom',
      'autumn-leaves', 'winter-frost', 'spring-meadow', 'summer-sky',
      'royal-purple', 'emerald-green', 'rose-gold', 'neon-cyber',
      'warm-earth', 'cool-mint', 'vintage-sepia', 'modern-grey'
    ]
  },
  customColors: {
    primary: { type: String, default: '#3b82f6' },
    secondary: { type: String, default: '#64748b' },
    accent: { type: String, default: '#f59e0b' },
    background: { type: String, default: '#ffffff' },
    text: { type: String, default: '#1f2937' }
  },
  fontSize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  },
  fontFamily: {
    type: String,
    default: 'Inter',
    enum: ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat']
  },
  animations: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Address schema
const addressSchema = new Schema({
  street: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zipCode: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  }
}, { _id: false });

// Social links schema
const socialLinksSchema = new Schema({
  facebook: String,
  twitter: String,
  linkedin: String,
  instagram: String,
  youtube: String
}, { _id: false });

// Location schema (for GeoJSON)
const locationSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true,
    index: '2dsphere'
  },
  address: String
}, { _id: false });

// Time slot schema
const timeSlotSchema = new Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
}, { _id: false });

// Availability schema
const availabilitySchema = new Schema({
  monday: [timeSlotSchema],
  tuesday: [timeSlotSchema],
  wednesday: [timeSlotSchema],
  thursday: [timeSlotSchema],
  friday: [timeSlotSchema],
  saturday: [timeSlotSchema],
  sunday: [timeSlotSchema]
}, { _id: false });

// Qualification schema
const qualificationSchema = new Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: Number, required: true },
  grade: String,
  document: String
}, { _id: false });

// Certification schema
const certificationSchema = new Schema({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: Date, required: true },
  expiryDate: Date,
  credentialId: String,
  document: String
}, { _id: false });

// User preferences schema
const userPreferencesSchema = new Schema({
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  privacy: {
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    showLocation: { type: Boolean, default: true }
  },
  communication: {
    allowWhatsApp: { type: Boolean, default: true },
    allowDirectCall: { type: Boolean, default: false }
  }
}, { _id: false });

// User profile schema
const userProfileSchema = new Schema<IUserProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phone: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^\+?[\d\s\-\(\)]{10,}$/.test(v);
      },
      message: 'Invalid phone number format'
    }
  },
  address: addressSchema,
  bio: {
    type: String,
    maxlength: 500
  },
  website: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid website URL'
    }
  },
  socialLinks: socialLinksSchema,
  location: locationSchema,
  preferences: userPreferencesSchema,
  
  // Teacher specific fields
  teachingExperience: {
    type: Number,
    min: 0,
    max: 50
  },
  subjects: [{
    type: String,
    required: function(this: IUserProfile) {
      const user = (this as any).parent() as IUser;
      return user?.role === 'teacher';
    }
  }],
  qualifications: [qualificationSchema],
  certifications: [certificationSchema],
  availability: {
    type: availabilitySchema,
    required: function(this: IUserProfile) {
      const user = (this as any).parent() as IUser;
      return user?.role === 'teacher';
    }
  },
  hourlyRate: {
    type: Number,
    min: 0
  },
  languages: [{
    type: String,
    required: true
  }],
  teachingMode: [{
    type: String,
    enum: ['online', 'offline', 'both'],
    required: function(this: IUserProfile) {
      const user = (this as any).parent() as IUser;
      return user?.role === 'teacher';
    }
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// User schema
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return !this.googleId; // Password not required for Google OAuth users
    },
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  avatar: {
    type: String,
    default: function(this: IUser) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=3b82f6&color=ffffff&size=200`;
    }
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  profile: {
    type: Schema.Types.ObjectId,
    ref: 'UserProfile'
  },
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  theme: {
    type: themePreferenceSchema,
    default: () => ({})
  },
  // Email verification
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  // Password reset
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  // Login attempts tracking
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'theme.currentTheme': 1 });

// Virtual for profile population
userSchema.virtual('profileData', {
  ref: 'UserProfile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate avatar URL
userSchema.methods.generateAvatar = function(): string {
  if (this.avatar && !this.avatar.includes('ui-avatars.com')) {
    return this.avatar;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=3b82f6&color=ffffff&size=200`;
};

// Method to update last login
userSchema.methods.updateLastLogin = function(): Promise<IUser> {
  this.lastLogin = new Date();
  return this.save();
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  delete user.googleId;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.loginAttempts;
  delete user.lockUntil;
  return user;
};

// Method to create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return resetToken;
};

// Method to create email verification token
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  return verificationToken;
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 0
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // After 5 attempts, lock for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.lockUntil) {
    (updates as any).$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { lockUntil: 1, loginAttempts: 1 }
  });
};

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

// Static method to find by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active teachers
userSchema.statics.findActiveTeachers = function(filters: any = {}) {
  return this.find({
    role: 'teacher',
    isActive: true,
    isVerified: true,
    ...filters
  }).populate('profileData');
};

export const User = mongoose.model<IUser, IUserModel>('User', userSchema) as IUserModel;
export const UserProfile = mongoose.model<IUserProfile>('UserProfile', userProfileSchema);