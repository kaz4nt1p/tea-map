# Tea Map Production Deployment Plan

## 1. Pre-deployment Security Fixes

### Critical Security Issues to Address

#### 1.1 Environment Variables Security
```bash
# Current issues in backend/.env.example:
# - Default JWT secrets are visible
# - No encryption for sensitive data
# - Missing session secret randomization
```

**Action Required:**
- Generate strong, unique secrets for production
- Use environment-specific secret management
- Implement secret rotation strategy

#### 1.2 Rate Limiting Enhancement
```javascript
// Current: Basic rate limiting exists but needs production hardening
// Add to backend/server.js:
const rateLimit = require('express-rate-limit');

// API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Auth rate limiting (more restrictive)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

#### 1.3 Input Validation Enhancement
```javascript
// Add comprehensive validation middleware
// File: backend/middleware/validation.js
const Joi = require('joi');

const validateSpot = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    address: Joi.string().max(500).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
```

#### 1.4 HTTPS Enforcement
```javascript
// Add HTTPS redirect middleware
const enforceHTTPS = (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, 'https://' + req.get('host') + req.url);
  }
  next();
};

app.use(enforceHTTPS);
```

## 2. Infrastructure Requirements

### 2.1 Cloud Infrastructure Setup (AWS/DigitalOcean/Railway)

#### Option A: AWS Infrastructure
```yaml
# Infrastructure components:
- EC2 instances (t3.medium for backend, t3.small for frontend)
- RDS PostgreSQL (db.t3.micro to start)
- S3 bucket for static assets
- CloudFront CDN
- Application Load Balancer
- Route 53 for DNS
- AWS Certificate Manager for SSL
```

#### Option B: DigitalOcean App Platform (Recommended for simplicity)
```yaml
# Digital Ocean App Spec (app.yaml):
name: tea-map-app
services:
  - name: backend
    source_dir: /backend
    github:
      repo: your-username/tea-map
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
      - key: JWT_SECRET
        value: ${JWT_SECRET}
        type: SECRET
    health_check:
      http_path: /health
  
  - name: frontend
    source_dir: /
    github:
      repo: your-username/tea-map
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: NEXT_PUBLIC_BACKEND_URL
        value: ${backend.PUBLIC_URL}

databases:
  - name: tea-map-db
    engine: PG
    version: "14"
    size: db-s-dev-database
```

### 2.2 Server Requirements
```
Minimum Production Requirements:
- Backend: 1 vCPU, 2GB RAM, 25GB SSD
- Frontend: 1 vCPU, 1GB RAM, 25GB SSD
- Database: PostgreSQL 14+, 1 vCPU, 2GB RAM, 25GB SSD
- Redis (optional): 1 vCPU, 1GB RAM for session storage
```

## 3. Environment Configuration

### 3.1 Production Environment Variables

#### Backend (.env.production)
```bash
# Database
DATABASE_URL="postgresql://username:password@prod-db-host:5432/tea_map_prod"
DIRECT_URL="postgresql://username:password@prod-db-host:5432/tea_map_prod"

# JWT Secrets (Generate with: openssl rand -base64 32)
JWT_SECRET="STRONG_RANDOM_SECRET_HERE"
JWT_REFRESH_SECRET="ANOTHER_STRONG_RANDOM_SECRET_HERE"
SESSION_SECRET="SESSION_SECRET_HERE"

# Server Configuration
NODE_ENV=production
PORT=3002
FRONTEND_URL="https://your-domain.com"

# Google OAuth
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"
GOOGLE_CALLBACK_URL="https://api.your-domain.com/api/auth/google/callback"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Security
BCRYPT_ROUNDS=12
```

#### Frontend (.env.production)
```bash
# API Configuration
NEXT_PUBLIC_BACKEND_URL="https://api.your-domain.com"

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-production-google-client-id"

# Analytics (optional)
NEXT_PUBLIC_GA_ID="your-google-analytics-id"

# Feature flags
NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN=true
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false
```

### 3.2 Secret Management
```bash
# Using AWS Secrets Manager
aws secretsmanager create-secret \
  --name "tea-map/production/jwt-secret" \
  --secret-string "your-jwt-secret"

