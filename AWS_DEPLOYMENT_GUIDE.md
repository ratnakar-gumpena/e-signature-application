# AWS Elastic Beanstalk - Quick Deployment Guide

## Quick Start Commands

### Initial Setup (One-time)

```bash
# 1. Install EB CLI
pip install awsebcli --upgrade --user

# 2. Configure AWS credentials
aws configure

# 3. Initialize Elastic Beanstalk
eb init

# 4. Create environment
eb create esignature-production --instance-type t3.small

# 5. Set environment variables (replace with your values)
eb setenv \
  NODE_ENV=production \
  DATABASE_URL="postgresql://user:pass@rds-endpoint:5432/dbname" \
  JWT_SECRET="your-secret" \
  AWS_REGION=us-east-1 \
  AWS_ACCESS_KEY_ID="your-key" \
  AWS_SECRET_ACCESS_KEY="your-secret" \
  AWS_S3_BUCKET="your-bucket" \
  EMAIL_HOST=smtp.gmail.com \
  EMAIL_USER="your-email@gmail.com" \
  EMAIL_PASSWORD="your-app-password" \
  CLIENT_URL="http://your-app.elasticbeanstalk.com"

# 6. Run database migrations
eb ssh
cd /var/app/current
node server/database/migrate.js
exit

# 7. Open application
eb open
```

## Daily Deployment Workflow

```bash
# 1. Make code changes
# 2. Test locally
npm run dev

# 3. Deploy to AWS
eb deploy

# 4. Check logs
eb logs

# 5. Open application
eb open
```

## Common Commands

```bash
# View logs
eb logs
eb logs --stream

# Check status
eb status
eb health

# View environment variables
eb printenv

# Update environment variable
eb setenv KEY=value

# Restart application
eb restart

# SSH into instance
eb ssh

# Scale instances
eb scale 3

# Terminate environment (WARNING: destructive!)
eb terminate esignature-production
```

## AWS Resources Checklist

Before deployment, ensure you have:

- [ ] **RDS PostgreSQL Database**
  - Created and running
  - Security group configured
  - Endpoint URL noted
  - Master credentials saved

- [ ] **S3 Bucket**
  - Created with unique name
  - Region matches EB region
  - Versioning enabled (optional)

- [ ] **IAM User**
  - Created with programmatic access
  - AmazonS3FullAccess policy attached
  - Access Key ID saved
  - Secret Access Key saved

- [ ] **Email Service**
  - Gmail app password generated (or SMTP configured)
  - Email credentials ready

## Environment Variables Template

Copy this template and fill in your values:

```bash
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/dbname
JWT_SECRET=generate-random-64-char-string
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=generate-random-64-char-string
JWT_REFRESH_EXPIRE=30d
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
AWS_S3_BUCKET=your-bucket-name
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
CLIENT_URL=http://your-app.elasticbeanstalk.com
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf
```

## Generate Secure Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Create AWS Resources via CLI

### Create S3 Bucket
```bash
aws s3 mb s3://esignature-documents-prod --region us-east-1
aws s3api put-bucket-versioning --bucket esignature-documents-prod --versioning-configuration Status=Enabled
```

### Create RDS Database (Basic)
```bash
aws rds create-db-instance \
  --db-instance-identifier esignature-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username esignature_admin \
  --master-user-password YourSecurePassword123 \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-name esignature_db \
  --backup-retention-period 7 \
  --region us-east-1
```

## Configure RDS Security Group

```bash
# Get EB environment's security group ID
eb status

# Add inbound rule to RDS security group
aws ec2 authorize-security-group-ingress \
  --group-id sg-rds-xxxxx \
  --protocol tcp \
  --port 5432 \
  --source-group sg-eb-xxxxx \
  --region us-east-1
```

## Troubleshooting

### Application Health Issues
```bash
# Check logs for errors
eb logs

# Check environment health
eb health --refresh

# Restart application
eb restart
```

### Database Connection Issues
```bash
# Test connection from EB instance
eb ssh
cd /var/app/current
node -e "const { pool } = require('./server/config/database'); pool.query('SELECT NOW()').then(r => console.log('Connected:', r.rows[0])).catch(e => console.error('Error:', e))"
```

