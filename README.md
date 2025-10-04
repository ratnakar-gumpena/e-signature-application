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
- **Cloud Storage**: S3-compatible storage for secure document storage

## Tech Stack

### Backend
- Node.js & Express.js
- PostgreSQL database
- JWT authentication
- S3-compatible storage for files
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

- Node.js 20+ and npm
- PostgreSQL 12+
- S3-compatible storage (AWS S3, MinIO, etc.)
- Email account (Gmail recommended) for sending emails

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ratnakar-gumpena/e-signature-application.git
cd e-signature-application
```

### 2. Install dependencies

```bash
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
PORT=8080

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/esignature_db

# JWT Secrets (generate using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_REFRESH_EXPIRE=30d

# AWS S3 (or S3-compatible storage)
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

# Security
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf
```

### 5. Generate JWT Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 6. Run database migrations

```bash
npm run migrate
```

### 7. Start the application

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

### 8. Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Health check: http://localhost:8080/health

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
e-signature-application/
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

## Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → App passwords
   - Generate password for "Mail"
3. Use this app password in `.env` as `EMAIL_PASSWORD`

## Security Considerations

- Change `JWT_SECRET` and `JWT_REFRESH_SECRET` in production
- Use strong, randomly generated secrets (use the generation script above)
- Use strong database passwords
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
- Check S3 credentials
- Verify S3 bucket exists and has proper permissions
- Check file size limits (default 10MB)

### Email not sending
- Verify email credentials
- Check EMAIL_PASSWORD is an app-specific password
- Ensure less secure apps are enabled (if not using app password)

### Frontend can't connect to backend
- Verify backend is running on correct port
- Check CORS configuration
- Verify CLIENT_URL in `.env`

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
