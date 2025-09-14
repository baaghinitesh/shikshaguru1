import express from 'express';
import { protect, adminOnly, ownershipOrAdmin } from '@/middleware/authMiddleware';
import { asHandler } from '@/types/express';
import {
  getUserProfile,
  updateUserProfile,
  updateUserTheme,
  uploadAvatar,
  searchUsers,
  getUserById,
  updateProfileSection,
  getTeacherProfiles,
  getNearbyTeachers,
  getTeacherAvailability,
  updateTeacherAvailability,
  deactivateAccount,
  reactivateAccount
} from '@/controllers/userController';
import { upload } from '@/middleware/uploadMiddleware';

const router = express.Router();

// Protected routes - all require authentication
router.use(asHandler(protect));

// User profile routes
router.get('/profile', asHandler(getUserProfile));
router.put('/profile', asHandler(updateUserProfile));
router.put('/profile/section/:section', asHandler(updateProfileSection));
router.put('/theme', asHandler(updateUserTheme));
router.post('/avatar', upload.single('avatar'), asHandler(uploadAvatar));

// Teacher specific routes
router.get('/teachers', asHandler(getTeacherProfiles));
router.get('/teachers/nearby', asHandler(getNearbyTeachers));
router.get('/teachers/:teacherId/availability', asHandler(getTeacherAvailability));
router.put('/availability', asHandler(updateTeacherAvailability));

// User search and discovery
router.get('/search', asHandler(searchUsers));
router.get('/:userId', asHandler(getUserById));

// Account management
router.put('/deactivate', asHandler(ownershipOrAdmin('userId')), asHandler(deactivateAccount));
router.put('/reactivate', asHandler(adminOnly), asHandler(reactivateAccount));

export default router;