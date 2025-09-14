import express from 'express';
import { protect, ownershipOrAdmin } from '@/middleware/authMiddleware';
import { asHandler } from '@/types/express';
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getTeacherReviews,
  getStudentReviews,
  getJobReviews,
  reportReview,
  likeReview,
  getReviewStats
} from '@/controllers/reviewController';

const router = express.Router();

// Protected routes - all require authentication
router.use(asHandler(protect));

// Review CRUD operations
router.post('/', asHandler(createReview));
router.get('/', asHandler(getReviews));
router.get('/stats', asHandler(getReviewStats));
router.get('/:reviewId', asHandler(getReviewById));
router.put('/:reviewId', asHandler(ownershipOrAdmin('reviewerId')), asHandler(updateReview));
router.delete('/:reviewId', asHandler(ownershipOrAdmin('reviewerId')), asHandler(deleteReview));

// Review filtering
router.get('/teacher/:teacherId', asHandler(getTeacherReviews));
router.get('/student/:studentId', asHandler(getStudentReviews));
router.get('/job/:jobId', asHandler(getJobReviews));

// Review interactions
router.post('/:reviewId/like', asHandler(likeReview));
router.post('/:reviewId/report', asHandler(reportReview));

export default router;