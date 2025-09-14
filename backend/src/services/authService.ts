import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '@/models/User';
import { IUser } from '@/types';

export class AuthService {
  // Generate JWT token
  static generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    return jwt.sign(
      { userId },
      secret,
      { expiresIn: process.env.JWT_EXPIRE || '7d' } as jwt.SignOptions
    );
  }

  // Generate refresh token
  static generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  // Generate password reset token
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate email verification token
  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Hash token (for storing in database)
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Verify JWT token
  static verifyToken(token: string): { userId: string } | null {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not defined');
      }
      return jwt.verify(token, secret) as { userId: string };
    } catch (error) {
      return null;
    }
  }

  // Extract token from authorization header
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  // Check if user has required role
  static hasRole(user: IUser, allowedRoles: string[]): boolean {
    return allowedRoles.includes(user.role);
  }

  // Check if user owns resource
  static ownsResource(user: IUser, resourceUserId: string): boolean {
    return user._id.toString() === resourceUserId.toString();
  }

  // Check if user can access resource (owns it or is admin)
  static canAccessResource(user: IUser, resourceUserId: string): boolean {
    return user.role === 'admin' || this.ownsResource(user, resourceUserId);
  }

  // Generate secure password reset URL
  static generateResetURL(resetToken: string): string {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    return `${clientUrl}/reset-password/${resetToken}`;
  }

  // Generate email verification URL
  static generateVerificationURL(verificationToken: string): string {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    return `${clientUrl}/verify-email/${verificationToken}`;
  }

  // Validate password strength
  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Rate limiting data structure (in production, use Redis)
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  // Check rate limit for authentication attempts
  static checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const key = `auth_${identifier}`;
    
    const record = this.rateLimitStore.get(key);
    
    if (!record || record.resetTime < now) {
      this.rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }

  // Clear rate limit for successful authentication
  static clearRateLimit(identifier: string): void {
    const key = `auth_${identifier}`;
    this.rateLimitStore.delete(key);
  }

  // Generate a secure session ID
  static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Sanitize user data for client response
  static sanitizeUser(user: IUser): Partial<IUser> {
    const sanitized = user.getPublicProfile();
    // Remove any sensitive fields that might have leaked through
    delete (sanitized as any).password;
    delete (sanitized as any).passwordResetToken;
    delete (sanitized as any).passwordResetExpires;
    delete (sanitized as any).emailVerificationToken;
    return sanitized;
  }
}

// Types for token payload
export interface TokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

// Types for authentication responses
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    refreshToken?: string;
    user: Partial<IUser>;
    expiresIn: string;
  };
  error?: string;
}

// Types for rate limiting
export interface RateLimitInfo {
  isAllowed: boolean;
  remainingAttempts: number;
  resetTime: number;
}