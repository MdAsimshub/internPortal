# Production Deployment Guide for ASIM Backend

## Critical Security & Performance Fixes Needed

### 1. Environment Variables Security
```bash
# Current .env has exposed credentials - NEVER commit this to git
# Create separate .env files for different environments

# .env.production (example)
NODE_ENV=production
PORT=8080
JWT_SECRET=super_complex_random_256_bit_key_here
JWT_EXPIRE=24h
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/asim_production
FRONTEND_URL=https://yourdomain.com
```

### 2. Add Missing Production Middleware

#### Add to server.js:
```javascript
// Add before existing middleware
if (process.env.NODE_ENV === 'production') {
  // Trust first proxy
  app.set('trust proxy', 1);
  
  // Stricter CORS for production
  const corsOptions = {
    origin: [process.env.FRONTEND_URL],
    credentials: true,
    optionsSuccessStatus: 200
  };
  
  // More restrictive rate limiting for production
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, // Reduce from 100 to 50
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
}

// Add request timeout
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 seconds
  next();
});
```

### 3. Enhanced Error Handling
```javascript
// Add to global error handler in server.js
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: 'Internal server error'
    });
  }
  
  // Rest of existing error handling...
});
```

### 4. Add Production Logging
```javascript
// Add to server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'asim-backend' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 5. Database Optimizations

#### Fix User.js index warning:
```javascript
// In models/User.js, remove duplicate index
// Either remove this line:
// email: { type: String, unique: true, ... }
// OR remove this line:
// userSchema.index({ email: 1 });
```

#### Add connection pool settings:
```javascript
// In server.js MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### 6. Add Health Monitoring
```javascript
// Enhanced health check in server.js
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    
    res.status(200).json({
      success: true,
      message: 'ASIM Backend API is running!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: dbStatus,
      uptime: process.uptime(),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB'
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service unavailable'
    });
  }
});
```

## Deployment Checklist

### Pre-deployment:
- [ ] Environment variables secured
- [ ] Database indexes optimized
- [ ] Rate limiting configured for production load
- [ ] Error handling doesn't leak sensitive info
- [ ] CORS restricted to production domain
- [ ] Logging system implemented
- [ ] Health checks configured

### Infrastructure:
- [ ] Use process manager (PM2, Docker, or similar)
- [ ] Set up reverse proxy (Nginx)
- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring (New Relic, DataDog, etc.)
- [ ] Configure automated backups for MongoDB
- [ ] Set up CI/CD pipeline

### Security:
- [ ] Regular security updates
- [ ] Implement API versioning
- [ ] Add request/response compression
- [ ] Implement proper session management
- [ ] Add API documentation (Swagger)
- [ ] Set up vulnerability scanning

### Performance:
- [ ] Database connection pooling
- [ ] Implement caching (Redis)
- [ ] Add database query optimization
- [ ] Set up CDN for static assets
- [ ] Configure load balancing if needed

## Recommended Production Stack:
- **Server**: AWS EC2, Google Cloud, or DigitalOcean
- **Database**: MongoDB Atlas (already configured)
- **Process Manager**: PM2
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt
- **Monitoring**: PM2 Monitor or DataDog
- **Logging**: Winston + CloudWatch/LogDNA

## Quick Production Start:
```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
# ecosystem.config.js:
module.exports = {
  apps: [{
    name: 'asim-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    }
  }]
};

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```