# Using environment variables in deployment platform
# Set secrets through platform UI (Railway, Vercel, etc.)
```

## 4. Database Setup

### 4.1 PostgreSQL Production Configuration
```sql
-- Production database setup
CREATE DATABASE tea_map_prod;
CREATE USER tea_map_user WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE tea_map_prod TO tea_map_user;

-- Performance optimizations
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
```

### 4.2 Database Migration Strategy
```bash
# Production migration commands
cd backend

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed initial data (if needed)
npx prisma db seed
```

### 4.3 Database Indexes for Performance
```sql
-- Add indexes for common queries
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_spots_location ON spots USING GIST(ll_to_earth(latitude, longitude));
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

## 5. CI/CD Pipeline

### 5.1 GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci
          
      - name: Run tests
        run: |
          npm test
          cd backend && npm test
          
      - name: Build frontend
        run: npm run build
        
  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        uses: digitalocean/app_action@v1
        with:
          app_name: tea-map-backend
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
          
  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 5.2 Automated Testing
```bash
# Add test scripts to package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test"
  }
}
```

## 6. Monitoring & Logging

### 6.1 Application Monitoring
```javascript
// backend/middleware/monitoring.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
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

module.exports = logger;
```

### 6.2 Health Check Endpoints
```javascript
// Add to backend/server.js
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Cloudinary connection (optional)
    // await cloudinary.api.ping();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

### 6.3 Error Tracking
```javascript
// Integration with Sentry
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Express({ app })
  ]
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

## 7. Performance Optimizations

### 7.1 Frontend Optimizations
```javascript
// next.config.js
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;
```

### 7.2 Backend Optimizations
```javascript
// Add compression middleware
const compression = require('compression');
app.use(compression());

// Database connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
});

// Response caching for static data
const cache = require('memory-cache');
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    const key = req.originalUrl || req.url;
    const cached = cache.get(key);
    
    if (cached) {
      res.json(cached);
      return;
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      cache.put(key, body, duration * 1000);
      res.sendResponse(body);
    };
    
    next();
  };
};

// Cache spots for 5 minutes
app.get('/api/spots', cacheMiddleware(300), spotController.getAllSpots);
```

### 7.3 Database Query Optimization
```javascript
// Use database connections efficiently
const getActivitiesWithOptimization = async (userId, limit = 10) => {
  return await prisma.activity.findMany({
    where: { user_id: userId },
    select: {
      id: true,
      title: true,
      description: true,
      created_at: true,
      user: {
        select: {
          username: true,
          display_name: true,
          avatar_url: true
        }
      },
      spot: {
        select: {
          name: true,
          latitude: true,
          longitude: true
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    },
    orderBy: { created_at: 'desc' },
    take: limit
  });
};
```

## 8. Backup Strategy

### 8.1 Database Backup
```bash
#!/bin/bash
# scripts/backup-db.sh

# Create backup directory
mkdir -p /backups/postgresql

# Database backup
pg_dump $DATABASE_URL > /backups/postgresql/tea_map_$(date +%Y%m%d_%H%M%S).sql

# Compress backup
gzip /backups/postgresql/tea_map_$(date +%Y%m%d_%H%M%S).sql

# Upload to S3 (optional)
aws s3 cp /backups/postgresql/tea_map_$(date +%Y%m%d_%H%M%S).sql.gz s3://tea-map-backups/

# Clean up old backups (keep last 30 days)
find /backups/postgresql -name "*.sql.gz" -mtime +30 -delete
```

### 8.2 Automated Backup Schedule
```bash
# Add to crontab
# Daily backups at 2 AM
0 2 * * * /path/to/backup-db.sh

# Weekly full backup
0 3 * * 0 /path/to/full-backup.sh
```

### 8.3 Media Backup Strategy
```javascript
// Cloudinary already provides redundancy
// But for critical media, implement additional backup
const backupMedia = async () => {
  const mediaFiles = await prisma.media.findMany({
    where: {
      created_at: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    }
  });
  
  // Download and backup to S3
  for (const media of mediaFiles) {
    // Implementation for downloading from Cloudinary and uploading to S3
  }
};
```

## 9. Security Hardening

### 9.1 Additional Security Headers
```javascript
// Enhanced helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 9.2 API Security
```javascript
// API key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};

// Apply to sensitive endpoints
app.use('/api/admin', validateApiKey);
```

### 9.3 Input Sanitization
```javascript
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');

// Prevent NoSQL injection
app.use(mongoSanitize());

