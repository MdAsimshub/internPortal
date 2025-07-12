const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job reference is required']
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Applicant reference is required']
  },
  status: {
    type: String,
    enum: ['Applied', 'Reviewing', 'Reviewed', 'Shortlisted', 'Interviewed', 'Selected', 'Rejected'],
    default: 'Applied'
  },
  
  // Application details
  coverLetter: {
    type: String,
    maxlength: [1000, 'Cover letter cannot exceed 1000 characters']
  },
  resume: {
    type: String, // URL to resume file
    required: [true, 'Resume is required']
  },
  additionalDocuments: [{
    name: String,
    url: String
  }],
  
  // Custom answers
  customAnswers: [{
    question: String,
    answer: String
  }],
  
  // Referral information
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Application tracking
  viewedByEmployer: {
    type: Boolean,
    default: false
  },
  viewedAt: {
    type: Date
  },
  
  // Interview details
  interviewDetails: {
    scheduledAt: Date,
    interviewType: {
      type: String,
      enum: ['Phone', 'Video', 'In-person', 'Online Test']
    },
    location: String,
    meetingLink: String,
    notes: String
  },
  
  // Feedback
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    providedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    providedAt: Date
  },
  
  // Withdrawal
  isWithdrawn: {
    type: Boolean,
    default: false
  },
  withdrawnAt: {
    type: Date
  },
  withdrawalReason: {
    type: String,
    maxlength: [500, 'Withdrawal reason cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one application per user per job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });

// Virtual for application duration
applicationSchema.virtual('applicationAge').get(function() {
  const now = new Date();
  const applied = new Date(this.createdAt);
  const diffTime = now - applied;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware
applicationSchema.pre('save', function(next) {
  // Set viewedAt when status changes from Applied
  if (this.isModified('status') && this.status !== 'Applied' && !this.viewedAt) {
    this.viewedAt = new Date();
    this.viewedByEmployer = true;
  }
  
  // Set withdrawal timestamp
  if (this.isModified('isWithdrawn') && this.isWithdrawn) {
    this.withdrawnAt = new Date();
  }
  
  next();
});

// Static method to get application statistics
applicationSchema.statics.getApplicationStats = function(userId) {
  return this.aggregate([
    { $match: { applicant: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get job application statistics
applicationSchema.statics.getJobStats = function(jobId) {
  return this.aggregate([
    { $match: { job: mongoose.Types.ObjectId(jobId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Method to update status with notification
applicationSchema.methods.updateStatus = async function(newStatus, feedback = null) {
  this.status = newStatus;
  
  if (feedback) {
    this.feedback = {
      ...feedback,
      providedAt: new Date()
    };
  }
  
  await this.save();
  
  // Here you could add notification logic
  return this;
};

// Method to withdraw application
applicationSchema.methods.withdraw = function(reason) {
  this.isWithdrawn = true;
  this.withdrawalReason = reason;
  this.withdrawnAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Application', applicationSchema);
