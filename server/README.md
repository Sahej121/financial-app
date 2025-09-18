# Financial App Server

Backend server for the Financial Management Platform using Node.js, Express, and SQLite.

## 🗄️ Database Configuration

This server uses **SQLite** as the database, which means:

- ✅ **No installation required** - SQLite is included with Node.js
- ✅ **No configuration needed** - Database file is created automatically
- ✅ **File-based** - Database stored in `database.sqlite` file
- ✅ **Zero maintenance** - No database server to manage

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your JWT_SECRET
   ```

3. **Start the server**
   ```bash
   npm run dev
   ```

## 📁 Database File

The SQLite database file will be automatically created at:
```
server/database.sqlite
```

## 🔧 Environment Variables

Only the `JWT_SECRET` is required. All other variables are optional:

```env
# Required
JWT_SECRET=your_jwt_secret_here

# Optional
PORT=3001
NODE_ENV=development
EMAIL_HOST=smtp.gmail.com
# ... other optional configs
```

## 📊 Database Schema

The database will automatically create the following tables:
- `Users` - User accounts and authentication
- `Documents` - File uploads and management
- `Meetings` - Consultation scheduling
- `CreditCards` - Credit card data
- `CreditCardApplications` - Application tracking
- `CAs` - Chartered Accountant profiles

## 🧪 Testing

```bash
# Run tests
npm test

# Seed sample data
npm run seed
```

## 📝 Notes

- Database tables are created automatically when the server starts
- No migrations needed - Sequelize handles schema creation
- Database file persists between server restarts
- Perfect for development and small to medium deployments
