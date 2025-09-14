import express from 'express';
import { protect } from '@/middleware/authMiddleware';
import { asHandler } from '@/types/express';
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  resendVerification,
  googleAuth,
  googleCallback
} from '@/controllers/authController';

const router = express.Router();

// Public routes
router.post('/register', asHandler(register));
router.post('/login', asHandler(login));
router.post('/logout', asHandler(logout));
router.post('/refresh-token', asHandler(refreshToken));
router.post('/forgot-password', asHandler(forgotPassword));
router.post('/reset-password/:token', asHandler(resetPassword));
router.get('/verify-email/:token', asHandler(verifyEmail));
router.post('/resend-verification', asHandler(resendVerification));
router.get('/google', asHandler(googleAuth));
router.get('/google/callback', asHandler(googleCallback));

// Protected routes
router.get('/me', asHandler(protect), asHandler(getMe));
router.put('/password', asHandler(protect), asHandler(updatePassword));

export default router;