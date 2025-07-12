const express = require('express');
const { body, query } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// XP reward constants
const XP_REWARDS = {
  apply: 50,
  post: 100,
  referral: 75,
  selected: 200
};

// @route   GET /api/users/profile/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/', authenticateToken, authorize('admin'), [
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
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term must not be empty')
], handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { role, search } = req.query;
    
    // Build query
    const query = {};
    if (role) query.role = role;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { university: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        users,
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
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id/status
// @desc    Update user status (admin only)
// @access  Private (Admin)
router.put('/:id/status', authenticateToken, authorize('admin'), [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value')
], handleValidationErrors, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
});

// @route   POST /api/users/award-xp
// @desc    Award XP to user
// @access  Private
router.post('/award-xp', authenticateToken, [
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('action')
    .isIn(['apply', 'post', 'referral', 'selected'])
    .withMessage('Invalid action type'),
  body('points')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Points must be a positive integer')
], handleValidationErrors, async (req, res) => {
  try {
    const { userId, action, points } = req.body;
    const targetUserId = userId || req.user.id;
    
    // Check if user can award XP to others (admin only)
    if (userId && req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const xpToAward = points || XP_REWARDS[action];
    const oldLevel = user.level;
    
    await user.addXP(xpToAward);
    await user.checkBadges();
    
    const leveledUp = user.level > oldLevel;
    
    res.status(200).json({
      success: true,
      message: `Awarded ${xpToAward} XP for ${action}`,
      data: {
        user,
        awarded: xpToAward,
        leveledUp,
        newLevel: user.level
      }
    });
  } catch (error) {
    console.error('Award XP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error awarding XP',
      error: error.message
    });
  }
});

// @route   PUT /api/users/stats/:action
// @desc    Update user statistics
// @access  Private
router.put('/stats/:action', authenticateToken, async (req, res) => {
  try {
    const { action } = req.params;
    const validActions = ['applications', 'posts', 'referrals'];
    
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action type'
      });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Increment the stat
    user[action] += 1;
    await user.save();
    await user.checkBadges();
    
    res.status(200).json({
      success: true,
      message: `${action} count updated successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating statistics',
      error: error.message
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', authenticateToken, [
  query('q')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query is required'),
  query('role')
    .optional()
    .isIn(['student', 'admin'])
    .withMessage('Role must be either student or admin')
], handleValidationErrors, async (req, res) => {
  try {
    const { q, role } = req.query;
    
    const query = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { university: { $regex: q, $options: 'i' } }
      ]
    };
    
    if (role) query.role = role;
    
    const users = await User.find(query)
      .select('name email university avatar role xp level badges')
      .limit(20)
      .sort({ xp: -1 });
    
    res.status(200).json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private (Admin)
router.delete('/:id', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent deleting yourself
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

module.exports = router;
