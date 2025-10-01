# E-Signature Application

A complete web application for creating PDF templates, configuring signature placements, and collecting electronic signatures.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Template Management**: Upload PDF templates and configure signature field placements
- **Visual Signature Editor**: Drag-and-drop interface for placing signature fields
- **Document Sending**: Send documents to multiple recipients with unique signing links
- **E-Signing**: Public signing pages with signature canvas, date fields, and text inputs
- **Dashboard**: Track document status and manage sent/received documents
- **Email Notifications**: Automatic emails for signing requests and completions
- **PDF Processing**: Automatically add signatures to PDFs and generate audit trails
- **Cloud Storage**: AWS S3 integration for secure document storage

## Tech Stack

### Backend
- Node.js & Express.js
- PostgreSQL database
- JWT authentication
- AWS S3 for file storage
- pdf-lib for PDF manipulation
- Nodemailer for emails

### Frontend
- React 18+ with hooks
- React Router v6
- Tailwind CSS
- react-pdf for PDF viewing
- signature_pad for drawing signatures
- Axios for API calls

## Prerequisites

- Node.js 16+ and npm
- PostgreSQL 12+
- AWS account with S3 bucket
- Email account (Gmail recommended) for sending emails

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd esignature-app
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, client)
npm run install-all
```

### 3. Set up PostgreSQL database

Create a new PostgreSQL database:

```bash
createdb esignature_db
```

### 4. Configure environment variables

Copy `.env.example` to `.env` in the root directory and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/esignature_db

# JWT
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRE=7d

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=esignature-documents

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=noreply@esignature.com

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### 5. Run database migrations

```bash
npm run migrate
```

Or manually:

```bash
cd server
node database/migrate.js
```

### 6. Start the application

Development mode (runs both frontend and backend):

```bash
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### 7. Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/health

## Usage Guide

### 1. Register an Account

- Navigate to http://localhost:3000/register
- Create an account with email and password
- You'll be automatically logged in

### 2. Upload a Template

- Go to Templates page
- Click "Upload Template"
- Select a PDF file
- Give it a name and description

### 3. Configure Signature Placements

- Open the template
- Click "Edit Placements"
- Drag signature fields onto the PDF
- Configure field types (signature, initial, date, text)
- Mark fields as required/optional
- Save placements

### 4. Send a Document

- Go to Documents page
- Click "New Document"
- Select a template
- Add recipient details (name, email, role)
- Set signing order if multiple recipients
- Add a message and expiration date (optional)
- Send the document

### 5. Recipients Sign the Document

- Recipients receive an email with a unique signing link
- They click the link (no login required)
- Review the document and fill in required fields
- Draw signature using the signature canvas
- Submit the signature

### 6. Download Signed Document

- Once all recipients sign, document status changes to "Completed"
- Sender receives a completion email
- Download the signed PDF from the dashboard
- The signed PDF includes all signatures and an audit trail page

## API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Templates

- `GET /api/templates` - Get all templates
- `POST /api/templates` - Upload new template
- `GET /api/templates/:id` - Get template details
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- `GET /api/templates/:id/placements` - Get signature placements
- `POST /api/templates/:id/placements` - Save signature placements

### Documents

- `GET /api/documents` - Get all documents
- `POST /api/documents` - Create new document
- `GET /api/documents/:id` - Get document details
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/send` - Send document for signing
- `GET /api/documents/:id/recipients` - Get document recipients
- `POST /api/documents/:id/resend` - Resend to recipient
- `GET /api/documents/:id/download` - Download signed document
- `POST /api/documents/:id/void` - Void document

### Signing (Public endpoints)

- `GET /api/sign/:token` - Get document for signing
- `POST /api/sign/:token` - Submit signature
- `GET /api/sign/:token/status` - Check signing status

## Project Structure

```
esignature-app/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React context
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── index.js         # Entry point
│   └── package.json
├── server/                  # Node.js backend
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Express middleware
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   ├── database/            # Database migrations
│   └── server.js            # Server entry point
├── .env.example             # Environment variables template
├── .gitignore
├── package.json             # Root package.json
└── README.md
```

## AWS S3 Setup

1. Create an S3 bucket in your AWS account
2. Create an IAM user with S3 access
3. Generate access keys
4. Update `.env` with your credentials
5. Set bucket CORS configuration if accessing from frontend

## Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → App passwords
   - Generate password for "Mail"
3. Use this app password in `.env` as `EMAIL_PASSWORD`

## AWS Elastic Beanstalk Deployment

This application is configured for deployment on AWS Elastic Beanstalk with AWS RDS (PostgreSQL) and S3 for file storage.

### AWS Prerequisites

Before deploying, ensure you have:

1. **AWS Account** - Sign up at https://aws.amazon.com
2. **AWS CLI** - Install from https://aws.amazon.com/cli/
3. **EB CLI** - Install Elastic Beanstalk CLI
4. **AWS RDS PostgreSQL Database** - Created and running
5. **AWS S3 Bucket** - For document storage
6. **IAM User** - With S3 and Elastic Beanstalk permissions

### Step 1: Install AWS EB CLI

```bash
# Install using pip
pip install awsebcli --upgrade --user

