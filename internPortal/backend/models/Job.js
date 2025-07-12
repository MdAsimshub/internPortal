const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['Internship', 'Full-time', 'Part-time', 'Contract', 'Freelance']
  },
  workType: {
    type: String,
    required: [true, 'Work type is required'],
    enum: ['Remote', 'In-office', 'Hybrid']
  },
  stipend: {
    type: Number,
    required: [true, 'Stipend/Salary is required'],
    min: [0, 'Stipend cannot be negative']
  },
  deadline: {
    type: Date,
    required: [true, 'Application deadline is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  domain: {
    type: String,
    required: [true, 'Domain is required'],
    trim: true
  },
  
  // Job requirements
  requirements: [{
    type: String,
    trim: true
  }],
  qualifications: [{
    type: String,
    trim: true
  }],
  
  // Location
  location: {
    type: String,
    trim: true
  },
  
  // Contact information
  contactEmail: {
    type: String,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  contactPhone: {
    type: String,
    trim: true
  },
  
  // Posted by
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Closed'],
    default: 'Active'
  },
  
  // Statistics
  applicants: {
    type: Number,
    default: 0,
    min: 0
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Application settings
  maxApplications: {
    type: Number,
    min: 1
  },
  
  // Featured job
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // External application link
  externalLink: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
jobSchema.index({ status: 1, deadline: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ domain: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ tags: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ title: 'text', description: 'text', company: 'text' }); // Text search

// Virtual for days remaining
jobSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Virtual for application status
jobSchema.virtual('isExpired').get(function() {
  return new Date() > new Date(this.deadline);
});

// Pre-save middleware to update status if expired
jobSchema.pre('save', function(next) {
  if (this.isExpired && this.status === 'Active') {
    this.status = 'Closed';
  }
  next();
});

// Method to increment view count
jobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment applicant count
jobSchema.methods.incrementApplicants = function() {
  this.applicants += 1;
  return this.save();
};

// Static method to get active jobs
jobSchema.statics.getActiveJobs = function() {
  return this.find({
    status: 'Active',
    deadline: { $gt: new Date() }
  }).populate('postedBy', 'name email');
};

// Static method to search jobs
jobSchema.statics.searchJobs = function(query) {
  return this.find({
    $text: { $search: query },
    status: 'Active',
    deadline: { $gt: new Date() }
  }, {
    score: { $meta: 'textScore' }
  }).sort({
    score: { $meta: 'textScore' }
  }).populate('postedBy', 'name email');
};

module.exports = mongoose.model('Job', jobSchema);
