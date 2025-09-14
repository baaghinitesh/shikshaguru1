import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

import connectDB from '@/config/database';
import { errorHandler, notFound } from '@/middleware/errorMiddleware';
import authRoutes from '@/routes/authRoutes';
import userRoutes from '@/routes/userRoutes';
import jobRoutes from '@/routes/jobRoutes';
import chatRoutes from '@/routes/chatRoutes';
import reviewRoutes from '@/routes/reviewRoutes';
import adminRoutes from '@/routes/adminRoutes';
import { initializeSocket } from '@/services/socketService';
import { EmailService } from '@/services/emailService';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://shikshaguru.com'] 
      : ['http://localhost:3000', 'http://localhost:3001', /^http:\/\/172\.17\.\d+\.\d+:300[01]$/, /.*\.clackypaas\.com$/],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Initialize socket service
initializeSocket(io);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://shikshaguru.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', /^http:\/\/172\.17\.\d+\.\d+:300[01]$/, /.*\.clackypaas\.com$/],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to ShikshaGuru API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    documentation: {
      health: '/health',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        jobs: '/api/jobs',
        chat: '/api/chat',
        reviews: '/api/reviews',
        admin: '/api/admin'
      }
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ShikshaGuru API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ShikshaGuru API Documentation',
    version: '1.0.0',
    endpoints: {
      authentication: {
        base: '/api/auth',
        routes: {
          'POST /api/auth/register': 'Register a new user',
          'POST /api/auth/login': 'Login user',
          'POST /api/auth/logout': 'Logout user',
          'GET /api/auth/me': 'Get current user profile',
          'POST /api/auth/refresh-token': 'Refresh access token',
          'POST /api/auth/forgot-password': 'Request password reset',
          'POST /api/auth/reset-password/:token': 'Reset password with token',
          'PUT /api/auth/password': 'Change password',
          'GET /api/auth/verify-email/:token': 'Verify email address',
          'POST /api/auth/resend-verification': 'Resend verification email'
        }
      },
      users: {
        base: '/api/users',
        description: 'User profile and management endpoints'
      },
      jobs: {
        base: '/api/jobs',
        description: 'Job posting and application endpoints'
      },
      chat: {
        base: '/api/chat',
        description: 'Real-time chat and messaging endpoints'
      },
      reviews: {
        base: '/api/reviews',
        description: 'Review and rating system endpoints'
      },
      admin: {
        base: '/api/admin',
        description: 'Administrative endpoints (admin only)'
      }
    },
    status: {
      health: '/health',
      root: '/'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
  });
}

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');
    
    // Initialize EmailService
    await EmailService.initialize();
    
    server.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Socket.IO server initialized`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

startServer();

export { app, io };