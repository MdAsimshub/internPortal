const express = require('express');
const { body, query } = require('express-validator');
const Job = require('../models/Job');
const { authenticateToken, authorize, optionalAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs (with optional filters)
// @access  Public
router.get('/', optionalAuth, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('type')
    .optional()
    .isIn(['Internship', 'Full-time', 'Part-time', 'Contract', 'Freelance'])
    .withMessage('Invalid job type'),
  query('workType')
    .optional()
    .isIn(['Remote', 'In-office', 'Hybrid'])
    .withMessage('Invalid work type'),
  query('domain')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Domain cannot be empty'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term must not be empty'),
  query('minStipend')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stipend must be a non-negative integer'),
  query('maxStipend')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum stipend must be a non-negative integer')
], handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { type, workType, domain, search, minStipend, maxStipend, tags } = req.query;
    
    // Build query for active jobs only
    const query = {
      status: 'Active',
      deadline: { $gt: new Date() }
    };
    
    // Apply filters
    if (type) query.type = type;
    if (workType) query.workType = workType;
    if (domain) query.domain = { $regex: domain, $options: 'i' };
    if (minStipend) query.stipend = { ...query.stipend, $gte: parseInt(minStipend) };
    if (maxStipend) query.stipend = { ...query.stipend, $lte: parseInt(maxStipend) };
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }
    
    let jobs;
    let total;
    
    if (search) {
      // Text search
      jobs = await Job.find({
        ...query,
        $text: { $search: search }
      }, {
        score: { $meta: 'textScore' }
      })
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
        .populate('postedBy', 'name email')
        .limit(limit)
        .skip(skip);
        
      total = await Job.countDocuments({
        ...query,
        $text: { $search: search }
      });
    } else {
      // Regular query
      jobs = await Job.find(query)
        .sort({ isFeatured: -1, createdAt: -1 })
        .populate('postedBy', 'name email')
        .limit(limit)
        .skip(skip);
        
      total = await Job.countDocuments(query);
    }
    
    res.status(200).json({
      success: true,
      data: {
        jobs,
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
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email university');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Increment view count if user is not the job poster
    if (!req.user || req.user.id !== job.postedBy._id.toString()) {
      await job.incrementViews();
    }
    
    res.status(200).json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
});

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private
router.post('/', authenticateToken, [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('company')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
  body('duration')
    .trim()
    .notEmpty()
    .withMessage('Duration is required'),
  body('type')
    .isIn(['Internship', 'Full-time', 'Part-time', 'Contract', 'Freelance'])
    .withMessage('Invalid job type'),
  body('workType')
    .isIn(['Remote', 'In-office', 'Hybrid'])
    .withMessage('Invalid work type'),
  body('stipend')
    .isInt({ min: 0 })
    .withMessage('Stipend must be a non-negative integer'),
  body('deadline')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value <= new Date()) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
  body('domain')
    .trim()
    .notEmpty()
    .withMessage('Domain is required'),
  body('tags')
    .isArray({ min: 1 })
    .withMessage('At least one tag is required'),
  body('tags.*')
    .trim()
    .notEmpty()
    .withMessage('Tags cannot be empty')
], handleValidationErrors, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user.id
    };
    
    const job = await Job.create(jobData);
    await job.populate('postedBy', 'name email');
    
    // Award XP to user for posting a job
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    await user.addXP(100); // 100 XP for posting a job
    user.posts += 1;
    await user.save();
    await user.checkBadges();
    
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job',
      error: error.message
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private (Job poster or Admin)
router.put('/:id', authenticateToken, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
  body('stipend')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stipend must be a non-negative integer'),
  body('deadline')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value <= new Date()) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive', 'Closed'])
    .withMessage('Invalid status')
], handleValidationErrors, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Check if user can update this job
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }
    
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');
    
    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: error.message
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private (Job poster or Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Check if user can delete this job
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }
    
    await Job.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message
    });
  }
});

// @route   GET /api/jobs/user/:userId
// @desc    Get jobs posted by a specific user
// @access  Public
router.get('/user/:userId', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const jobs = await Job.find({ postedBy: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('postedBy', 'name email')
      .limit(limit)
      .skip(skip);
    
    const total = await Job.countDocuments({ postedBy: req.params.userId });
    
    res.status(200).json({
      success: true,
      data: {
        jobs,
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
    console.error('Get user jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user jobs',
      error: error.message
    });
  }
});

// @route   GET /api/jobs/stats/overview
// @desc    Get job statistics
// @access  Private (Admin)
router.get('/stats/overview', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const stats = await Job.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const typeStats = await Job.aggregate([
      {
        $match: { status: 'Active' }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const domainStats = await Job.aggregate([
      {
        $match: { status: 'Active' }
      },
      {
        $group: {
          _id: '$domain',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        typeStats,
        domainStats
      }
    });
  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job statistics',
      error: error.message
    });
  }
});

module.exports = router;
