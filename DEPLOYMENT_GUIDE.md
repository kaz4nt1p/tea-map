# Production Deployment Guide

## Overview
This guide covers deploying the latest Tea Map changes to the production server with zero-downtime strategy.

## Current Production Environment
- **URL**: https://teamap.duckdns.org
- **Server**: Ubuntu 22.04 VPS (77.232.139.160)
- **Database**: PostgreSQL with Prisma ORM
- **Process Manager**: PM2 with auto-restart
- **Web Server**: Nginx with SSL termination
- **Frontend Port**: 3000
- **Backend Port**: 3002

## Latest Changes to Deploy
1. **Database Schema**: New `tea_name` field in activities table
2. **Backend API**: Enhanced stats endpoint with real tea preferences calculation
3. **Frontend Features**: 
   - Tea name field in activity forms
   - Russian language support for tea types and moods
   - Real tea preferences statistics
   - Removed settings button from profile menu

## Pre-Deployment Checklist
- [ ] Main branch is tested and stable
- [ ] Production environment variables are current
- [ ] Database backup completed
- [ ] SSL certificates are valid
- [ ] Server has sufficient disk space

## Deployment Steps

### 1. Server Access & Preparation
```bash
# SSH into production server
ssh user@77.232.139.160

# Navigate to application directory
cd /path/to/tea-map

# Create backup of current deployment
cp -r . ../tea-map-backup-$(date +%Y%m%d-%H%M%S)
```

### 2. Pull Latest Changes
```bash
# Pull latest changes from main branch
git fetch origin
git checkout main
git pull origin main

# Verify you're on the correct commit
git log --oneline -5
```

### 3. Backend Deployment
```bash
# Navigate to backend directory
cd backend

# Install/update dependencies
npm install

# Apply database schema changes (CRITICAL STEP)
npx prisma db push

# Regenerate Prisma client
npx prisma generate

# Test database connection
npx prisma db seed --preview-feature || echo "No seed file"

# Restart backend service
pm2 restart tea-map-backend

# Check backend status
pm2 status
pm2 logs tea-map-backend --lines 20
```

### 4. Frontend Deployment
```bash
# Navigate back to root directory
cd ..

# Install/update frontend dependencies
npm install

# Build production frontend
npm run build

# Restart frontend service
pm2 restart tea-map-frontend

# Check frontend status
pm2 status
pm2 logs tea-map-frontend --lines 20
```

### 5. Verify Deployment
```bash
# Check PM2 processes are running
pm2 status

# Check nginx is running
sudo systemctl status nginx

# Test backend API
curl -X GET http://localhost:3002/test-db

# Test frontend
curl -X GET http://localhost:3000
```

### 6. Browser Testing Checklist
- [ ] Site loads at https://teamap.duckdns.org
- [ ] User login works
- [ ] Activity creation form shows tea name field
- [ ] Tea preferences show real statistics (not hardcoded)
- [ ] Tea types display in Russian
- [ ] Profile dropdown doesn't show settings button
- [ ] Activity detail pages show tea names

## Environment Variables Check
Ensure these are set in production:

### Frontend (.env.local)
```bash
NEXT_PUBLIC_BACKEND_URL=https://teamap.duckdns.org
```

### Backend (.env)
```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

## Rollback Plan (if needed)
```bash
# Stop current services
pm2 stop tea-map-frontend tea-map-backend

# Restore from backup
cd ..
rm -rf tea-map
mv tea-map-backup-YYYYMMDD-HHMMSS tea-map
cd tea-map

# Restart services
pm2 start tea-map-frontend tea-map-backend

# If database changes need rollback (DANGEROUS)
# Only if absolutely necessary and you have DB backup
# psql -d tea_map -c "ALTER TABLE activities DROP COLUMN IF EXISTS tea_name;"
```

## Monitoring Commands
```bash
# Check application logs
pm2 logs

# Check specific service logs
pm2 logs tea-map-backend
pm2 logs tea-map-frontend

# Check nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check system resources
htop
df -h
free -h

# Check database connections
sudo -u postgres psql -d tea_map -c "SELECT count(*) FROM pg_stat_activity;"
```

## Database Migration Details
The new `tea_name` field is:
- **Type**: String (optional)
- **Table**: activities
- **Migration**: Additive (safe, no data loss)
- **Command**: `npx prisma db push`

## Troubleshooting

### If Backend Won't Start
```bash
# Check logs
pm2 logs tea-map-backend

# Check database connection
npx prisma db pull

# Restart with fresh logs
pm2 delete tea-map-backend
pm2 start "npm run start" --name "tea-map-backend"
```

### If Frontend Won't Start
```bash
# Check build errors
npm run build

# Check logs
pm2 logs tea-map-frontend

# Restart with fresh logs
pm2 delete tea-map-frontend  
pm2 start "npm run start" --name "tea-map-frontend"
```

### If Database Issues
```bash
# Check Prisma schema
npx prisma validate

# Check database status
sudo systemctl status postgresql

# Reconnect to database
npx prisma generate
npx prisma db push
```

## Success Criteria
✅ **Deployment is successful when:**
- Both PM2 processes show "online" status
- Site loads without errors at https://teamap.duckdns.org
- Users can log in and create activities
- Tea name field appears in activity forms
- Tea preferences show real percentages
- No 500 errors in nginx or application logs

## Estimated Deployment Time
- **Preparation**: 5 minutes
- **Database migration**: 2 minutes  
- **Backend deployment**: 3 minutes
- **Frontend deployment**: 5 minutes
- **Testing & verification**: 10 minutes
- **Total**: ~25 minutes

## Important Notes
⚠️ **Critical Steps:**
1. **Always run `npx prisma db push`** before restarting backend
2. **Check PM2 status** after each restart
3. **Monitor logs** for the first 10 minutes after deployment
4. **Test core functionality** before declaring success

📝 **Documentation:**
- Update this file with any deployment issues encountered
- Note any environment-specific configurations discovered
- Keep record of successful deployment times/dates