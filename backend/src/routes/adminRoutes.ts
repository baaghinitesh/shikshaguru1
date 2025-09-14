import express from 'express';
import { protect, adminOnly } from '@/middleware/authMiddleware';
import { asHandler } from '@/types/express';
import {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  getAllJobs,
  moderateJob,
  getAllReviews,
  moderateReview,
  getAnalytics,
  getSystemHealth,
  manageBulkUsers,
  exportData,
  getAuditLogs,
  manageThemes,
  getContentReports,
  moderateContent
} from '@/controllers/adminController';

const router = express.Router();

// Admin only routes - all require admin authentication
router.use(asHandler(protect), asHandler(adminOnly));

// Dashboard and analytics
router.get('/dashboard', asHandler(getDashboardStats));
router.get('/analytics', asHandler(getAnalytics));
router.get('/system-health', asHandler(getSystemHealth));
router.get('/audit-logs', asHandler(getAuditLogs));

// User management
router.get('/users', asHandler(getAllUsers));
router.get('/users/:userId', asHandler(getUserDetails));
router.put('/users/:userId/status', asHandler(updateUserStatus));
router.delete('/users/:userId', asHandler(deleteUser));
router.post('/users/bulk', asHandler(manageBulkUsers));

// Job management
router.get('/jobs', asHandler(getAllJobs));
router.put('/jobs/:jobId/moderate', asHandler(moderateJob));

// Review management
router.get('/reviews', asHandler(getAllReviews));
router.put('/reviews/:reviewId/moderate', asHandler(moderateReview));

// Content moderation
router.get('/reports', asHandler(getContentReports));
router.put('/reports/:reportId/moderate', asHandler(moderateContent));

// Theme management
router.get('/themes', asHandler(manageThemes));
router.post('/themes', asHandler(manageThemes));
router.put('/themes/:themeId', asHandler(manageThemes));
router.delete('/themes/:themeId', asHandler(manageThemes));

// Data export
router.get('/export/:dataType', asHandler(exportData));

export default router;