// XSS protection
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    });
  }
  next();
};

app.use(sanitizeInput);
```

## 10. Go-Live Checklist

### 10.1 Pre-deployment Checklist
- [ ] **Environment Variables**: All production environment variables set
- [ ] **Database**: PostgreSQL database created and migrated
- [ ] **Secrets**: Strong, unique secrets generated for JWT and sessions
- [ ] **SSL/TLS**: HTTPS certificates configured
- [ ] **Domain**: Custom domain configured and DNS propagated
- [ ] **Cloudinary**: Production Cloudinary account configured
- [ ] **Google OAuth**: Production OAuth app configured
- [ ] **Rate Limiting**: Production-appropriate rate limits configured
- [ ] **Monitoring**: Error tracking and logging configured
- [ ] **Backups**: Automated backup system configured
- [ ] **Security Headers**: All security headers properly configured

### 10.2 Performance Checklist
- [ ] **Database Indexes**: Performance indexes created
- [ ] **Caching**: Response caching implemented where appropriate
- [ ] **Compression**: GZIP compression enabled
- [ ] **CDN**: Static assets served via CDN
- [ ] **Image Optimization**: Next.js image optimization configured
- [ ] **Bundle Analysis**: Frontend bundle size optimized

### 10.3 Post-deployment Checklist
- [ ] **Health Checks**: All health check endpoints returning 200
- [ ] **User Registration**: Test user registration flow
- [ ] **Authentication**: Test login/logout functionality
- [ ] **Spot Creation**: Test spot creation and map functionality
- [ ] **Activity Creation**: Test activity creation and feed
- [ ] **Image Upload**: Test image upload to Cloudinary
- [ ] **Mobile Responsiveness**: Test on mobile devices
- [ ] **Google OAuth**: Test Google login flow
- [ ] **Error Handling**: Test error scenarios and logging
- [ ] **Performance**: Run performance tests and optimize if needed

### 10.4 Final Deployment Commands

```bash
# 1. Build and test locally
npm run build
npm run test

# 2. Push to main branch
git add .
git commit -m "Production deployment ready"
git push origin main

# 3. Deploy backend (if using manual deployment)
cd backend
npm run start

# 4. Deploy frontend (if using manual deployment)
npm run start

# 5. Run database migrations
cd backend
npx prisma migrate deploy

# 6. Verify deployment
curl https://api.your-domain.com/health
curl https://your-domain.com
```

### 10.5 Post-Launch Monitoring
- [ ] **Error Rates**: Monitor error rates for first 24 hours
- [ ] **Performance**: Monitor response times and database performance
- [ ] **User Activity**: Monitor user registrations and activity creation
- [ ] **Security**: Monitor for unusual access patterns
- [ ] **Backups**: Verify backups are running successfully
- [ ] **Logs**: Review application logs for any issues

## Emergency Procedures

### Rollback Strategy
```bash
# Database rollback
npx prisma migrate rollback

# Application rollback
git revert HEAD
git push origin main

# Or rollback to specific commit
git reset --hard <commit-hash>
git push --force-with-lease origin main
```

### Emergency Contacts
- [ ] **Database Admin**: Contact information
- [ ] **Cloud Provider Support**: Support ticket system
- [ ] **Domain Provider**: Support contact
- [ ] **Development Team**: On-call contact information

---

## Estimated Timeline
- **Security Fixes**: 2-3 days
- **Infrastructure Setup**: 1-2 days
- **Environment Configuration**: 1 day
- **Database Setup**: 1 day
- **CI/CD Pipeline**: 1-2 days
- **Monitoring Setup**: 1 day
- **Performance Optimization**: 1-2 days
- **Security Hardening**: 1 day
- **Testing & Deployment**: 1-2 days

**Total Estimated Time**: 10-15 days

## Budget Considerations
- **Cloud Infrastructure**: $50-100/month (initially)
- **Database**: $15-30/month
- **Domain & SSL**: $10-20/year
- **Monitoring Tools**: $0-50/month
- **Backup Storage**: $5-15/month

**Total Monthly Cost**: $80-200/month (scales with usage)

---

## 11. Nginx + PM2 Deployment Strategy

### 11.1 Current Infrastructure Analysis
Based on CLAUDE.md documentation, the application was previously deployed to:
- **Production URL**: https://teamap.duckdns.org  
- **Server**: Ubuntu 22.04 VPS (77.232.139.160)
- **Process Manager**: PM2 with auto-restart on boot
- **Web Server**: Nginx with SSL/TLS termination
- **Database**: PostgreSQL with Prisma ORM

### 11.2 Required Configuration Files

#### PM2 Ecosystem Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'tea-map-backend',
      script: 'backend/server.js',
      cwd: '/var/www/tea-map',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/tea-map-backend-error.log',
      out_file: '/var/log/pm2/tea-map-backend-out.log',
      log_file: '/var/log/pm2/tea-map-backend.log',
      merge_logs: true,
      time: true
    },
    {
      name: 'tea-map-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/tea-map',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_BACKEND_URL: 'https://teamap.duckdns.org'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/tea-map-frontend-error.log',
      out_file: '/var/log/pm2/tea-map-frontend-out.log',
      log_file: '/var/log/pm2/tea-map-frontend.log',
      merge_logs: true,
      time: true
    }
  ]
};
```

