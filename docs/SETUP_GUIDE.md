# Setup Guide

This guide will walk you through setting up the Financial Management Platform on your local development environment.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **SQLite** (included with Node.js)
- **Git** - [Download here](https://git-scm.com/downloads)

### Optional Software
- **Postman** or **Insomnia** - For API testing
- **DB Browser for SQLite** - SQLite administration tool
- **VS Code** - Recommended code editor

## 🚀 Installation Steps

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd financial-app

# Verify the project structure
ls -la
```

You should see the following structure:
```
financial-app/
├── client/          # React frontend
├── server/          # Node.js backend
├── database/        # Database scripts
├── docs/           # Documentation
└── README.md
```

### Step 2: Install Dependencies

Install all dependencies for both frontend and backend:

```bash
# Install all dependencies at once
npm run install-all
```

This command will:
- Install root dependencies
- Install server dependencies (`cd server && npm install`)
- Install client dependencies (`cd client && npm install`)

**Alternative method (manual installation):**
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root directory
cd ..
```

### Step 3: Database Setup

#### 3.1 SQLite Database (No Installation Required)

SQLite is included with Node.js, so no additional installation is required. The database file will be automatically created when you first run the application.

#### 3.2 Database File Location

The SQLite database file will be created at:
```
server/database.sqlite
```

#### 3.3 Verify Database Setup

The database will be automatically created and configured when you start the application. You can verify this by checking if the `database.sqlite` file exists in the server directory after running the application.

### Step 4: Environment Configuration

#### 4.1 Create Environment File

Create a `.env` file in the `server` directory:

```bash
# Navigate to server directory
cd server

# Create .env file
touch .env  # Linux/macOS
# or
type nul > .env  # Windows
```

#### 4.2 Configure Environment Variables

Add the following content to `server/.env`:

```env

# JWT Secret (REQUIRED - Generate a strong secret)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_at_least_32_characters

# Server Configuration
PORT=3001
NODE_ENV=development

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Razorpay Configuration (Optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Zoom Configuration (Optional)
ZOOM_API_KEY=your_zoom_api_key
ZOOM_API_SECRET=your_zoom_api_secret

# AWS S3 Configuration (Optional)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name
```

**Important Notes:**
- Generate a strong JWT secret (at least 32 characters)
- Optional configurations can be left empty for basic functionality
- SQLite database requires no additional configuration

#### 4.3 Generate JWT Secret

You can generate a secure JWT secret using:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

### Step 5: Database Migration and Seeding

#### 5.1 Run Database Migrations

```bash
# Navigate to server directory
cd server

# Run migrations (if available)
npm run migrate

# Or manually create tables using the schema
# SQLite will automatically create tables when the application starts
```

#### 5.2 Seed Initial Data (Optional)

```bash
# Seed credit card data
npm run seed

# Or manually insert sample data
# SQLite will automatically create tables and seed data when the application starts
```

### Step 6: Start the Application

#### 6.1 Development Mode (Recommended)

Start both frontend and backend simultaneously:

```bash
# From the root directory
npm start
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:5000`

#### 6.2 Separate Development Servers

If you prefer to run servers separately:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

### Step 7: Verify Installation

#### 7.1 Check Backend Health

```bash
# Test backend API
curl http://localhost:3001/api/auth/profile
```

Expected response:
```json
{
  "error": "Authorization token required"
}
```

#### 7.2 Check Frontend

1. Open your browser and navigate to `http://localhost:5000`
2. You should see the application homepage
3. Try navigating to different pages

#### 7.3 Test Database Connection

```bash
# Test database connection
cd server
node -e "
const { sequelize } = require('./src/models');
sequelize.authenticate()
  .then(() => console.log('SQLite database connection successful'))
  .catch(err => console.error('Database connection failed:', err));
"
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue 1: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:**
```bash
# Find process using port 3001
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

#### Issue 2: Database Connection Failed

**Error:** `SQLITE_CANTOPEN: unable to open database file`

**Solutions:**
1. Check if the server directory has write permissions
2. Ensure the `database.sqlite` file can be created
3. Check if the server directory exists and is accessible
4. Verify file system permissions:
   ```bash
   # Check directory permissions
   ls -la server/
   
   # Ensure write permissions
   chmod 755 server/
   ```

#### Issue 3: Module Not Found Errors

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# For server
cd server
rm -rf node_modules package-lock.json
npm install

# For client
cd ../client
rm -rf node_modules package-lock.json
npm install
```

#### Issue 4: CORS Errors

**Error:** `Access to fetch at 'http://localhost:3001' from origin 'http://localhost:5000' has been blocked by CORS policy`

**Solution:**
Check that the backend CORS configuration allows the frontend origin:
```javascript
// In server/src/index.js
app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true
}));
```

#### Issue 5: JWT Secret Not Set

**Error:** `JWT_SECRET is not defined`

**Solution:**
1. Ensure `.env` file exists in `server` directory
2. Add `JWT_SECRET=your_secret_here` to the file
3. Restart the server

### Development Tools Setup

#### VS Code Extensions (Recommended)

Install these extensions for better development experience:

```bash
# Essential extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension ms-vscode.vscode-json
code --install-extension ms-vscode.vscode-npm-scripts
```

#### Postman Collection

Import the API collection for testing:

1. Open Postman
2. Click "Import"
3. Select "Raw text" and paste the API collection JSON
4. Set environment variables:
   - `base_url`: `http://localhost:3001/api`
   - `token`: Your JWT token (after login)

## 🧪 Testing the Setup

### 1. Test User Registration

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### 2. Test User Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test Protected Route

```bash
# Use the token from login response
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Test Frontend

1. Open `http://localhost:5000`
2. Try registering a new user
3. Login with the user credentials
4. Navigate to the dashboard

## 📝 Next Steps

After successful setup:

1. **Read the API Documentation**: Check `docs/API_DOCUMENTATION.md`
2. **Explore the Codebase**: Familiarize yourself with the project structure
3. **Run Tests**: Execute the test suite to ensure everything works
4. **Create Sample Data**: Add some test users and documents
5. **Configure External Services**: Set up email, payment, and video conferencing integrations

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs**: Look at console output for error messages
2. **Verify prerequisites**: Ensure all required software is installed
3. **Check environment variables**: Verify `.env` file configuration
4. **Test database connection**: Ensure PostgreSQL is running and accessible
5. **Review documentation**: Check API docs and this setup guide
6. **Create an issue**: Report bugs or ask questions in the repository

## 🔄 Updating the Application

To update the application:

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm run install-all

# Run migrations (if any)
cd server
npm run migrate

# Restart the application
npm start
```

---

**Congratulations!** 🎉 You have successfully set up the Financial Management Platform. You can now start developing and contributing to the project.
