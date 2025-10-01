# AWS Deployment Pre-Flight Checklist

Complete this checklist before deploying to AWS Elastic Beanstalk.

---

## 🔧 Local Development Setup

- [ ] Application runs successfully locally (`npm run dev`)
- [ ] All features tested and working
- [ ] No console errors in browser
- [ ] API endpoints responding correctly
- [ ] Database migrations completed locally
- [ ] File uploads working (local storage)
- [ ] Email service tested (if configured)

---

## 📦 AWS Account & Tools

### AWS Account
- [ ] AWS account created and active
- [ ] Billing alerts configured
- [ ] Credit card added and verified
- [ ] Free tier limits understood

### Required Tools
- [ ] AWS CLI installed (`aws --version`)
- [ ] AWS CLI configured (`aws configure`)
- [ ] EB CLI installed (`eb --version`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Git installed and working

---

## 🗄️ AWS Resources Setup

### 1. RDS PostgreSQL Database
- [ ] Database instance created
- [ ] Instance type selected: `db.t3.micro` (free tier) or `db.t3.small`
- [ ] PostgreSQL version: 13+ selected
- [ ] Master username noted: ________________
- [ ] Master password saved securely: ________________
- [ ] Database name created: `esignature_db`
- [ ] Endpoint URL noted: ________________
- [ ] Port: 5432 (default)
- [ ] Publicly accessible: No (recommended)
- [ ] VPC and subnet configured
- [ ] Security group created and noted: ________________
- [ ] Automated backups enabled
- [ ] Backup retention: 7 days (minimum)
- [ ] Multi-AZ: Optional (production recommended)

**RDS Endpoint Format:**
```
your-db-instance.abc123xyz.us-east-1.rds.amazonaws.com
```

**Connection String Format:**
```
postgresql://username:password@endpoint:5432/esignature_db
```

### 2. S3 Bucket
- [ ] Bucket created with unique name: ________________
- [ ] Region: us-east-1 (or same as EB)
- [ ] Versioning enabled (recommended)
- [ ] Public access: Blocked (default)
- [ ] Bucket policy: Not needed (IAM user will have access)
- [ ] Lifecycle policy configured (optional)

**S3 Bucket Name:** `esignature-documents-prod-[YOUR-COMPANY]`

### 3. IAM User for S3 Access
- [ ] IAM user created: ________________
- [ ] Access type: Programmatic access
- [ ] Policy attached: AmazonS3FullAccess
- [ ] Access Key ID saved: ________________
- [ ] Secret Access Key saved: ________________
- [ ] Keys stored securely (password manager)

⚠️ **IMPORTANT**: Never commit AWS keys to git!

---

## 🔐 Environment Variables

### Generated Secrets
- [ ] JWT_SECRET generated (run `node generate-secrets.js`)
- [ ] JWT_REFRESH_SECRET generated
- [ ] Secrets stored securely

### Email Configuration
- [ ] Email service chosen: [ ] Gmail [ ] AWS SES [ ] Other
- [ ] Gmail: 2FA enabled
- [ ] Gmail: App password generated
- [ ] Email credentials tested

### All Environment Variables Prepared
- [ ] NODE_ENV=production
- [ ] PORT=8080
- [ ] DATABASE_URL (full connection string)
- [ ] JWT_SECRET (64+ characters)
- [ ] JWT_EXPIRE=7d
- [ ] JWT_REFRESH_SECRET (64+ characters)
- [ ] JWT_REFRESH_EXPIRE=30d
- [ ] AWS_REGION=us-east-1
- [ ] AWS_ACCESS_KEY_ID (IAM user key)
- [ ] AWS_SECRET_ACCESS_KEY (IAM user secret)
- [ ] AWS_S3_BUCKET (bucket name)
- [ ] EMAIL_HOST
- [ ] EMAIL_PORT
- [ ] EMAIL_USER
- [ ] EMAIL_PASSWORD
- [ ] EMAIL_FROM
- [ ] CLIENT_URL (will be EB URL)
- [ ] BCRYPT_ROUNDS=10
- [ ] RATE_LIMIT_WINDOW_MS=900000
- [ ] RATE_LIMIT_MAX_REQUESTS=100
- [ ] MAX_FILE_SIZE=10485760
- [ ] ALLOWED_FILE_TYPES=application/pdf

**Template for `eb setenv` command prepared:** [ ]

---

## 🚀 Elastic Beanstalk Setup

### Initialization
- [ ] Run `eb init` from project root
- [ ] Region selected: us-east-1 (or your region)
- [ ] Application name: esignature-app
- [ ] Platform: Node.js
- [ ] Platform version: Node.js 18 running on 64bit Amazon Linux 2
- [ ] CodeCommit: No
- [ ] SSH keypair: Yes (for debugging)

### Environment Creation
- [ ] Run `eb create esignature-production`
- [ ] Instance type: t3.small (or t3.micro for testing)
- [ ] Environment name confirmed: esignature-production
- [ ] Load balancer type: Application Load Balancer
- [ ] Deployment successful (check logs)

---

## 🔗 Security Groups Configuration

### RDS Security Group
- [ ] Inbound rule added for PostgreSQL (port 5432)
- [ ] Source: EB environment security group
- [ ] Protocol: TCP
- [ ] Port range: 5432

**How to find EB security group:**
```bash
eb status
# Look for "Security groups:" in output
```

### EB Security Group
- [ ] Inbound rule: HTTP (80) from anywhere
- [ ] Inbound rule: HTTPS (443) from anywhere (if SSL configured)
- [ ] Outbound rules: All traffic allowed

---

## 📊 Database Migration

### Test Connection
- [ ] SSH into EB instance: `eb ssh`
- [ ] Navigate to app: `cd /var/app/current`
- [ ] Test DB connection:
```bash
node -e "const { pool } = require('./server/config/database'); pool.query('SELECT NOW()').then(r => console.log(r.rows[0])).catch(e => console.error(e))"
```

### Run Migrations
- [ ] Connected to EB instance via SSH
- [ ] Navigated to `/var/app/current`
- [ ] Ran: `node server/database/migrate.js`
- [ ] Migrations successful (no errors)
- [ ] Tables created verified:
  - [ ] users
  - [ ] templates
  - [ ] documents
  - [ ] recipients
  - [ ] signatures

---

## 🧪 Testing & Verification

### Application Health
- [ ] Health check passing: `eb health`
- [ ] Application accessible: `eb open`
- [ ] Homepage loads correctly
- [ ] No console errors in browser

### Feature Testing
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads
- [ ] Template upload works (S3)
- [ ] PDF displays correctly
- [ ] Signature placement works
- [ ] Document creation works
- [ ] Email sending works (if configured)
- [ ] Document signing flow works
- [ ] Signed PDF generation works
- [ ] File download works

### API Testing
- [ ] Health endpoint: `https://your-app.com/health`
- [ ] API endpoints responding
- [ ] JWT authentication working
- [ ] File uploads to S3 working
- [ ] Database queries working

---

## 📈 Monitoring Setup

### CloudWatch
- [ ] Log groups created automatically
- [ ] Logs visible in CloudWatch console
- [ ] Test log streaming: `eb logs --stream`

### Alarms (Recommended)
- [ ] CPU utilization alarm (>80%)
- [ ] Memory utilization alarm (>80%)
- [ ] Environment health alarm
- [ ] HTTP 5xx error alarm
- [ ] Database connection alarm

---

## 🔒 Security Hardening

### SSL/HTTPS (Recommended for Production)
- [ ] SSL certificate requested (AWS Certificate Manager)
- [ ] Certificate validated (DNS or email)
- [ ] Load balancer listener added (HTTPS, port 443)
- [ ] Certificate attached to listener
- [ ] HTTP to HTTPS redirect configured
- [ ] CLIENT_URL updated to https://

### Domain Configuration (Optional)
- [ ] Domain purchased
- [ ] Route 53 hosted zone created
- [ ] A record pointing to EB environment
- [ ] DNS propagated and working
- [ ] CLIENT_URL updated to custom domain

---

## 💰 Cost Optimization

### Development Environment
- [ ] Using t3.micro instances (cheapest)
- [ ] Single instance (no load balancer for dev)
- [ ] RDS: db.t3.micro
- [ ] Terminate when not in use

### Production Environment
- [ ] Right-sized instances selected
- [ ] Auto-scaling configured
- [ ] Minimum instances: 1
- [ ] Maximum instances: 3-5
- [ ] RDS: db.t3.small (minimum for production)
- [ ] S3 lifecycle policy configured

### Monitoring
- [ ] Billing alerts set up
- [ ] Budget configured in AWS Budgets
- [ ] Cost Explorer enabled

---

## 📝 Documentation

### Internal Documentation
- [ ] AWS account details documented
- [ ] Resource names and IDs documented
- [ ] Environment variables documented (securely)
- [ ] Deployment process documented
- [ ] Rollback procedure documented

### Team Access
- [ ] IAM users created for team members
- [ ] Permissions assigned appropriately
- [ ] MFA enabled for all users
- [ ] Access keys rotated regularly

---

## 🔄 Backup & Recovery

### Database Backups
- [ ] Automated backups enabled (RDS)
- [ ] Backup window configured (off-hours)
- [ ] Backup retention: 7+ days
- [ ] Manual snapshot created
- [ ] Restore tested (optional but recommended)

### S3 Backups
- [ ] Versioning enabled
- [ ] Lifecycle policy for old versions
- [ ] Cross-region replication (optional)

### Disaster Recovery Plan
- [ ] Recovery Time Objective (RTO) defined
- [ ] Recovery Point Objective (RPO) defined
- [ ] Disaster recovery steps documented
- [ ] Recovery tested (recommended)

---

## 🎯 Go-Live Checklist

### Pre-Launch
- [ ] All features tested thoroughly
- [ ] Load testing performed (optional)
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Team trained on deployment process

### Launch
- [ ] Application deployed successfully
- [ ] All integrations working
- [ ] Monitoring active
- [ ] Alerts configured
- [ ] On-call schedule established
- [ ] Communication plan ready

### Post-Launch
- [ ] Monitor for 24-48 hours closely
- [ ] Check error rates
- [ ] Verify user registrations working
- [ ] Check email delivery
- [ ] Monitor resource utilization
- [ ] Document any issues and resolutions

---

## ✅ Final Verification

Run through this final checklist:

- [ ] Application accessible at production URL
- [ ] All core features working
- [ ] No errors in application logs
- [ ] Database queries performing well
- [ ] S3 uploads/downloads working
- [ ] Email notifications sending
- [ ] SSL certificate valid (if configured)
- [ ] CloudWatch logs flowing
- [ ] Alarms configured and active
- [ ] Backup process verified
- [ ] Team has access
- [ ] Documentation complete
- [ ] Support plan in place

---

## 🆘 Emergency Contacts

Fill in your team's contact information:

**Primary Contact:** _____________________ (Phone: _______________)
**Secondary Contact:** _____________________ (Phone: _______________)
**AWS Account Owner:** _____________________ (Email: _______________)
**Database Admin:** _____________________ (Phone: _______________)
**DevOps Lead:** _____________________ (Phone: _______________)

**AWS Support Plan:** [ ] Developer [ ] Business [ ] Enterprise

**Emergency Procedures Document:** _____________________ (link/location)

---

## 📞 Support Resources

- **AWS Support:** https://console.aws.amazon.com/support/
- **AWS Service Health Dashboard:** https://status.aws.amazon.com/
- **Application Logs:** `eb logs` or CloudWatch Console
- **Team Slack/Communication Channel:** _____________________

---

## 🎉 Ready to Deploy!

Once all items are checked, you're ready to deploy to production!

**Deployment Command:**
```bash
eb deploy
```

**Monitor Deployment:**
```bash
eb logs --stream
```

**Verify Deployment:**
```bash
eb open
```

---

**Good luck with your deployment! 🚀**

*Remember: You can always rollback to a previous version if needed:*
```bash
eb appversion  # List versions
eb deploy --version [version-label]  # Deploy specific version
```