#### Nginx Configuration
Create `/etc/nginx/sites-available/teamap.duckdns.org`:
```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=auth:10m rate=10r/m;

# Upstream definitions
upstream frontend {
    server 127.0.0.1:3000;
    keepalive 32;
}

upstream backend {
    server 127.0.0.1:3002;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name teamap.duckdns.org;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server configuration
server {
    listen 443 ssl http2;
    server_name teamap.duckdns.org;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/teamap.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/teamap.duckdns.org/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https:; media-src 'self' blob: data:; object-src 'none'; frame-src 'none';" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json image/svg+xml;
    
    # Client limits
    client_max_body_size 50M;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    # API routes with rate limiting
    location ^~ /api/ {
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        limit_req_status 429;
        
        # CORS headers for API
        add_header Access-Control-Allow-Origin "https://teamap.duckdns.org" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, Origin, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        # Handle preflight requests
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin "https://teamap.duckdns.org";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, Origin, X-Requested-With";
            add_header Access-Control-Allow-Credentials "true";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
        
        # Proxy to backend
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Auth routes with stricter rate limiting
    location ^~ /api/auth/ {
        limit_req zone=auth burst=5 nodelay;
        limit_req_status 429;
        
        # Proxy to backend with same config as API
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check endpoint
    location = /health {
        proxy_pass http://backend/health;
        access_log off;
    }
    
    # Static assets with long-term caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";
    }
    
    # Next.js static files
    location /_next/static/ {
        proxy_pass http://frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Frontend routes
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # Security - Block common attack patterns
    location ~* "(eval\()" { deny all; }
    location ~* "(127\.0\.0\.1)" { deny all; }
    location ~* "([a-z0-9]{2000})" { deny all; }
    location ~* "(javascript\:)(.*)(\;)" { deny all; }
    location ~* "(base64_encode)(.*)(\()" { deny all; }
    location ~* "(GLOBALS|REQUEST)(=|\[|%)" { deny all; }
    location ~* "(<|%3C).*script.*(>|%3)" { deny all; }
    location ~ /\.(?!well-known) { deny all; }
}
```