### File Upload Issues
```bash
# Verify S3 credentials
eb printenv | grep AWS

# Test S3 access
eb ssh
cd /var/app/current
node -e "const { s3 } = require('./server/config/aws'); s3.listBuckets((err, data) => { if (err) console.error(err); else console.log('Buckets:', data.Buckets); })"
```

### Build Failures
```bash
# Check build logs
eb logs

# Common issues:
# - Missing dependencies in package.json
# - Build script errors
# - Memory limit exceeded during build

# Increase instance size if memory issues:
eb scale --instance-type t3.medium
```

## Production Pre-flight Checklist

- [ ] All environment variables set correctly
- [ ] Database migrations completed
- [ ] S3 bucket configured and accessible
- [ ] Email service tested
- [ ] SSL certificate configured (if using custom domain)
- [ ] Security groups properly configured
- [ ] CloudWatch alarms set up
- [ ] Backup strategy in place
- [ ] Monitoring and logging enabled
- [ ] Error tracking configured
- [ ] CORS properly configured
- [ ] Rate limiting appropriate for load
- [ ] Load testing completed
- [ ] Disaster recovery plan documented

## Cost Estimates (US East 1)

### Development/Testing
- **EB Instance**: t3.micro (~$7.50/month)
- **RDS**: db.t3.micro (~$15/month)
- **S3**: ~$0.50/month (10GB storage)
- **Data Transfer**: ~$5/month
- **Total**: ~$28/month

### Production (Small)
- **EB Instances**: 2x t3.small (~$30/month)
- **RDS**: db.t3.small (~$30/month)
- **S3**: ~$2/month (50GB storage)
- **Data Transfer**: ~$20/month
- **Load Balancer**: ~$20/month
- **Total**: ~$102/month

## Monitoring and Alerts

### Set Up CloudWatch Alarms

```bash
# High CPU usage alarm
aws cloudwatch put-metric-alarm \
  --alarm-name esignature-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# Application health alarm
aws cloudwatch put-metric-alarm \
  --alarm-name esignature-health \
  --alarm-description "Alert on application health issues" \
  --metric-name EnvironmentHealth \
  --namespace AWS/ElasticBeanstalk \
  --statistic Average \
  --period 60 \
  --threshold 15 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

## Backup and Recovery

### Database Backups
```bash
# Enable automated backups (if not already)
aws rds modify-db-instance \
  --db-instance-identifier esignature-db \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00"

# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier esignature-db \
  --db-snapshot-identifier esignature-db-manual-snapshot-$(date +%Y%m%d)
```

### S3 Backups
```bash
# Enable versioning (if not already)
aws s3api put-bucket-versioning \
  --bucket esignature-documents-prod \
  --versioning-configuration Status=Enabled

# Set lifecycle policy for old versions
aws s3api put-bucket-lifecycle-configuration \
  --bucket esignature-documents-prod \
  --lifecycle-configuration file://s3-lifecycle-policy.json
```

## Scaling Guidelines

### When to Scale Up
- CPU usage consistently > 70%
- Memory usage consistently > 80%
- Response times increasing
- Request queue building up

### How to Scale
```bash
# Horizontal scaling (more instances)
eb scale 3

# Vertical scaling (bigger instances)
eb scale --instance-type t3.medium

# Auto-scaling (via console)
# Configuration → Capacity → Auto Scaling
# Set min/max instances and triggers
```

## Support and Resources

- **AWS EB Documentation**: https://docs.aws.amazon.com/elasticbeanstalk/
- **AWS Support**: https://console.aws.amazon.com/support/
- **EB CLI Reference**: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html
- **Pricing Calculator**: https://calculator.aws/

## Emergency Contacts

Add your team's emergency contact information:

- **DevOps Lead**: [Name] - [Email] - [Phone]
- **AWS Account Owner**: [Name] - [Email]
- **Database Admin**: [Name] - [Email]
- **On-call Engineer**: [Rotation schedule/contact]
