<db_password># ASIM Backend

Backend API server for the ASIM (Student Placement Platform) application built with Node.js, Express.js, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Student and admin user roles with profile management
- **Job Management**: CRUD operations for job postings with search and filtering
- **Application System**: Job application workflow with status tracking
- **Gamification**: XP system, levels, badges, and leaderboards
- **File Upload**: Support for resume and document uploads
- **Email Notifications**: Optional email system for status updates
- **Rate Limiting**: API rate limiting for security
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Centralized error handling with proper HTTP status codes

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer with Cloudinary integration
- **Email**: Nodemailer
- **Environment**: dotenv

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd asim/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_super_secret_jwt_key
   MONGODB_URI=mongodb://localhost:27017/asim_platform
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

5. **Seed the database** (optional):
   ```bash
   npm run seed
   ```

6. **Start the server**:
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000` by default.

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| GET | `/auth/me` | Get current user | Private |
| PUT | `/auth/update-profile` | Update user profile | Private |
| PUT | `/auth/change-password` | Change password | Private |
| POST | `/auth/logout` | Logout user | Private |

### User Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/users` | Get all users | Admin |
| GET | `/users/profile/:id` | Get user profile | Public |
| PUT | `/users/:id/status` | Update user status | Admin |
| POST | `/users/award-xp` | Award XP to user | Private |
| GET | `/users/search` | Search users | Private |
| DELETE | `/users/:id` | Delete user | Admin |

### Job Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/jobs` | Get all jobs (with filters) | Public |
| GET | `/jobs/:id` | Get single job | Public |
| POST | `/jobs` | Create new job | Private |
| PUT | `/jobs/:id` | Update job | Private (Owner/Admin) |
| DELETE | `/jobs/:id` | Delete job | Private (Owner/Admin) |
| GET | `/jobs/user/:userId` | Get jobs by user | Public |
| GET | `/jobs/stats/overview` | Get job statistics | Admin |

### Application Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/applications` | Apply for job | Student |
| GET | `/applications` | Get user applications | Private |
| GET | `/applications/job/:jobId` | Get job applications | Private (Owner/Admin) |
| GET | `/applications/:id` | Get single application | Private |
| PUT | `/applications/:id/status` | Update application status | Private (Owner/Admin) |
| PUT | `/applications/:id/withdraw` | Withdraw application | Student |
| GET | `/applications/stats/user` | Get user app stats | Private |
| DELETE | `/applications/:id` | Delete application | Admin |

### Leaderboard

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/leaderboard` | Get leaderboard | Public |
| GET | `/leaderboard/top` | Get top performers | Public |
| GET | `/leaderboard/university/:university` | University leaderboard | Public |
| GET | `/leaderboard/stats` | Leaderboard statistics | Public |
| GET | `/leaderboard/user/:userId` | User position | Public |

## Data Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['student', 'admin'],
  university: String,
  avatar: String,
  xp: Number,
  level: Number,
  badges: [String],
  applications: Number,
  posts: Number,
  referrals: Number,
  bio: String,
  skills: [String],
  resume: String,
  isActive: Boolean,
  emailVerified: Boolean,
  lastLogin: Date
}
```

### Job Schema
```javascript
{
  title: String,
  company: String,
  description: String,
  duration: String,
  type: ['Internship', 'Full-time', 'Part-time', 'Contract', 'Freelance'],
  workType: ['Remote', 'In-office', 'Hybrid'],
  stipend: Number,
  deadline: Date,
  tags: [String],
  domain: String,
  requirements: [String],
  qualifications: [String],
  location: String,
  contactEmail: String,
  contactPhone: String,
  postedBy: ObjectId,
  status: ['Active', 'Inactive', 'Closed'],
  applicants: Number,
  views: Number,
  isFeatured: Boolean
}
```

### Application Schema
```javascript
{
  job: ObjectId,
  applicant: ObjectId,
  status: ['Applied', 'Reviewing', 'Reviewed', 'Shortlisted', 'Interviewed', 'Selected', 'Rejected'],
  coverLetter: String,
  resume: String,
  customAnswers: [{ question: String, answer: String }],
  referredBy: ObjectId,
  viewedByEmployer: Boolean,
  feedback: {
    rating: Number,
    comments: String,
    providedBy: ObjectId,
    providedAt: Date
  },
  isWithdrawn: Boolean,
  withdrawalReason: String
}
```

## Gamification System

### XP Rewards
- **Apply for job**: 50 XP
- **Post a job**: 100 XP
- **Successful referral**: 75 XP
- **Get selected**: 200 XP

### Badge System
- **Campus Recruiter**: Posted 5+ opportunities
- **Top Helper**: Referred 8+ students
- **Networking Pro**: Applied to 10+ positions
- **Early Bird**: First 50 platform users

### Level Calculation
Level = floor(XP / 350) + 1

## Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Seed database with sample data
npm run seed

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/asim_platform |
| `FRONTEND_URL` | Frontend application URL | http://localhost:5173 |
| `EMAIL_HOST` | SMTP host for emails | - |
| `EMAIL_PORT` | SMTP port | 587 |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASS` | SMTP password | - |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - |

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password hashing
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Prevents API abuse
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Environment Variables**: Sensitive data protection

## Error Handling

The API uses consistent error response format:

```javascript
{
  success: false,
  message: "Error description",
  errors?: ["Detailed error messages"]
}
```

HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## Development

### Project Structure
```
backend/
├── models/           # Database models
├── routes/           # API routes
├── middleware/       # Custom middleware
├── utils/           # Utility functions
├── .env.example     # Environment template
├── server.js        # Main server file
└── package.json     # Dependencies and scripts
```

### Adding New Features

1. **Model**: Define schema in `/models`
2. **Routes**: Create route handlers in `/routes`
3. **Middleware**: Add custom middleware in `/middleware`
4. **Validation**: Add validation rules using express-validator
5. **Tests**: Write tests for new functionality

## Deployment

### Production Setup

1. **Environment**: Set `NODE_ENV=production`
2. **Database**: Use production MongoDB instance
3. **Secrets**: Use strong JWT secret and secure passwords
4. **HTTPS**: Enable SSL/TLS
5. **Process Manager**: Use PM2 or similar
6. **Monitoring**: Set up logging and monitoring

### Docker Support

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Email: support@asim.edu
- Documentation: [Link to docs]
- Issues: [GitHub Issues]
