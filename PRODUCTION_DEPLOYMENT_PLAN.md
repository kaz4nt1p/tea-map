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

## Server Recovery Guide (DB + Nginx)

Follow these steps to recover the production site on a single Ubuntu server that runs PostgreSQL, Node.js services, and Nginx.

### 1) Connect and prepare the server
```bash
ssh ubuntu@<server-ip>
sudo -s
apt-get update -y
apt-get install -y curl ca-certificates gnupg ufw

# Ensure Node 18+ and PM2 or systemd are available (we use systemd below)
node -v || curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Ensure PostgreSQL client exists for restores
apt-get install -y postgresql-client
```

### 2) Retrieve application code and env
```bash
mkdir -p /opt/tea-map && cd /opt/tea-map

# Option A: Git
git clone https://github.com/<your-org>/tea-map . || git pull

# Option B: Tarball (copy from backup/CI)
# tar -xzf tea-map-<build>.tar.gz -C /opt/tea-map --strip-components=1

# Add/update production envs
cp backend/.env.production backend/.env || true
cp .env.production .env || true
```

### 3) Restore PostgreSQL database
Pick ONE of the restore sources you have available.
```bash
# 3a) From SQL dump
export DATABASE_URL="postgresql://<user>:<pass>@<host>:5432/tea_map_prod"
psql "$DATABASE_URL" -c 'SELECT 1;'  # connectivity check
pg_restore --no-owner --no-privileges -d "$DATABASE_URL" /backups/tea_map_latest.dump || \
psql "$DATABASE_URL" -f /backups/tea_map_latest.sql

# 3b) From compressed .sql.gz
gunzip -c /backups/tea_map_latest.sql.gz | psql "$DATABASE_URL"

# 3c) If DB exists but needs migrations
cd /opt/tea-map/backend
npm ci
npx prisma migrate deploy
npx prisma generate
```

### 4) Build and install app services
```bash
cd /opt/tea-map
npm ci

# Build frontend if applicable
npm run build || true

# Install backend deps
cd backend && npm ci && cd ..
```

### 5) Create systemd services
Create or update these units.
```bash
cat >/etc/systemd/system/tea-map-backend.service <<'UNIT'
[Unit]
Description=Tea Map Backend
After=network.target

[Service]
Type=simple
Environment=NODE_ENV=production
EnvironmentFile=/opt/tea-map/backend/.env
WorkingDirectory=/opt/tea-map/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
UNIT

cat >/etc/systemd/system/tea-map-frontend.service <<'UNIT'
[Unit]
Description=Tea Map Frontend (Next.js)
After=network.target

[Service]
Type=simple
Environment=NODE_ENV=production
EnvironmentFile=/opt/tea-map/.env
WorkingDirectory=/opt/tea-map
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable tea-map-backend tea-map-frontend
systemctl restart tea-map-backend tea-map-frontend
systemctl status tea-map-backend --no-pager -l || true
```

### 6) Configure Nginx reverse proxy
Adjust domains and upstream ports as needed (e.g., backend on 3002, frontend on 3000 or 3001).
```bash
apt-get install -y nginx

cat >/etc/nginx/sites-available/tea-map.conf <<'NGINX'
map $http_upgrade $connection_upgrade { default upgrade; '' close; }

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/tea-map.conf /etc/nginx/sites-enabled/tea-map.conf
nginx -t && systemctl reload nginx
```

For HTTPS, obtain certificates (e.g., with certbot) and update the server blocks to listen on 443 with `ssl_certificate` lines.

### 7) Firewall and process checks
```bash
ufw allow OpenSSH
ufw allow http
ufw allow https
ufw enable || true

curl -I http://localhost:3000 || true
curl -s http://localhost:3002/health || true
curl -I http://your-domain.com || true
curl -s https://api.your-domain.com/health || true
```

### 8) Logs and troubleshooting
```bash
journalctl -u tea-map-backend -f
journalctl -u tea-map-frontend -f
tail -n 200 /var/log/nginx/error.log
```

### 9) Rollback (quick reference)
```bash
# App rollback
cd /opt/tea-map && git reset --hard <good-commit> && systemctl restart tea-map-backend tea-map-frontend

# DB rollback (Prisma)
cd /opt/tea-map/backend && npx prisma migrate rollback
```

### 10) Post-recovery verification
- Backend health endpoint returns 200: `/health`
- Frontend loads on domain and serves assets
- DB writes/reads work (create a test entity)
- Nginx logs show 200s/no spikes in 5xx
- Error tracking and monitors green