const express = require('express');
const { query } = require('express-validator');
const User = require('../models/User');
const { optionalAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Badge definitions
const BADGE_DEFINITIONS = {
  "Campus Recruiter": {
    description: "Posted 5+ opportunities",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "🎯"
  },
  "Top Helper": {
    description: "Referred 8+ students", 
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "🤝"
  },
  "Networking Pro": {
    description: "Applied to 10+ positions",
    color: "bg-green-100 text-green-800 border-green-200", 
    icon: "🌐"
  },
  "Early Bird": {
    description: "First 50 platform users",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: "🐦"
  }
};

// @route   GET /api/leaderboard
// @desc    Get leaderboard with rankings
// @access  Public
router.get('/', optionalAuth, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(['student', 'admin'])
    .withMessage('Role must be either student or admin'),
  query('university')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('University cannot be empty')
], handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { role, university } = req.query;
    
    // Build query
    const query = { isActive: true };
    if (role) query.role = role;
    if (university) query.university = { $regex: university, $options: 'i' };
    
    // Get users sorted by XP
    const users = await User.find(query)
      .select('name email university avatar xp level badges applications posts referrals role')
      .sort({ xp: -1, createdAt: 1 }) // Secondary sort by join date for ties
      .limit(limit)
      .skip(skip);
    
    // Calculate ranks
    const usersWithRank = users.map((user, index) => ({
      ...user.toObject(),
      rank: skip + index + 1
    }));
    
    const total = await User.countDocuments(query);
    
    // Get current user's rank if authenticated
    let currentUserRank = null;
    if (req.user) {
      const higherRankedCount = await User.countDocuments({
        ...query,
        xp: { $gt: req.user.xp }
      });
      currentUserRank = higherRankedCount + 1;
    }
    
    res.status(200).json({
      success: true,
      data: {
        leaderboard: usersWithRank,
        currentUserRank,
        badgeDefinitions: BADGE_DEFINITIONS,
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
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
});

// @route   GET /api/leaderboard/top
// @desc    Get top performers
// @access  Public
router.get('/top', optionalAuth, [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('category')
    .optional()
    .isIn(['xp', 'applications', 'posts', 'referrals'])
    .withMessage('Category must be one of: xp, applications, posts, referrals')
], handleValidationErrors, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || 'xp';
    
    // Define sort criteria
    const sortCriteria = {};
    sortCriteria[category] = -1;
    if (category !== 'xp') {
      sortCriteria.xp = -1; // Secondary sort by XP
    }
    sortCriteria.createdAt = 1; // Tertiary sort by join date
    
    const users = await User.find({ isActive: true, role: 'student' })
      .select('name email university avatar xp level badges applications posts referrals')
      .sort(sortCriteria)
      .limit(limit);
    
    // Add ranks
    const usersWithRank = users.map((user, index) => ({
      ...user.toObject(),
      rank: index + 1
    }));
    
    res.status(200).json({
      success: true,
      data: {
        topPerformers: usersWithRank,
        category,
        badgeDefinitions: BADGE_DEFINITIONS
      }
    });
  } catch (error) {
    console.error('Get top performers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top performers',
      error: error.message
    });
  }
});

// @route   GET /api/leaderboard/university/:university
// @desc    Get leaderboard for specific university
// @access  Public
router.get('/university/:university', optionalAuth, [
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
    const { university } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const users = await User.find({
      university: { $regex: university, $options: 'i' },
      isActive: true,
      role: 'student'
    })
      .select('name email university avatar xp level badges applications posts referrals')
      .sort({ xp: -1, createdAt: 1 })
      .limit(limit)
      .skip(skip);
    
    const usersWithRank = users.map((user, index) => ({
      ...user.toObject(),
      rank: skip + index + 1
    }));
    
    const total = await User.countDocuments({
      university: { $regex: university, $options: 'i' },
      isActive: true,
      role: 'student'
    });
    
    res.status(200).json({
      success: true,
      data: {
        leaderboard: usersWithRank,
        university,
        badgeDefinitions: BADGE_DEFINITIONS,
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
    console.error('Get university leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching university leaderboard',
      error: error.message
    });
  }
});

// @route   GET /api/leaderboard/stats
// @desc    Get leaderboard statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments({ isActive: true, role: 'student' });
    
    // Average XP
    const avgXPResult = await User.aggregate([
      { $match: { isActive: true, role: 'student' } },
      { $group: { _id: null, avgXP: { $avg: '$xp' } } }
    ]);
    const avgXP = avgXPResult[0]?.avgXP || 0;
    
    // Top university by user count
    const topUniversities = await User.aggregate([
      { $match: { isActive: true, role: 'student' } },
      { $group: { _id: '$university', count: { $sum: 1 }, totalXP: { $sum: '$xp' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Badge distribution
    const badgeStats = await User.aggregate([
      { $match: { isActive: true, role: 'student' } },
      { $unwind: '$badges' },
      { $group: { _id: '$badges', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Level distribution
    const levelStats = await User.aggregate([
      { $match: { isActive: true, role: 'student' } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        avgXP: Math.round(avgXP),
        topUniversities,
        badgeStats,
        levelStats,
        badgeDefinitions: BADGE_DEFINITIONS
      }
    });
  } catch (error) {
    console.error('Get leaderboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard statistics',
      error: error.message
    });
  }
});

// @route   GET /api/leaderboard/user/:userId
// @desc    Get user's position and nearby users
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('name email university avatar xp level badges applications posts referrals');
    
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Calculate user's rank
    const higherRankedCount = await User.countDocuments({
      isActive: true,
      role: 'student',
      xp: { $gt: user.xp }
    });
    const userRank = higherRankedCount + 1;
    
    // Get users around this user's rank
    const nearbyUsers = await User.find({
      isActive: true,
      role: 'student'
    })
      .select('name email university avatar xp level badges applications posts referrals')
      .sort({ xp: -1, createdAt: 1 })
      .limit(10)
      .skip(Math.max(0, userRank - 6)); // Show 5 above, user, and 4 below
    
    const nearbyUsersWithRank = nearbyUsers.map((u, index) => ({
      ...u.toObject(),
      rank: Math.max(1, userRank - 5) + index,
      isCurrentUser: u._id.toString() === userId
    }));
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          rank: userRank
        },
        nearbyUsers: nearbyUsersWithRank,
        badgeDefinitions: BADGE_DEFINITIONS
      }
    });
  } catch (error) {
    console.error('Get user leaderboard position error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user leaderboard position',
      error: error.message
    });
  }
});

module.exports = router;
