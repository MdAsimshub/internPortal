const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  university: {
    type: String,
    required: function() {
      return this.role === 'student';
    },
    trim: true
  },
  avatar: {
    type: String,
    default: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  
  // Gamification fields
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  badges: [{
    type: String,
    enum: ['Campus Recruiter', 'Top Helper', 'Networking Pro', 'Early Bird']
  }],
  
  // Statistics
  applications: {
    type: Number,
    default: 0,
    min: 0
  },
  posts: {
    type: Number,
    default: 0,
    min: 0
  },
  referrals: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Profile fields
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  skills: [{
    type: String,
    trim: true
  }],
  resume: {
    type: String // URL to resume file
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for rank (calculated based on XP)
userSchema.virtual('rank').get(function() {
  // This will be calculated dynamically in queries
  return this._rank || 0;
});

// Index for better query performance
// userSchema.index({ email: 1 }); // Removed duplicate index - unique: true already creates this
userSchema.index({ xp: -1 }); // For leaderboard queries
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to calculate level based on XP
userSchema.methods.calculateLevel = function() {
  this.level = Math.floor(this.xp / 350) + 1;
  return this.level;
};

// Method to add XP and update level
userSchema.methods.addXP = function(points) {
  this.xp += points;
  this.calculateLevel();
  return this.save();
};

// Method to check and award badges
userSchema.methods.checkBadges = function() {
  const newBadges = [];
  
  // Campus Recruiter: Posted 5+ opportunities
  if (this.posts >= 5 && !this.badges.includes('Campus Recruiter')) {
    newBadges.push('Campus Recruiter');
  }
  
  // Top Helper: Referred 8+ students
  if (this.referrals >= 8 && !this.badges.includes('Top Helper')) {
    newBadges.push('Top Helper');
  }
  
  // Networking Pro: Applied to 10+ positions
  if (this.applications >= 10 && !this.badges.includes('Networking Pro')) {
    newBadges.push('Networking Pro');
  }
  
  if (newBadges.length > 0) {
    this.badges.push(...newBadges);
    return this.save();
  }
  
  return Promise.resolve(this);
};

module.exports = mongoose.model('User', userSchema);
