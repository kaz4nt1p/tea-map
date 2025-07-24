# Tea Map Production Deployment Guide

## 🚀 Quick Start

The Tea Map application is now ready for production deployment! Follow this guide to deploy your social tea activity platform.

## 📋 Pre-Deployment Checklist

### ✅ Security Fixes Completed
- [x] Fixed hardcoded JWT secrets
- [x] Fixed session secret exposure  
- [x] Removed Cloudinary config logging
- [x] Added authentication to file upload endpoints

### 🔧 Environment Setup
- [ ] Run `./scripts/setup-production-env.sh` to generate production secrets
- [ ] Update database connection strings in `.env.production`
- [ ] Configure Cloudinary account and update credentials
- [ ] Set up production domain and update CORS settings

### 🏗️ Infrastructure Setup
- [ ] Choose deployment platform (recommended: DigitalOcean App Platform)
- [ ] Set up production PostgreSQL database
- [ ] Configure domain and SSL certificates
- [ ] Set up monitoring and logging

## 🏢 Recommended Infrastructure

### Option 1: DigitalOcean App Platform (Recommended)
**Why**: Easiest deployment, automatic scaling, built-in monitoring

**Cost**: ~$12/month for basic setup
- App Platform: $5/month (Basic plan)
- Managed PostgreSQL: $7/month (Basic plan)

**Setup Steps**:
1. Create DigitalOcean account
2. Use App Platform to deploy from GitHub
3. Create Managed PostgreSQL database
4. Configure environment variables

### Option 2: AWS (Advanced)
**Why**: More control, enterprise features

**Cost**: ~$20-50/month depending on usage
- EC2 t3.micro: $8/month
- RDS PostgreSQL: $15/month
- ALB: $16/month

## 📦 Deployment Steps

### 1. Generate Production Secrets
```bash
cd /Users/mihailkazacnev/tea-map
./scripts/setup-production-env.sh
```

### 2. Set Up Database
```bash
# Create production database
createdb tea_map_prod

# Run migrations
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 3. Deploy Frontend (Next.js)
```bash
cd /Users/mihailkazacnev/tea-map
npm run build
npm start
```

### 4. Deploy Backend (Node.js)
```bash
cd backend
npm install --production
npm run start
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        npm install
        cd backend && npm install
        
    - name: Run tests
      run: |
        npm test
        cd backend && npm test
        
    - name: Build application
      run: npm run build
      
    - name: Deploy to DigitalOcean
      # Add your deployment steps here
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- Backend: `GET /health`
- Frontend: Built-in Next.js health checks

### Monitoring Setup
1. Set up Uptime Robot for availability monitoring
2. Configure log aggregation (LogRocket, Datadog)
3. Set up error tracking (Sentry)

## 🔒 Security Hardening

### SSL/TLS
- Enable HTTPS redirects
- Configure HSTS headers
- Use secure cookie settings

### Rate Limiting
- Implement rate limiting on all endpoints
- Configure DDoS protection
- Set up request size limits

### Security Headers
```javascript
// Enhanced helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 💾 Backup Strategy

### Database Backups
- Daily automated backups
- Point-in-time recovery enabled
- Cross-region backup storage

### Media Backups
- Cloudinary handles media backups automatically
- Consider additional backup to S3 for critical images

## 🚨 Emergency Procedures

### Rollback Plan
1. Keep previous version deployed
2. Database migration rollback scripts
3. Quick environment variable updates

### Incident Response
1. Monitor error rates and response times
2. Set up alerts for critical failures
3. Maintain incident communication plan

## 📈 Performance Optimization

### Frontend
- Enable Next.js image optimization
- Configure CDN for static assets
- Implement service worker for caching

### Backend
- Database query optimization
- Redis caching for frequently accessed data
- Connection pooling for PostgreSQL

### Database
```sql
-- Recommended indexes
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_spot_id ON activities(spot_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_spots_latitude_longitude ON spots(latitude, longitude);
```

## 📋 Go-Live Checklist

### Pre-Launch
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates active
- [ ] Domain DNS configured
- [ ] Monitoring alerts configured
- [ ] Backup systems tested
- [ ] Load testing completed

### Launch Day
- [ ] Deploy to production
- [ ] Verify all endpoints working
- [ ] Test user registration/login
- [ ] Test image upload functionality
- [ ] Test activity creation
- [ ] Monitor error rates
- [ ] Check performance metrics

### Post-Launch
- [ ] Monitor for 24 hours
- [ ] Check logs for errors
- [ ] Verify backup systems
- [ ] Update documentation
- [ ] Plan first maintenance window

## 🆘 Support & Maintenance

### Regular Tasks
- Weekly security updates
- Monthly database maintenance
- Quarterly performance reviews
- Annual security audits

### Contact Information
- DevOps Team: [contact info]
- Database Admin: [contact info]
- Security Team: [contact info]

---

## 🎯 Success Metrics

Track these KPIs post-deployment:
- User registration rate
- Activity creation rate
- Image upload success rate
- Average response time
- Error rate
- Uptime percentage

**Target SLAs**:
- 99.9% uptime
- < 500ms average response time
- < 1% error rate

---

*This deployment guide was generated as part of the Tea Map production readiness review.*