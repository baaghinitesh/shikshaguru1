import { Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@/models/User';
import { AuthRequest, ApiResponse } from '@/types';

interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

// Protect routes - require authentication
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies (if using cookie auth)
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Not authorized, no token provided'
      };
      res.status(401).json(response);
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      
      // Get user from database
      const user = await User.findById(decoded.userId)
        .select('-password')
        .populate('profile');

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'Not authorized, user not found'
        };
        res.status(401).json(response);
        return;
      }

      if (!user.isActive) {
        const response: ApiResponse = {
          success: false,
          message: 'Account is deactivated'
        };
        res.status(401).json(response);
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Not authorized, invalid token'
      };
      res.status(401).json(response);
      return;
    }
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication error'
    };
    res.status(500).json(response);
  }
};

// Admin only access
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    const response: ApiResponse = {
      success: false,
      message: 'Not authorized, admin access required'
    };
    res.status(403).json(response);
  }
};

// Teacher only access
export const teacherOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
    next();
  } else {
    const response: ApiResponse = {
      success: false,
      message: 'Not authorized, teacher access required'
    };
    res.status(403).json(response);
  }
};

// Student only access
export const studentOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && (req.user.role === 'student' || req.user.role === 'admin')) {
    next();
  } else {
    const response: ApiResponse = {
      success: false,
      message: 'Not authorized, student access required'
    };
    res.status(403).json(response);
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        const user = await User.findById(decoded.userId)
          .select('-password')
          .populate('profile');

        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Silently fail for optional auth
        console.log('Optional auth failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Check if user owns the resource or is an admin
export const ownershipOrAdmin = (resourceUserIdField: string = 'userId') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required'
      };
      res.status(401).json(response);
      return;
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Check ownership
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!resourceUserId) {
      const response: ApiResponse = {
        success: false,
        message: 'Resource user ID not found'
      };
      res.status(400).json(response);
      return;
    }

    if (req.user._id.toString() !== resourceUserId.toString()) {
      const response: ApiResponse = {
        success: false,
        message: 'Not authorized to access this resource'
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};