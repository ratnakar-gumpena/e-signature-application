# AWS Elastic Beanstalk Deployment - Troubleshooting Guide

This guide helps you resolve common issues when deploying and running the e-signature application on AWS Elastic Beanstalk.

---

## 🔍 General Debugging Steps

Whenever you encounter an issue:

1. **Check application logs:**
   ```bash
   eb logs
   eb logs --stream  # Real-time logs
   ```

2. **Check environment health:**
   ```bash
   eb health
   eb status
   ```

3. **View environment variables:**
   ```bash
   eb printenv
   ```

4. **SSH into instance:**
   ```bash
   eb ssh
   ```

---

## ❌ Deployment Failures

### Issue: "ERROR: Cannot setup Environment, validation error"

**Possible Causes:**
- Invalid environment name
- Instance type not available in region
- Insufficient permissions

**Solutions:**
```bash
# Use valid environment name (alphanumeric and hyphens only)
eb create my-app-prod --instance-type t3.small

# Check available instance types
aws ec2 describe-instance-types --region us-east-1

# Verify IAM permissions
aws sts get-caller-identity
```

---

### Issue: "Failed to build the application"

**Possible Causes:**
- Missing dependencies
- Build script errors
- Memory limit exceeded

**Solutions:**
1. **Check package.json scripts:**
   ```json
   "postinstall": "npm run build && cd server && npm install"
   ```

2. **Test build locally:**
   ```bash
   cd client
   npm install
   npm run build
   ```

3. **Check EB logs:**
   ```bash
   eb logs | grep -i error
   ```

4. **Increase instance size if memory issue:**
   ```bash
   eb scale --instance-type t3.medium
   ```

---

### Issue: "Application version failed to deploy"

**Possible Causes:**
- Procfile missing or incorrect
- .ebextensions configuration errors
- Port configuration issues

**Solutions:**
1. **Verify Procfile exists and is correct:**
   ```
   web: node server/server.js
   ```

2. **Check .ebextensions syntax:**
   ```bash
   # Validate YAML syntax
   yamllint .ebextensions/*.config
   ```

3. **Ensure PORT is 8080:**
   ```javascript
   const PORT = process.env.PORT || 8080;
   ```

---

## 🗄️ Database Connection Issues

### Issue: "ECONNREFUSED" or "Connection timeout"

**Possible Causes:**
- RDS security group not configured
- Wrong DATABASE_URL
- RDS instance not running

**Solutions:**
1. **Verify DATABASE_URL is set:**
   ```bash
   eb printenv | grep DATABASE_URL
   ```

2. **Check RDS security group:**
   - Go to RDS Console → Your database → Connectivity & security
   - Click on VPC security group
   - Inbound rules should allow PostgreSQL (5432) from EB security group

3. **Test connection from EB instance:**
   ```bash
   eb ssh
   cd /var/app/current
   node -e "const { pool } = require('./server/config/database'); pool.query('SELECT NOW()').then(r => console.log('Connected:', r.rows[0])).catch(e => console.error('Error:', e))"
   ```

4. **Add EB security group to RDS:**
   ```bash
   # Get EB security group ID
   eb status | grep "Security groups"

   # Add inbound rule to RDS security group
   aws ec2 authorize-security-group-ingress \
     --group-id sg-rds-xxxxx \
     --protocol tcp \
     --port 5432 \
     --source-group sg-eb-xxxxx
   ```

---

### Issue: "password authentication failed"

**Possible Causes:**
- Wrong username or password
- Special characters in password not encoded

**Solutions:**
1. **URL encode password if it contains special characters:**
   ```javascript
   // Node.js
   const encodedPassword = encodeURIComponent('P@ssw0rd!');
   console.log(encodedPassword); // P%40ssw0rd%21
   ```

2. **Update DATABASE_URL with encoded password:**
   ```bash
   eb setenv DATABASE_URL="postgresql://user:encoded_password@endpoint:5432/dbname"
   ```

3. **Verify credentials in RDS Console:**
   - Go to RDS Console → Your database
   - Check master username
   - Reset password if needed

---

### Issue: "SSL connection required"

**Possible Causes:**
- RDS requires SSL but SSL not configured

**Solutions:**
The application already handles this, but verify:

```javascript
// server/config/database.js should have:
ssl: process.env.NODE_ENV === 'production' ? {
  rejectUnauthorized: false
} : false
```

If still issues, try:
```bash
eb setenv DATABASE_URL="postgresql://user:pass@endpoint:5432/dbname?ssl=true"
```

---

## 📦 S3 Upload Issues

### Issue: "Access Denied" when uploading files

**Possible Causes:**
- IAM credentials not set or incorrect
- IAM user lacks S3 permissions
- Bucket name wrong

