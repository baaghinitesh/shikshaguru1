import express from 'express';
import { protect, studentOnly, teacherOnly, ownershipOrAdmin } from '@/middleware/authMiddleware';
import { asHandler } from '@/types/express';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyToJob,
  getJobApplications,
  updateApplicationStatus,
  getMyJobs,
  getMyApplications,
  searchJobs,
  getNearbyJobs,
  getJobStats,
  markJobCompleted,
  cancelJob
} from '@/controllers/jobController';

const router = express.Router();

// Protected routes - all require authentication
router.use(asHandler(protect));

// Job CRUD operations
router.post('/', asHandler(studentOnly), asHandler(createJob));
router.get('/', asHandler(getJobs));
router.get('/search', asHandler(searchJobs));
router.get('/nearby', asHandler(getNearbyJobs));
router.get('/my-jobs', asHandler(getMyJobs));
router.get('/my-applications', asHandler(getMyApplications));
router.get('/stats', asHandler(getJobStats));
router.get('/:jobId', asHandler(getJobById));
router.put('/:jobId', asHandler(ownershipOrAdmin('postedBy')), asHandler(updateJob));
router.delete('/:jobId', asHandler(ownershipOrAdmin('postedBy')), asHandler(deleteJob));

// Job application routes
router.post('/:jobId/apply', asHandler(teacherOnly), asHandler(applyToJob));
router.get('/:jobId/applications', asHandler(ownershipOrAdmin('postedBy')), asHandler(getJobApplications));
router.put('/:jobId/applications/:applicationId', asHandler(ownershipOrAdmin('postedBy')), asHandler(updateApplicationStatus));

// Job status management
router.put('/:jobId/complete', asHandler(ownershipOrAdmin('postedBy')), asHandler(markJobCompleted));
router.put('/:jobId/cancel', asHandler(ownershipOrAdmin('postedBy')), asHandler(cancelJob));

export default router;