# Verify installation
eb --version
```

### Step 2: Configure AWS Credentials

```bash
# Configure AWS CLI with your credentials
aws configure

# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Default output format (json)
```

### Step 3: Create AWS Resources

#### 3.1 Create RDS PostgreSQL Database

1. Go to AWS RDS Console
2. Click "Create database"
3. Choose PostgreSQL
4. Select appropriate instance size (db.t3.micro for testing)
5. Set master username and password
6. Configure VPC and security groups
7. Note the endpoint URL after creation

#### 3.2 Create S3 Bucket

```bash
# Create S3 bucket
aws s3 mb s3://esignature-documents-prod --region us-east-1

# Enable versioning (optional)
aws s3api put-bucket-versioning --bucket esignature-documents-prod \
  --versioning-configuration Status=Enabled
```

#### 3.3 Create IAM User for S3 Access

1. Go to IAM Console
2. Create new user with programmatic access
3. Attach policy: AmazonS3FullAccess
4. Save Access Key ID and Secret Access Key

### Step 4: Initialize Elastic Beanstalk

```bash
# From project root directory
eb init

# Answer the prompts:
# 1. Select region: us-east-1 (or your preferred region)
# 2. Application name: esignature-app
# 3. Platform: Node.js
# 4. Platform version: Node.js 18 running on 64bit Amazon Linux 2
# 5. CodeCommit: No
# 6. SSH: Yes (recommended for debugging)
```

### Step 5: Create Elastic Beanstalk Environment

```bash
# Create production environment
eb create esignature-production \
  --instance-type t3.small \
  --envvars NODE_ENV=production

# This will:
# 1. Build and package your application
# 2. Upload to S3
# 3. Create EC2 instances
# 4. Configure load balancer
# 5. Deploy your application
```

### Step 6: Configure Environment Variables

Set all required environment variables using `eb setenv`:

```bash
eb setenv \
  NODE_ENV=production \
  PORT=8080 \
  DATABASE_URL="postgresql://username:password@your-rds-endpoint.us-east-1.rds.amazonaws.com:5432/esignature_db" \
  JWT_SECRET="your-secure-random-secret-key-here" \
  JWT_EXPIRE=7d \
  JWT_REFRESH_SECRET="your-refresh-secret-key-here" \
  JWT_REFRESH_EXPIRE=30d \
  AWS_REGION=us-east-1 \
  AWS_ACCESS_KEY_ID="your-iam-access-key" \
  AWS_SECRET_ACCESS_KEY="your-iam-secret-key" \
  AWS_S3_BUCKET="esignature-documents-prod" \
  EMAIL_HOST=smtp.gmail.com \
  EMAIL_PORT=587 \
  EMAIL_USER="your-email@gmail.com" \
  EMAIL_PASSWORD="your-gmail-app-password" \
  EMAIL_FROM="noreply@esignature.com" \
  CLIENT_URL="http://esignature-production.us-east-1.elasticbeanstalk.com" \
  BCRYPT_ROUNDS=10 \
  RATE_LIMIT_WINDOW_MS=900000 \
  RATE_LIMIT_MAX_REQUESTS=100 \
  MAX_FILE_SIZE=10485760 \
  ALLOWED_FILE_TYPES=application/pdf
```

**Alternative**: Set environment variables via AWS Console:
1. Go to Elastic Beanstalk Console
2. Select your environment
3. Configuration → Software → Environment properties
4. Add each variable individually

### Step 7: Run Database Migrations

```bash
# SSH into your EB instance
eb ssh

# Navigate to app directory
cd /var/app/current

# Run migrations
node server/database/migrate.js

# Exit SSH
exit
```

**Alternative**: Run migrations locally pointing to RDS:

```bash
# Set DATABASE_URL locally
export DATABASE_URL="postgresql://username:password@your-rds-endpoint:5432/esignature_db"

# Run migrations
npm run migrate
```

### Step 8: Configure Security Groups

1. Go to EC2 Console → Security Groups
2. Find your EB environment's security group
3. Find your RDS security group
4. Edit RDS security group inbound rules
5. Add PostgreSQL rule (port 5432) allowing traffic from EB security group

### Step 9: Open Your Application

```bash
# Open application in browser
eb open
```

Your application should now be running at:
`http://esignature-production.us-east-1.elasticbeanstalk.com`

### Deployment Commands

```bash
# Deploy updates after code changes
eb deploy

# View application logs
eb logs

# View recent logs
eb logs --stream

# Check environment status
eb status

# Check environment health
eb health

# Open application in browser
eb open

# SSH into instance for debugging
eb ssh

# Restart application
eb restart

# View environment info
eb printenv
```

### Update Environment Variables

```bash
# Update a single variable
eb setenv VARIABLE_NAME=new_value

# Update multiple variables
eb setenv VAR1=value1 VAR2=value2

# View all environment variables
eb printenv
```

### Scaling Your Application

```bash
# Scale to multiple instances
eb scale 3

# Configure auto-scaling via console
# Go to: Configuration → Capacity
# Set min/max instances and scaling triggers
```