**Solutions:**
1. **Verify AWS credentials are set:**
   ```bash
   eb printenv | grep AWS
   ```

2. **Test S3 access from EB instance:**
   ```bash
   eb ssh
   cd /var/app/current
   node -e "const { s3 } = require('./server/config/aws'); s3.listBuckets((err, data) => { if (err) console.error('Error:', err); else console.log('Buckets:', data.Buckets.map(b => b.Name)); })"
   ```

3. **Verify IAM user policy:**
   - Go to IAM Console → Users → Your user
   - Check attached policies
   - Should have AmazonS3FullAccess or custom policy

4. **Test bucket access:**
   ```bash
   aws s3 ls s3://your-bucket-name
   ```

5. **Verify bucket name:**
   ```bash
   eb printenv | grep AWS_S3_BUCKET
   ```

---

### Issue: "Bucket does not exist"

**Possible Causes:**
- Bucket not created
- Wrong bucket name
- Bucket in different region

**Solutions:**
1. **List your S3 buckets:**
   ```bash
   aws s3 ls
   ```

2. **Create bucket if missing:**
   ```bash
   aws s3 mb s3://your-bucket-name --region us-east-1
   ```

3. **Update environment variable:**
   ```bash
   eb setenv AWS_S3_BUCKET="your-correct-bucket-name"
   ```

---

## 🌐 Application Not Accessible

### Issue: "502 Bad Gateway"

**Possible Causes:**
- Application crashed
- Application not listening on correct port
- Health check failing

**Solutions:**
1. **Check application logs:**
   ```bash
   eb logs | tail -50
   ```

2. **Verify PORT configuration:**
   ```javascript
   // Should be 8080 for EB
   const PORT = process.env.PORT || 8080;
   ```

3. **Check health endpoint:**
   ```bash
   eb ssh
   curl http://localhost:8080/health
   ```

4. **Restart application:**
   ```bash
   eb restart
   ```

---

### Issue: "504 Gateway Timeout"

**Possible Causes:**
- Slow database queries
- External API timeout
- Memory/CPU overload

**Solutions:**
1. **Check resource utilization:**
   ```bash
   eb health
   ```

2. **Increase instance size:**
   ```bash
   eb scale --instance-type t3.medium
   ```

3. **Optimize slow queries:**
   ```bash
   # SSH and check logs
   eb ssh
   cd /var/app/current
   grep -i "query" /var/log/nodejs/nodejs.log
   ```

---

### Issue: React routes return 404

**Possible Causes:**
- Static file serving not configured
- Catch-all route missing

**Solutions:**
Verify server.js has this code:
```javascript
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}
```

Redeploy:
```bash
eb deploy
```

---

## 📧 Email Not Sending

### Issue: "Invalid login" with Gmail

**Possible Causes:**
- Using regular password instead of App Password
- 2FA not enabled
- Less secure apps blocked

**Solutions:**
1. **Enable 2FA on Gmail account**
2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy 16-character password

3. **Update environment variable:**
   ```bash
   eb setenv EMAIL_PASSWORD="your-16-char-app-password"
   ```

---

### Issue: "Connection timeout" with SMTP

**Possible Causes:**
- Outbound port 587 blocked
- Wrong SMTP host

**Solutions:**
1. **Verify email configuration:**
   ```bash
   eb printenv | grep EMAIL
   ```

2. **Test SMTP from EB instance:**
   ```bash
   eb ssh
   telnet smtp.gmail.com 587
   ```

3. **Try alternative port (465 SSL):**
   ```bash
   eb setenv EMAIL_PORT=465
   ```

---

## 🔐 Authentication Issues

### Issue: "JWT malformed" or "invalid token"

**Possible Causes:**
- JWT_SECRET not set or changed
- Token expired
- Token format incorrect

**Solutions:**
1. **Verify JWT_SECRET is set:**
   ```bash
   eb printenv | grep JWT_SECRET
   ```

2. **Ensure JWT_SECRET wasn't changed after users logged in**
   - If changed, all users need to re-login

3. **Check token expiration:**
   ```bash
   eb printenv | grep JWT_EXPIRE
   ```

---

## 🔧 Environment Variable Issues

### Issue: Environment variables not updating

**Possible Causes:**
- Need to restart application
- Typo in variable name
- Quotes not handled correctly

**Solutions:**
1. **Restart after setting variables:**
   ```bash
   eb setenv KEY=value
   eb restart
   ```

2. **Verify variable was set:**
   ```bash
   eb printenv | grep KEY
   ```

3. **For values with spaces or special characters:**
   ```bash
   eb setenv JWT_SECRET="value with spaces"
   # or
   eb setenv JWT_SECRET='value with special $chars'
   ```

