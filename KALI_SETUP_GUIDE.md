# 🚀 Financial App - Kali Linux Setup Guide

## 📋 Prerequisites

### 1. Install Node.js and npm
```bash
# Add Node.js repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt-get install nodejs -y

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 10.x.x
```

### 2. Install Git (if not already installed)
```bash
sudo apt update
sudo apt install git -y
```

## 🔧 Installation Steps

### 1. Clone or Navigate to Project
```bash
cd /home/sb121/financial-app
```

### 2. Install Dependencies

#### Install Client Dependencies
```bash
cd client
npm install
```

#### Install Server Dependencies
```bash
cd ../server
npm install
```

### 3. Set up Environment Variables
The `.env` file has been created in the server directory with default development settings.

For production or advanced features, update these values:
- **JWT_SECRET**: Change to a secure random string
- **RAZORPAY_KEY_ID/SECRET**: Add your Razorpay credentials for payment processing
- **SMTP settings**: Configure email service for notifications
- **ZOOM_API**: Add Zoom credentials for video meetings

## 🚀 Running the Application

### Option 1: Using the Startup Script (Recommended)
```bash
cd /home/sb121/financial-app
./start-app.sh
```

### Option 2: Manual Start
```bash
# Terminal 1 - Start Backend Server
cd /home/sb121/financial-app/server
npm start

# Terminal 2 - Start Frontend Client
cd /home/sb121/financial-app/client
npm start
```

## 🌐 Accessing the Application

Once started, the application will be available at:

- **Frontend (React App)**: http://localhost:5000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api

## 🎯 Enhanced Features Available

### 1. 💳 Credit Card Recommendations
- **AI-Powered Algorithm**: Multi-factor scoring system
- **Real Eligibility Check**: Age, income, credit score validation
- **Approval Probability**: Shows realistic approval chances
- **Direct Bank Links**: Apply directly on bank websites
- **Missing Card Requests**: Users can request cards not in database

### 2. 🏦 CA Dashboard
- **Meeting Management**: Schedule, start, and manage client meetings
- **Document Review**: Professional document review workflow
- **Availability Settings**: Set working hours and availability status
- **Zoom Integration**: Generate and manage meeting links

### 3. 📊 User Dashboard
- **Financial Analytics**: Real-time charts and insights
- **Meeting Tracking**: View upcoming consultations
- **Document Management**: Track uploaded documents and their status

### 4. 🔐 Authentication System
- **Role-based Access**: Different dashboards for users, CAs, and admins
- **Secure Authentication**: JWT-based with proper session management

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use
```bash
# Kill processes on ports 3001 and 5000
sudo pkill -f "node.*3001"
sudo pkill -f "react-scripts start"
```

#### 2. Permission Issues
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

#### 3. Database Issues
```bash
# The app uses SQLite - database will be created automatically
# If issues persist, delete the database file and restart
rm server/database.sqlite
```

#### 4. Module Not Found Errors
```bash
# Reinstall dependencies
cd client && rm -rf node_modules && npm install
cd ../server && rm -rf node_modules && npm install
```

### 5. Environment Variables
```bash
# Check if .env file exists in server directory
ls -la server/.env

# If missing, create it:
cd server
cp .env.example .env  # If example exists
# OR manually create with the values shown above
```

## 🔧 Development Commands

### Client Development
```bash
cd client
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

### Server Development
```bash
cd server
npm start          # Start production server
npm run dev        # Start with nodemon (auto-restart)
npm run seed       # Seed database with sample data
```

## 📱 Browser Compatibility

The application works best with:
- **Chrome** (Recommended)
- **Firefox**
- **Edge**
- **Safari**

## 🔒 Security Notes

For production deployment:
1. Change all default passwords and secrets
2. Configure proper CORS settings
3. Set up HTTPS
4. Configure proper database security
5. Set up proper logging and monitoring

## 📞 Support

If you encounter any issues:
1. Check the console logs in both browser and terminal
2. Ensure all dependencies are installed correctly
3. Verify that ports 3001 and 5000 are available
4. Check that Node.js version is 18.x.x or higher

## 🎉 Features Demo

Once running, you can test:

1. **Credit Card Recommendations**:
   - Go to `/credit-card`
   - Fill out the multi-step form
   - See AI-powered recommendations with approval chances

2. **CA Registration & Dashboard**:
   - Register as a CA at `/ca-register`
   - Access professional dashboard at `/ca-dashboard`
   - Schedule meetings and review documents

3. **Financial Planning**:
   - Navigate to `/planning`
   - Upload documents and schedule consultations
   - Experience the enhanced booking flow

## 🚀 Ready to Go!

Your enhanced financial app is now ready to run on Kali Linux with all the latest improvements including AI-powered credit card recommendations, professional CA dashboards, and comprehensive user management! 