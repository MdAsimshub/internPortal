export const mockUsers = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@student.edu",
    role: "student",
    university: "Stanford University",
    xp: 2850,
    level: 8,
    rank: 1,
    badges: ["Campus Recruiter", "Top Helper", "Networking Pro"],
    applications: 15,
    posts: 8,
    referrals: 12,
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  },
  {
    id: 2,
    name: "Sarah Chen",
    email: "sarah@student.edu", 
    role: "student",
    university: "MIT",
    xp: 2650,
    level: 7,
    rank: 2,
    badges: ["Top Helper", "Early Bird"],
    applications: 12,
    posts: 6,
    referrals: 10,
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  },
  {
    id: 3,
    name: "Mike Rodriguez",
    email: "mike@student.edu",
    role: "student", 
    university: "UC Berkeley",
    xp: 2400,
    level: 7,
    rank: 3,
    badges: ["Networking Pro"],
    applications: 10,
    posts: 5,
    referrals: 8,
    avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily@student.edu",
    role: "student",
    university: "Harvard University",
    xp: 2200,
    level: 6,
    rank: 4,
    badges: ["Early Bird"],
    applications: 8,
    posts: 4,
    referrals: 6,
    avatar: "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  },
  {
    id: 5,
    name: "David Kim",
    email: "david@company.com",
    role: "admin",
    company: "TechCorp",
    avatar: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
  }
];

export const mockJobs = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "TechStart Inc.",
    description: "Join our dynamic team to build cutting-edge web applications using React and modern technologies.",
    duration: "3 months",
    type: "Internship",
    workType: "Remote",
    stipend: 15000,
    deadline: "2024-12-15",
    tags: ["React", "JavaScript", "Frontend", "Web Development"],
    domain: "Technology",
    postedBy: 5,
    postedDate: "2024-01-10",
    applicants: 45,
    status: "Active"
  },
  {
    id: 2,
    title: "Data Science Intern",
    company: "DataCorp",
    description: "Work on real-world machine learning projects and gain hands-on experience with big data.",
    duration: "6 months", 
    type: "Internship",
    workType: "In-office",
    stipend: 25000,
    deadline: "2024-12-20",
    tags: ["Python", "Machine Learning", "Data Analysis", "AI"],
    domain: "Data Science",
    postedBy: 5,
    postedDate: "2024-01-08",
    applicants: 62,
    status: "Active"
  },
  {
    id: 3,
    title: "Full Stack Developer",
    company: "InnovateLab",
    description: "Full-time position for experienced developers to work on scalable web applications.",
    duration: "Permanent",
    type: "Full-time",
    workType: "Hybrid",
    stipend: 80000,
    deadline: "2024-12-25",
    tags: ["Node.js", "React", "MongoDB", "Full Stack"],
    domain: "Technology",
    postedBy: 1,
    postedDate: "2024-01-12",
    applicants: 28,
    status: "Active"
  },
  {
    id: 4,
    title: "UI/UX Design Intern",
    company: "DesignStudio",
    description: "Create beautiful and intuitive user interfaces for mobile and web applications.",
    duration: "4 months",
    type: "Internship", 
    workType: "Remote",
    stipend: 18000,
    deadline: "2024-12-18",
    tags: ["Figma", "UI/UX", "Design", "Prototyping"],
    domain: "Design",
    postedBy: 2,
    postedDate: "2024-01-09",
    applicants: 35,
    status: "Active"
  },
  {
    id: 5,
    title: "Mobile App Developer",
    company: "AppTech Solutions",
    description: "Develop native mobile applications for iOS and Android platforms.",
    duration: "Permanent",
    type: "Full-time",
    workType: "In-office",
    stipend: 75000,
    deadline: "2024-12-30",
    tags: ["React Native", "iOS", "Android", "Mobile"],
    domain: "Technology",
    postedBy: 3,
    postedDate: "2024-01-11",
    applicants: 22,
    status: "Active"
  },
  {
    id: 6,
    title: "Marketing Intern",
    company: "GrowthHacker Co.",
    description: "Support digital marketing campaigns and learn growth hacking techniques.",
    duration: "3 months",
    type: "Internship",
    workType: "Hybrid",
    stipend: 12000,
    deadline: "2024-12-22",
    tags: ["Digital Marketing", "SEO", "Content", "Analytics"],
    domain: "Marketing",
    postedBy: 4,
    postedDate: "2024-01-13",
    applicants: 18,
    status: "Active"
  }
];

export const mockApplications = [
  {
    id: 1,
    jobId: 1,
    userId: 1,
    status: "Selected",
    appliedDate: "2024-01-15",
    lastUpdated: "2024-01-20"
  },
  {
    id: 2,
    jobId: 2,
    userId: 1,
    status: "Reviewed",
    appliedDate: "2024-01-16",
    lastUpdated: "2024-01-18"
  },
  {
    id: 3,
    jobId: 4,
    userId: 1,
    status: "Applied",
    appliedDate: "2024-01-17",
    lastUpdated: "2024-01-17"
  },
  {
    id: 4,
    jobId: 1,
    userId: 2,
    status: "Reviewed", 
    appliedDate: "2024-01-14",
    lastUpdated: "2024-01-19"
  },
  {
    id: 5,
    jobId: 3,
    userId: 2,
    status: "Applied",
    appliedDate: "2024-01-18",
    lastUpdated: "2024-01-18"
  }
];

export const badgeDefinitions = {
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

export const xpRewards = {
  apply: 50,
  post: 100,
  referral: 75,
  selected: 200
};