---

## 💾 Memory Issues

### Issue: "JavaScript heap out of memory"

**Possible Causes:**
- Instance too small
- Memory leak
- Large file processing

**Solutions:**
1. **Increase instance size:**
   ```bash
   eb scale --instance-type t3.medium
   ```

2. **Increase Node.js memory limit:**
   Edit `.ebextensions/nodecommand.config`:
   ```yaml
   option_settings:
     aws:elasticbeanstalk:container:nodejs:
       NodeCommand: "node --max-old-space-size=2048 server/server.js"
   ```

3. **Check for memory leaks:**
   ```bash
   eb ssh
   top
   # Look for node processes using excessive memory
   ```

---

## 📊 Performance Issues

### Issue: Slow response times

**Possible Causes:**
- Database queries not optimized
- No database indexes
- Instance undersized
- No connection pooling

**Solutions:**
1. **Add database indexes (if needed):**
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_documents_user_id ON documents(user_id);
   ```

2. **Monitor database performance:**
   - Go to RDS Console → Your database → Monitoring
   - Check CPU, connections, query performance

3. **Scale up instances:**
   ```bash
   eb scale 3  # Horizontal scaling
   ```

4. **Verify connection pooling:**
   Check `server/config/database.js` uses connection pool

---

## 🔄 Deployment Best Practices

### Issue: Want to test before deploying to production

**Solutions:**
Create a staging environment:
```bash
# Create staging environment
eb create esignature-staging --instance-type t3.micro

# Set staging env vars
eb setenv NODE_ENV=staging [other vars] --environment esignature-staging

# Deploy to staging
eb deploy esignature-staging

# Test staging
eb open esignature-staging

# Deploy to production only after testing
eb deploy esignature-production
```

---

## 🆘 Emergency Procedures

### Application is down and users are affected

1. **Check health:**
   ```bash
   eb health
   ```

2. **Check recent changes:**
   ```bash
   eb appversion
   ```

3. **Rollback to previous version:**
   ```bash
   eb appversion  # Get version label
   eb deploy --version previous-version-label
   ```

4. **Monitor rollback:**
   ```bash
   eb logs --stream
   ```

5. **Verify application is up:**
   ```bash
   eb open
   ```

---

### Database is corrupted or data lost

1. **Stop application** (prevent more writes):
   ```bash
   eb terminate esignature-production
   ```

2. **Restore from RDS snapshot:**
   - Go to RDS Console → Snapshots
   - Select most recent snapshot
   - Click "Restore snapshot"
   - Create new database instance

3. **Update DATABASE_URL** to new instance

4. **Redeploy application:**
   ```bash
   eb create esignature-production
   eb setenv DATABASE_URL="new-rds-endpoint"
   ```

---

## 📞 Getting Help

### AWS Support
- **Support Center:** https://console.aws.amazon.com/support/
- **Service Health:** https://status.aws.amazon.com/

### Community Resources
- **AWS Forums:** https://forums.aws.amazon.com/
- **Stack Overflow:** Tag `aws-elastic-beanstalk`
- **AWS re:Post:** https://repost.aws/

### Useful AWS CLI Commands

```bash
# Describe EB environment
aws elasticbeanstalk describe-environments \
  --environment-names esignature-production

# View EB events
aws elasticbeanstalk describe-events \
  --environment-name esignature-production \
  --max-records 50

# Check RDS status
aws rds describe-db-instances \
  --db-instance-identifier your-db-name

# Test S3 access
aws s3 ls s3://your-bucket-name

# View CloudWatch logs
aws logs tail /aws/elasticbeanstalk/esignature-production/var/log/nodejs/nodejs.log --follow
```

---

## 🔍 Debug Mode

Enable verbose logging temporarily:

```bash
# Set log level
eb setenv LOG_LEVEL=debug

# Add console logging in server.js
console.log('Environment:', process.env.NODE_ENV);
console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('S3 Bucket:', process.env.AWS_S3_BUCKET);

# Redeploy and check logs
eb deploy
eb logs --stream
```

Remember to disable debug mode in production after troubleshooting!

---

## ✅ Preventive Measures

To avoid issues:

1. **Always test locally first**
2. **Use staging environment**
3. **Enable CloudWatch alarms**
4. **Set up automated backups**
5. **Monitor application health regularly**
6. **Keep credentials secure**
7. **Document all configuration changes**
8. **Have rollback plan ready**
9. **Test disaster recovery procedures**
10. **Keep dependencies updated**

---

**Still having issues?** Check the logs first:
```bash
eb logs | less
```

Most issues can be diagnosed from the logs. Look for:
- Error messages
- Stack traces
- Connection failures
- Missing environment variables
- Permission errors