### Custom Domain Setup (Optional)

1. Purchase domain from Route 53 or external provider
2. Go to Elastic Beanstalk Console
3. Your environment → Configuration → Load balancer
4. Add listener for HTTPS (port 443)
5. Attach SSL certificate (use AWS Certificate Manager)
6. Go to Route 53
7. Create hosted zone for your domain
8. Create A record pointing to EB environment
9. Update CLIENT_URL environment variable:

```bash
eb setenv CLIENT_URL="https://app.yourdomain.com"
```

### Monitoring and Logs

#### View Logs

```bash
# Request last 100 lines
eb logs

# Stream logs in real-time
eb logs --stream

# Download full logs
eb logs --all
```

#### CloudWatch Monitoring

1. Go to CloudWatch Console
2. Select "Logs" → "Log groups"
3. Find `/aws/elasticbeanstalk/esignature-production/`
4. View application logs, access logs, and error logs

#### Set Up CloudWatch Alarms

1. Go to CloudWatch Console
2. Create alarms for:
   - High CPU usage
   - Memory usage
   - HTTP 4xx/5xx errors
   - Application health

### Cost Optimization

**Development/Testing:**
```bash
# Use smaller instance
eb create esignature-dev --instance-type t3.micro --single

# Terminate when not in use
eb terminate esignature-dev
```

**Production:**
- Use t3.small or t3.medium instances
- Enable auto-scaling (scale down during off-hours)
- Use RDS db.t3.micro for small workloads
- Enable S3 lifecycle policies for old documents

### Troubleshooting

#### Application won't start

```bash
# Check logs
eb logs

# Common issues:
# 1. Missing environment variables
eb printenv

# 2. Database connection issues
# - Check security groups
# - Verify DATABASE_URL is correct
# - Test connection from EB instance

# 3. Build failures
# - Check .ebextensions config
# - Verify package.json scripts
```

#### Database connection errors

```bash
# Test database connection
eb ssh
cd /var/app/current
node -e "const { pool } = require('./server/config/database'); pool.query('SELECT NOW()').then(r => console.log(r.rows[0])).catch(e => console.error(e))"
```

#### File upload issues

- Verify S3 bucket exists
- Check IAM credentials are correct
- Verify IAM user has S3 permissions
- Check AWS_S3_BUCKET environment variable

#### HTTPS/SSL Issues

- Ensure load balancer has HTTPS listener
- Attach SSL certificate via AWS Certificate Manager
- Update `.ebextensions/https-redirect.config`

### Rollback to Previous Version

```bash
# List previous versions
eb appversion

# Deploy specific version
eb deploy --version version-label
```

### Maintenance Mode

Create `.ebextensions/maintenance.config`:

```yaml
files:
  "/etc/nginx/conf.d/maintenance.conf":
    mode: "000644"
    owner: root
    group: root
    content: |
      return 503;
```

Deploy to enable maintenance mode. Remove file and deploy to disable.

### Terminating Environment

```bash
# Terminate environment (WARNING: This deletes all resources)
eb terminate esignature-production

# Confirm when prompted
```

**Note**: This does NOT delete:
- RDS database (delete separately)
- S3 bucket (delete separately)
- Elastic IPs
- DNS records

### Production Checklist

Before going to production, ensure:

- [ ] All environment variables are set correctly
- [ ] DATABASE_URL points to production RDS instance
- [ ] JWT_SECRET is a strong random string
- [ ] AWS credentials are for IAM user (not root)
- [ ] S3 bucket is private (ACL: private)
- [ ] RDS security group allows only EB instances
- [ ] SSL certificate is configured
- [ ] Custom domain is set up (optional)
- [ ] CloudWatch alarms are configured
- [ ] Database backups are enabled (RDS automated backups)
- [ ] S3 versioning is enabled
- [ ] Application monitoring is set up
- [ ] Error tracking is configured
- [ ] Email service is configured and tested
- [ ] Rate limiting is appropriate
- [ ] CORS is properly configured

### Alternative Deployment Options

#### Frontend Deployment (Vercel/Netlify)

If you want to deploy frontend separately:

```bash
# Build frontend
cd client
npm run build

# Deploy build folder to Vercel/Netlify
# Update REACT_APP_API_URL to your EB API URL
```

#### Backend Only Deployment (Heroku)

```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret

# Deploy
git subtree push --prefix server heroku main

# Run migrations
heroku run node database/migrate.js
```

## Security Considerations

- Change `JWT_SECRET` in production
- Use strong passwords
- Enable HTTPS in production
- Set up proper CORS configuration
- Implement rate limiting (already included)
- Use environment variables for all secrets
- Regularly update dependencies
- Implement proper error handling
- Add request validation
- Use prepared statements (already implemented via pg library)

## Troubleshooting

### Database connection errors
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists

### File upload errors
- Check AWS credentials
- Verify S3 bucket exists and has proper permissions
- Check file size limits (default 10MB)

### Email not sending
- Verify email credentials
- Check EMAIL_PASSWORD is an app-specific password
- Ensure less secure apps are enabled (if not using app password)

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check CORS configuration
- Verify API_URL in frontend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
