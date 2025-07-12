const express = require('express');
const { body, query } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { authenticateToken, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/applications
// @desc    Apply for a job
// @access  Private (Students only)
router.post('/', authenticateToken, authorize('student'), [
  body('jobId')
    .isMongoId()
    .withMessage('Invalid job ID'),
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Cover letter cannot exceed 1000 characters'),
  body('resume')
    .trim()
    .notEmpty()
    .withMessage('Resume URL is required'),
  body('customAnswers')
    .optional()
    .isArray()
    .withMessage('Custom answers must be an array'),
  body('referredBy')
    .optional()
    .isMongoId()
    .withMessage('Invalid referrer ID')
], handleValidationErrors, async (req, res) => {
  try {
    const { jobId, coverLetter, resume, customAnswers, referredBy } = req.body;
    
    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    if (job.status !== 'Active' || new Date() > job.deadline) {
      return res.status(400).json({
        success: false,
        message: 'Job is no longer accepting applications'
      });
    }
    
    // Check if user already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.id
    });
    
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }
    
    // Check if user is trying to apply to their own job
    if (job.postedBy.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply to your own job posting'
      });
    }
    
    // Validate referrer if provided
    if (referredBy) {
      const referrer = await User.findById(referredBy);
      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: 'Invalid referrer'
        });
      }
    }
    
    // Create application
    const application = await Application.create({
      job: jobId,
      applicant: req.user.id,
      coverLetter,
      resume,
      customAnswers,
      referredBy
    });
    
    // Update job applicant count
    await job.incrementApplicants();
    
    // Award XP to applicant
    const user = await User.findById(req.user.id);
    await user.addXP(50); // 50 XP for applying
    user.applications += 1;
    await user.save();
    await user.checkBadges();
    
    // Award XP to referrer if applicable
    if (referredBy) {
      const referrer = await User.findById(referredBy);
      await referrer.addXP(75); // 75 XP for referral
      referrer.referrals += 1;
      await referrer.save();
      await referrer.checkBadges();
    }
    
    await application.populate(['job', 'applicant', 'referredBy']);
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
});

// @route   GET /api/applications
// @desc    Get user's applications
// @access  Private
router.get('/', authenticateToken, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('status')
    .optional()
    .isIn(['Applied', 'Reviewing', 'Reviewed', 'Shortlisted', 'Interviewed', 'Selected', 'Rejected'])
    .withMessage('Invalid application status')
], handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;
    
    const query = { applicant: req.user.id };
    if (status) query.status = status;
    
    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .populate('job', 'title company type workType stipend deadline status')
      .populate('referredBy', 'name email')
      .limit(limit)
      .skip(skip);
    
    const total = await Application.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

// @route   GET /api/applications/job/:jobId
// @desc    Get applications for a specific job
// @access  Private (Job poster or Admin)
router.get('/job/:jobId', authenticateToken, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('status')
    .optional()
    .isIn(['Applied', 'Reviewing', 'Reviewed', 'Shortlisted', 'Interviewed', 'Selected', 'Rejected'])
    .withMessage('Invalid application status')
], handleValidationErrors, async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Check if user can view applications for this job
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job'
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;
    
    const query = { job: jobId, isWithdrawn: false };
    if (status) query.status = status;
    
    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .populate('applicant', 'name email university avatar xp level badges')
      .populate('referredBy', 'name email')
      .limit(limit)
      .skip(skip);
    
    const total = await Application.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        applications,
        job,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job applications',
      error: error.message
    });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('applicant', 'name email university avatar xp level badges')
      .populate('referredBy', 'name email');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check if user can view this application
    const canView = application.applicant._id.toString() === req.user.id ||
                   application.job.postedBy.toString() === req.user.id ||
                   req.user.role === 'admin';
    
    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { application }
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private (Job poster or Admin)
router.put('/:id/status', authenticateToken, [
  body('status')
    .isIn(['Applied', 'Reviewing', 'Reviewed', 'Shortlisted', 'Interviewed', 'Selected', 'Rejected'])
    .withMessage('Invalid application status'),
  body('feedback')
    .optional()
    .isObject()
    .withMessage('Feedback must be an object'),
  body('feedback.rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback.comments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comments cannot exceed 1000 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const { status, feedback } = req.body;
    
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('applicant');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check if user can update this application
    if (application.job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }
    
    const oldStatus = application.status;
    await application.updateStatus(status, feedback ? {
      ...feedback,
      providedBy: req.user.id
    } : null);
    
    // Award XP if selected
    if (status === 'Selected' && oldStatus !== 'Selected') {
      const applicant = await User.findById(application.applicant._id);
      await applicant.addXP(200); // 200 XP for being selected
      await applicant.checkBadges();
    }
    
    await application.populate(['job', 'applicant', 'referredBy']);
    
    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
});

// @route   PUT /api/applications/:id/withdraw
// @desc    Withdraw application
// @access  Private (Applicant only)
router.put('/:id/withdraw', authenticateToken, [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Withdrawal reason cannot exceed 500 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check if user can withdraw this application
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      });
    }
    
    if (application.isWithdrawn) {
      return res.status(400).json({
        success: false,
        message: 'Application is already withdrawn'
      });
    }
    
    await application.withdraw(reason);
    
    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error withdrawing application',
      error: error.message
    });
  }
});

// @route   GET /api/applications/stats/user
// @desc    Get user's application statistics
// @access  Private
router.get('/stats/user', authenticateToken, async (req, res) => {
  try {
    const stats = await Application.getApplicationStats(req.user.id);
    
    const totalApplications = await Application.countDocuments({
      applicant: req.user.id,
      isWithdrawn: false
    });
    
    res.status(200).json({
      success: true,
      data: {
        stats,
        totalApplications
      }
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application statistics',
      error: error.message
    });
  }
});

// @route   DELETE /api/applications/:id
// @desc    Delete application (Admin only)
// @access  Private (Admin)
router.delete('/:id', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    await Application.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting application',
      error: error.message
    });
  }
});

module.exports = router;
