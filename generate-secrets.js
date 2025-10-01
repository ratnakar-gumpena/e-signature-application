#!/usr/bin/env node

/**
 * Generate Secure Secrets for Production
 *
 * This script generates cryptographically secure random strings
 * for use as JWT secrets and other sensitive configuration values.
 *
 * Usage: node generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generating Secure Secrets for Production\n');
console.log('=' .repeat(60));

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('\n📝 JWT_SECRET (copy this to your .env or eb setenv):');
console.log('-'.repeat(60));
console.log(jwtSecret);

// Generate JWT Refresh Secret
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
console.log('\n📝 JWT_REFRESH_SECRET (copy this to your .env or eb setenv):');
console.log('-'.repeat(60));
console.log(jwtRefreshSecret);

// Generate example EB setenv command
console.log('\n\n🚀 AWS Elastic Beanstalk Command:');
console.log('=' .repeat(60));
console.log('\nCopy and paste this command (replace other values):');
console.log('-'.repeat(60));
console.log(`
eb setenv \\
  NODE_ENV=production \\
  PORT=8080 \\
  DATABASE_URL="postgresql://username:password@your-rds-endpoint:5432/dbname" \\
  JWT_SECRET="${jwtSecret}" \\
  JWT_EXPIRE=7d \\
  JWT_REFRESH_SECRET="${jwtRefreshSecret}" \\
  JWT_REFRESH_EXPIRE=30d \\
  AWS_REGION=us-east-1 \\
  AWS_ACCESS_KEY_ID="your-iam-access-key" \\
  AWS_SECRET_ACCESS_KEY="your-iam-secret-key" \\
  AWS_S3_BUCKET="your-bucket-name" \\
  EMAIL_HOST=smtp.gmail.com \\
  EMAIL_PORT=587 \\
  EMAIL_USER="your-email@gmail.com" \\
  EMAIL_PASSWORD="your-gmail-app-password" \\
  EMAIL_FROM="noreply@yourdomain.com" \\
  CLIENT_URL="http://your-app.elasticbeanstalk.com" \\
  BCRYPT_ROUNDS=10 \\
  RATE_LIMIT_WINDOW_MS=900000 \\
  RATE_LIMIT_MAX_REQUESTS=100 \\
  MAX_FILE_SIZE=10485760 \\
  ALLOWED_FILE_TYPES=application/pdf
`);

console.log('\n✅ Secrets generated successfully!\n');
console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('   - Never commit these secrets to version control');
console.log('   - Store them securely (password manager, AWS Secrets Manager)');
console.log('   - Use different secrets for dev/staging/production');
console.log('   - Rotate secrets periodically (every 3-6 months)');
console.log('   - Keep backup of secrets in secure location\n');

console.log('💡 TIPS:');
console.log('   - For AWS RDS endpoint: Check RDS Console → Databases → Connectivity');
console.log('   - For S3 bucket: Use unique name like "esignature-prod-COMPANY-NAME"');
console.log('   - For Gmail: Enable 2FA and generate App Password');
console.log('   - For IAM credentials: Create dedicated user with S3FullAccess only\n');

console.log('📚 NEXT STEPS:');
console.log('   1. Create AWS resources (RDS, S3, IAM user)');
console.log('   2. Replace placeholder values in the command above');
console.log('   3. Run: eb init');
console.log('   4. Run: eb create esignature-production');
console.log('   5. Run the customized eb setenv command');
console.log('   6. Run: eb ssh → cd /var/app/current → node server/database/migrate.js');
console.log('   7. Run: eb open\n');

console.log('=' .repeat(60));
console.log('\n');
