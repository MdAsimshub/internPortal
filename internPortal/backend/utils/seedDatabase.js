const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// Mock data for seeding the database
const mockUsers = [
  {
    name: "Alex Johnson",
    email: "alex@student.edu",
    password: "password123",
    role: "student",
    university: "Stanford University",
    xp: 2850,
    level: 8,
    badges: ["Campus Recruiter", "Top Helper", "Networking Pro"],
    applications: 15,
    posts: 8,
    referrals: 12,
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  },
  {
    name: "Sarah Chen",
    email: "sarah@student.edu",
    password: "password123",
    role: "student",
    university: "MIT",
    xp: 2650,
    level: 7,
    badges: ["Top Helper", "Early Bird"],
    applications: 12,
    posts: 6,
    referrals: 10,
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  },
  {
    name: "Mike Rodriguez",
    email: "mike@student.edu",
    password: "password123",
    role: "student",
    university: "UC Berkeley",
    xp: 2400,
    level: 7,
    badges: ["Networking Pro"],
    applications: 10,
    posts: 5,
    referrals: 8,
    avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  },
  {
    name: "Admin User",
    email: "admin@asim.edu",
    password: "admin123",
    role: "admin",
    xp: 1000,
    level: 3,
    badges: [],
    applications: 0,
    posts: 0,
    referrals: 0
  }
];

const mockJobs = [
  {
    title: "Software Engineering Intern",
    company: "TechCorp",
    description: "Join our team as a software engineering intern and work on cutting-edge web applications using modern technologies like React, Node.js, and MongoDB.",
    duration: "3 months",
    type: "Internship",
    workType: "Hybrid",
    stipend: 25000,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    tags: ["React", "Node.js", "JavaScript", "MongoDB"],
    domain: "Technology",
    requirements: [
      "Currently pursuing Computer Science degree",
      "Experience with JavaScript and React",
      "Knowledge of Node.js and databases"
    ],
    qualifications: [
      "Strong problem-solving skills",
      "Good communication skills",
      "Ability to work in a team"
    ],
    location: "San Francisco, CA",
    contactEmail: "hr@techcorp.com",
    status: "Active"
  },
  {
    title: "Data Science Intern",
    company: "DataLab",
    description: "Work with our data science team to analyze large datasets and build machine learning models for predictive analytics.",
    duration: "6 months",
    type: "Internship",
    workType: "Remote",
    stipend: 30000,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    tags: ["Python", "Machine Learning", "Data Analysis", "AI"],
    domain: "Data Science",
    requirements: [
      "Statistics or Computer Science background",
      "Experience with Python and pandas",
      "Knowledge of machine learning algorithms"
    ],
    qualifications: [
      "Strong analytical thinking",
      "Experience with data visualization",
      "Familiarity with SQL"
    ],
    location: "Boston, MA",
    contactEmail: "careers@datalab.com",
    status: "Active"
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/asim_platform');
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log('🧹 Cleared existing data');
    
    // Create users
    const createdUsers = [];
    for (const userData of mockUsers) {
      const user = new User(userData);
      user.calculateLevel(); // Calculate level based on XP
      await user.save();
      createdUsers.push(user);
    }
    console.log(`👥 Created ${createdUsers.length} users`);
    
    // Create jobs (assign to admin user)
    const adminUser = createdUsers.find(user => user.role === 'admin');
    const createdJobs = [];
    for (const jobData of mockJobs) {
      const job = new Job({
        ...jobData,
        postedBy: adminUser._id
      });
      await job.save();
      createdJobs.push(job);
    }
    console.log(`💼 Created ${createdJobs.length} jobs`);
    
    // Create some sample applications
    const studentUsers = createdUsers.filter(user => user.role === 'student');
    const applications = [];
    
    for (let i = 0; i < Math.min(studentUsers.length, createdJobs.length); i++) {
      const application = new Application({
        job: createdJobs[i % createdJobs.length]._id,
        applicant: studentUsers[i]._id,
        status: ['Applied', 'Reviewing', 'Reviewed'][Math.floor(Math.random() * 3)],
        coverLetter: "I am very interested in this position and believe my skills align well with your requirements.",
        resume: "https://example.com/resume.pdf"
      });
      await application.save();
      applications.push(application);
    }
    console.log(`📋 Created ${applications.length} applications`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Jobs: ${createdJobs.length}`);
    console.log(`   Applications: ${applications.length}`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Student: alex@student.edu / password123');
    console.log('   Admin: admin@asim.edu / admin123');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  seedDatabase();
}

module.exports = seedDatabase;