### 11.3 Deployment Script
Create `deploy.sh`:
```bash
#!/bin/bash

set -e

echo "🍵 Tea Map Production Deployment"
echo "================================"

# Configuration
DEPLOY_USER="www-data"
DEPLOY_PATH="/var/www/tea-map"
BACKUP_PATH="/var/backups/tea-map"
LOG_FILE="/var/log/deploy.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a $LOG_FILE
    exit 1
}

# Pre-deployment checks
log "Running pre-deployment checks..."

# Check if PM2 is running
if ! pm2 status > /dev/null 2>&1; then
    error "PM2 is not running or not installed"
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    error "Nginx is not running"
fi

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    error "PostgreSQL is not running"
fi

# Backup current deployment
log "Creating backup..."
if [ -d "$DEPLOY_PATH" ]; then
    sudo mkdir -p $BACKUP_PATH
    sudo tar -czf "$BACKUP_PATH/backup-$(date +%Y%m%d-%H%M%S).tar.gz" -C $DEPLOY_PATH . || error "Backup failed"
fi

# Build applications
log "Building applications..."
npm run build || error "Frontend build failed"
cd backend && npm ci --production || error "Backend dependencies installation failed"
cd ..

# Database migrations
log "Running database migrations..."
cd backend
npx prisma generate || error "Prisma client generation failed"
npx prisma migrate deploy || error "Database migration failed"
cd ..

# Deploy application files
log "Deploying application files..."
sudo mkdir -p $DEPLOY_PATH
sudo cp -r . $DEPLOY_PATH/
sudo chown -R $DEPLOY_USER:$DEPLOY_USER $DEPLOY_PATH

# Update environment configuration
log "Updating environment configuration..."
if [ -f ".env.production" ]; then
    sudo cp .env.production $DEPLOY_PATH/.env
    sudo cp .env.production $DEPLOY_PATH/backend/.env
fi

# Restart applications with PM2
log "Restarting applications..."
cd $DEPLOY_PATH

# Stop existing processes
pm2 stop ecosystem.config.js || true
pm2 delete ecosystem.config.js || true

# Start new processes
pm2 start ecosystem.config.js || error "PM2 start failed"
pm2 save || error "PM2 save failed"

# Test deployment
log "Testing deployment..."
sleep 10

# Test backend health
if ! curl -f -s http://localhost:3002/health > /dev/null; then
    error "Backend health check failed"
fi

# Test frontend
if ! curl -f -s http://localhost:3000 > /dev/null; then
    error "Frontend health check failed"
fi

# Reload Nginx configuration
log "Reloading Nginx configuration..."
sudo nginx -t || error "Nginx configuration test failed"
sudo systemctl reload nginx || error "Nginx reload failed"

# Final health check through Nginx
log "Running final health checks..."
sleep 5

if ! curl -f -s https://teamap.duckdns.org/health > /dev/null; then
    error "Final health check through Nginx failed"
fi

log "✅ Deployment completed successfully!"
log "Frontend: https://teamap.duckdns.org"
log "Backend: https://teamap.duckdns.org/api"
log "Health: https://teamap.duckdns.org/health"

# Show PM2 status
pm2 status
```

### 11.4 Environment Setup

#### Production Environment Variables
Update `backend/.env`:
```env
# Database
DATABASE_URL="postgresql://teamap_user:secure_password@localhost:5432/teamap_prod"

# Security
JWT_SECRET="generated-jwt-secret-from-setup-script"
JWT_REFRESH_SECRET="generated-refresh-secret-from-setup-script"
SESSION_SECRET="generated-session-secret-from-setup-script"

# Server
NODE_ENV=production
PORT=3002
FRONTEND_URL=https://teamap.duckdns.org

# Google OAuth
GOOGLE_CLIENT_ID="production-google-client-id"
GOOGLE_CLIENT_SECRET="production-google-client-secret"
GOOGLE_CALLBACK_URL="https://teamap.duckdns.org/api/auth/google/callback"

# Cloudinary
CLOUDINARY_CLOUD_NAME="production-cloud-name"
CLOUDINARY_API_KEY="production-api-key"
CLOUDINARY_API_SECRET="production-api-secret"
```

#### Frontend Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=https://teamap.duckdns.org
NODE_ENV=production
```

### 11.5 SSL Certificate Renewal
Create automatic SSL renewal:
```bash
# Add to crontab
0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx
```

### 11.6 Monitoring & Logging
Create log rotation configuration `/etc/logrotate.d/tea-map`:
```
/var/log/pm2/tea-map-*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
```

### 11.7 Deployment Checklist
- [ ] **Server Setup**: Ubuntu 22.04 VPS with Nginx, PM2, PostgreSQL, Node.js
- [ ] **SSL Certificates**: Let's Encrypt certificates configured and auto-renewal setup
- [ ] **Environment Files**: Production environment variables configured
- [ ] **Database**: PostgreSQL database created and migrated
- [ ] **PM2 Configuration**: Ecosystem file configured with proper logging
- [ ] **Nginx Configuration**: Reverse proxy with security headers and rate limiting
- [ ] **Firewall**: UFW configured to allow only necessary ports (22, 80, 443)
- [ ] **Monitoring**: PM2 monitoring and log rotation configured
- [ ] **Backup**: Automated backup system for database and application files
- [ ] **Health Checks**: Monitoring endpoints configured and tested

This configuration provides a production-ready deployment with enterprise-grade security, performance optimization, and monitoring capabilities using the existing VPS infrastructure.