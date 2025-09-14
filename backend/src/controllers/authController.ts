import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, UserProfile } from '@/models/User';
import { AuthRequest, ApiResponse, asHandler } from '@/types';
import { AuthService } from '@/services/authService';
import { EmailService } from '@/services/emailService';

// Generate JWT token
const generateTokens = (userId: string) => {
  const accessToken = AuthService.generateToken(userId);
  const refreshToken = AuthService.generateRefreshToken();
  return { accessToken, refreshToken };
};

// Register user
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    // Validate input using AuthService
    const validation = AuthService.validatePasswordStrength(password);
    if (!validation.isValid) {
      const response: ApiResponse = {
        success: false,
        message: `Password validation failed: ${validation.errors.join(', ')}`
      };
      res.status(400).json(response);
      return;
    }

    // Check rate limiting
    const rateLimitKey = `register_${req.ip}`;
    if (!AuthService.checkRateLimit(rateLimitKey, 3, 15 * 60 * 1000)) {
      const response: ApiResponse = {
        success: false,
        message: 'Too many registration attempts. Please try again later.'
      };
      res.status(429).json(response);
      return;
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        message: 'User already exists with this email'
      };
      res.status(400).json(response);
      return;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      isVerified: process.env.NODE_ENV === 'development' // Auto-verify in development
    });

    // Create user profile
    const profile = await UserProfile.create({
      userId: user._id,
      subjects: role === 'teacher' ? [] : undefined,
      languages: ['English'],
      teachingMode: role === 'teacher' ? ['online'] : undefined,
      availability: role === 'teacher' ? {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      } : undefined
    });

    user.profile = profile._id as any;
    await user.save();

    // Generate tokens
    const tokens = generateTokens(user._id.toString());

    // Update last login
    await user.updateLastLogin();

    // Send welcome email
    if (process.env.NODE_ENV === 'production') {
      try {
        let verificationUrl: string | undefined;
        
        // Send verification email if not auto-verified
        if (!user.isVerified) {
          const verificationToken = user.createEmailVerificationToken();
          await user.save();
          verificationUrl = AuthService.generateVerificationURL(verificationToken);
        }
        
        await EmailService.sendWelcomeEmail(user, verificationUrl);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Continue with registration even if email fails
      }
    } else if (!user.isVerified) {
      // In development, still create verification token for testing
      try {
        const verificationToken = user.createEmailVerificationToken();
        await user.save();
        const verificationUrl = AuthService.generateVerificationURL(verificationToken);
        await EmailService.sendVerificationEmail(user, verificationUrl);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }
    }

    const response: ApiResponse = {
      success: true,
      message: 'User registered successfully',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: user.getPublicProfile()
      }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check rate limiting
    const rateLimitKey = `login_${email}_${req.ip}`;
    if (!AuthService.checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      const response: ApiResponse = {
        success: false,
        message: 'Too many login attempts. Please try again later.'
      };
      res.status(429).json(response);
      return;
    }

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password +loginAttempts +lockUntil')
      .populate('profile');

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid email or password'
      };
      res.status(401).json(response);
      return;
    }

    // Check if account is locked
    if (user.isLocked) {
      const response: ApiResponse = {
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts. Please try again later or reset your password.'
      };
      res.status(423).json(response);
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();

      const response: ApiResponse = {
        success: false,
        message: 'Invalid email or password'
      };
      res.status(401).json(response);
      return;
    }

    // Check if account is active
    if (!user.isActive) {
      const response: ApiResponse = {
        success: false,
        message: 'Account is deactivated. Please contact support.'
      };
      res.status(401).json(response);
      return;
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();
    
    // Clear rate limit on successful login
    AuthService.clearRateLimit(rateLimitKey);

    // Generate tokens
    const tokens = generateTokens(user._id.toString());

    // Update last login
    await user.updateLastLogin();

    const response: ApiResponse = {
      success: true,
      message: 'Login successful',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: user.getPublicProfile()
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const response: ApiResponse = {
        success: false,
        message: 'Refresh token is required'
      };
      res.status(400).json(response);
      return;
    }

    // For this implementation, we'll use the access token verification
    // In a full implementation, you'd store refresh tokens in the database
    const decoded = AuthService.verifyToken(refreshToken);
    if (!decoded) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid or expired refresh token'
      };
      res.status(401).json(response);
      return;
    }

    const tokens = generateTokens(decoded.userId);

    const response: ApiResponse = {
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Logout user
export const logout = async (req: Request, res: Response): Promise<void> => {
  // For JWT, logout is handled on client side by removing token
  // Here we can implement token blacklisting if needed
  const response: ApiResponse = {
    success: true,
    message: 'Logout successful'
  };

  res.status(200).json(response);
};

// Get current user
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id)
      .populate('profile')
      .populate('profileData');

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found'
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: user.getPublicProfile()
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    // Check rate limiting
    const rateLimitKey = `forgot_${email}_${req.ip}`;
    if (!AuthService.checkRateLimit(rateLimitKey, 3, 15 * 60 * 1000)) {
      const response: ApiResponse = {
        success: false,
        message: 'Too many password reset requests. Please try again later.'
      };
      res.status(429).json(response);
      return;
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      const response: ApiResponse = {
        success: true,
        message: 'If an account with this email exists, you will receive a password reset email.'
      };
      res.status(200).json(response);
      return;
    }

    // Generate password reset token
    const resetToken = user.createPasswordResetToken();
    await user.save();

    // Send password reset email
    try {
      const resetUrl = AuthService.generateResetURL(resetToken);
      await EmailService.sendPasswordResetEmail(user, resetUrl);

      const response: ApiResponse = {
        success: true,
        message: 'Password reset email sent successfully'
      };
      res.status(200).json(response);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      const response: ApiResponse = {
        success: false,
        message: 'Failed to send password reset email. Please try again later.'
      };
      res.status(500).json(response);
    }
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate new password
    const validation = AuthService.validatePasswordStrength(password);
    if (!validation.isValid) {
      const response: ApiResponse = {
        success: false,
        message: `Password validation failed: ${validation.errors.join(', ')}`
      };
      res.status(400).json(response);
      return;
    }

    // Hash the token to compare with stored hash
    const hashedToken = AuthService.hashToken(token);

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid or expired password reset token'
      };
      res.status(400).json(response);
      return;
    }

    // Reset password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Reset login attempts if account was locked
    await user.resetLoginAttempts();
    
    await user.save();

    // Send confirmation email
    try {
      await EmailService.sendPasswordChangeConfirmation(user);
    } catch (emailError) {
      console.error('Failed to send password reset confirmation:', emailError);
      // Continue even if email fails
    }

    const response: ApiResponse = {
      success: true,
      message: 'Password reset successful'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Update password
export const updatePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate new password
    const validation = AuthService.validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      const response: ApiResponse = {
        success: false,
        message: `Password validation failed: ${validation.errors.join(', ')}`
      };
      res.status(400).json(response);
      return;
    }

    const user = await User.findById(req.user?._id).select('+password');
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found'
      };
      res.status(404).json(response);
      return;
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      const response: ApiResponse = {
        success: false,
        message: 'Current password is incorrect'
      };
      res.status(400).json(response);
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send confirmation email
    try {
      await EmailService.sendPasswordChangeConfirmation(user);
    } catch (emailError) {
      console.error('Failed to send password change confirmation:', emailError);
      // Continue even if email fails
    }

    const response: ApiResponse = {
      success: true,
      message: 'Password updated successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;

    // Hash the token to compare with stored hash
    const hashedToken = AuthService.hashToken(token);

    // Find user with valid verification token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid or expired email verification token'
      };
      res.status(400).json(response);
      return;
    }

    // Verify email
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Email verified successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Resend verification email
export const resendVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    // Check rate limiting
    const rateLimitKey = `verify_${email}_${req.ip}`;
    if (!AuthService.checkRateLimit(rateLimitKey, 3, 15 * 60 * 1000)) {
      const response: ApiResponse = {
        success: false,
        message: 'Too many verification requests. Please try again later.'
      };
      res.status(429).json(response);
      return;
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      const response: ApiResponse = {
        success: true,
        message: 'If an account with this email exists and is unverified, a verification email has been sent.'
      };
      res.status(200).json(response);
      return;
    }

    if (user.isVerified) {
      const response: ApiResponse = {
        success: false,
        message: 'Email is already verified'
      };
      res.status(400).json(response);
      return;
    }

    // Generate new verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      const verificationUrl = AuthService.generateVerificationURL(verificationToken);
      await EmailService.sendVerificationEmail(user, verificationUrl);

      const response: ApiResponse = {
        success: true,
        message: 'Verification email sent successfully'
      };
      res.status(200).json(response);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      const response: ApiResponse = {
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      };
      res.status(500).json(response);
    }
  } catch (error) {
    next(error);
  }
};

// Google OAuth (placeholder)
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  // TODO: Implement Google OAuth
  const response: ApiResponse = {
    success: false,
    message: 'Google OAuth not implemented yet'
  };

  res.status(501).json(response);
};

// Google OAuth callback (placeholder)
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  // TODO: Implement Google OAuth callback
  const response: ApiResponse = {
    success: false,
    message: 'Google OAuth callback not implemented yet'
  };

  res.status(501).json(response);
};