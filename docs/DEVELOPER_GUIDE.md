# Developer Guide

This guide is designed for developers who want to understand, contribute to, or extend the Financial Management Platform.

## 📖 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Development Environment](#development-environment)
4. [Code Standards](#code-standards)
5. [API Development](#api-development)
6. [Frontend Development](#frontend-development)
7. [Database Design](#database-design)
8. [Authentication & Security](#authentication--security)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Contributing](#contributing)

---

## 🏗️ Architecture Overview

### System Architecture

The Financial Management Platform follows a modern full-stack architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │   PostgreSQL    │
│                 │    │                 │    │                 │
│  - Components   │◄──►│  - Controllers  │◄──►│  - User Data    │
│  - Redux Store  │    │  - Middleware   │    │  - Documents    │
│  - Services     │    │  - Routes       │    │  - Meetings     │
│  - Utils        │    │  - Models       │    │  - Analytics    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   External APIs  │    │   File Storage   │    │   Real-time      │
│                 │    │                 │    │   Communication  │
│  - Zoom API     │    │  - AWS S3       │    │  - Socket.io     │
│  - Razorpay     │    │  - Local Storage│    │  - WebRTC        │
│  - Email Service│    │  - Multer       │    │  - Notifications │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **React 18**: Modern React with hooks and functional components
- **Ant Design**: Comprehensive UI component library
- **Redux Toolkit**: State management with modern Redux patterns
- **React Router v6**: Client-side routing
- **Styled Components**: CSS-in-JS styling
- **Axios**: HTTP client with interceptors
- **Moment.js**: Date manipulation
- **Chart.js/Ant Design Plots**: Data visualization

#### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Sequelize**: PostgreSQL ORM with migrations
- **JWT**: JSON Web Tokens for authentication
- **Multer**: File upload handling
- **Socket.io**: Real-time communication
- **Nodemailer**: Email service
- **bcryptjs**: Password hashing
- **Express Rate Limit**: API rate limiting

#### Database
- **PostgreSQL**: Primary database
- **SQLite**: Development database option

#### External Services
- **Zoom API**: Video conferencing integration
- **Razorpay**: Payment processing
- **AWS S3**: File storage
- **SendGrid/Nodemailer**: Email service

---

## 📁 Project Structure

### Root Directory
```
financial-app/
├── client/                     # React frontend application
├── server/                     # Node.js backend application
├── database/                   # Database scripts and migrations
├── docs/                      # Documentation files
├── tests/                     # Test files
├── .gitignore                 # Git ignore rules
├── .env.example              # Environment variables template
├── package.json              # Root package.json with scripts
└── README.md                 # Project documentation
```

### Client Structure
```
client/
├── public/                    # Static assets
│   ├── index.html            # HTML template
│   ├── manifest.json         # PWA manifest
│   └── images/              # Static images
├── src/
│   ├── components/          # Reusable React components
│   │   ├── auth/            # Authentication components
│   │   ├── dashboards/      # Dashboard components
│   │   ├── common/          # Shared components
│   │   ├── credit-card/     # Credit card components
│   │   ├── financial-planning/ # Financial planning components
│   │   └── consultation/    # Consultation components
│   ├── pages/               # Page components
│   ├── redux/               # Redux store and slices
│   │   └── slices/          # Redux slices
│   ├── services/            # API services
│   ├── hooks/               # Custom React hooks
│   ├── contexts/            # React contexts
│   ├── utils/               # Utility functions
│   ├── styles/              # Global styles
│   ├── App.js               # Main App component
│   └── index.js             # Application entry point
├── package.json             # Frontend dependencies
└── .env                     # Frontend environment variables
```

### Server Structure
```
server/
├── src/                     # Source code
│   ├── controllers/        # Request handlers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/          # Custom middleware
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration files
│   └── index.js            # Server entry point
├── config/                 # Configuration files
├── uploads/                # File upload directory
├── package.json           # Backend dependencies
└── .env                   # Backend environment variables
```

---

## 🛠️ Development Environment

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Git
- Code editor (VS Code recommended)

### VS Code Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-npm-scripts",
    "ms-vscode.vscode-react-native",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Development Scripts

#### Root Level Scripts
```json
{
  "start": "concurrently \"npm run server\" \"npm run client\"",
  "server": "cd server && npm run dev",
  "client": "cd client && npm start",
  "install-all": "npm install && cd server && npm install && cd ../client && npm install",
  "build": "cd client && npm run build",
  "test": "npm run test:client && npm run test:server",
  "test:client": "cd client && npm test",
  "test:server": "cd server && npm test"
}
```

#### Client Scripts
```json
{
  "start": "cross-env DANGEROUSLY_DISABLE_HOST_CHECK=true HOST=0.0.0.0 PORT=5000 react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject",
  "lint": "eslint src/",
  "lint:fix": "eslint src/ --fix"
}
```

#### Server Scripts
```json
{
  "start": "node src/index.js",
  "dev": "nodemon src/index.js",
  "seed": "node src/seeds/seedCreditCards.js",
  "migrate": "sequelize-cli db:migrate",
  "migrate:undo": "sequelize-cli db:migrate:undo",
  "test": "jest",
  "test:watch": "jest --watch",
  "lint": "eslint src/",
  "lint:fix": "eslint src/ --fix"
}
```

---

## 📝 Code Standards

### JavaScript/React Standards

#### Naming Conventions
```javascript
// Components - PascalCase
const UserDashboard = () => {};

// Variables and functions - camelCase
const userName = 'john_doe';
const getUserProfile = () => {};

// Constants - UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:3001/api';

// Files - kebab-case
// user-dashboard.js
// api-service.js
```

#### Component Structure
```javascript
import React, { useState, useEffect } from 'react';
import { Button, Card, Typography } from 'antd';
import styled from 'styled-components';
import api from '../utils/api';

const { Title, Text } = Typography;

// Styled components
const StyledCard = styled(Card)`
  margin-bottom: 16px;
  border-radius: 8px;
`;

// Component definition
const UserDashboard = () => {
  // State declarations
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // Effect hooks
  useEffect(() => {
    loadData();
  }, []);

  // Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // Render
  return (
    <StyledCard>
      <Title level={2}>User Dashboard</Title>
      <Text>Dashboard content</Text>
    </StyledCard>
  );
};

export default UserDashboard;
```

#### Redux Patterns
```javascript
// Slice definition
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk
export const fetchUserData = createAsyncThunk(
  'user/fetchData',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
```

### Backend Standards

#### Controller Structure
```javascript
const { User, Document } = require('../models');
const { validationResult } = require('express-validator');

// Get user documents
exports.getUserDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, category, limit = 10, offset = 0 } = req.query;

    // Build where clause
    const whereClause = { userId };
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;

    // Fetch documents
    const documents = await Document.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['uploadedAt', 'DESC']],
      include: [{
        model: User,
        as: 'assignedTo',
        attributes: ['id', 'name', 'role']
      }]
    });

    res.json({
      success: true,
      documents: documents.rows,
      total: documents.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Get user documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
};
```

#### Model Definition
```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM(
        'tax_document',
        'financial_statement',
        'identity_proof',
        'bank_statement',
        'investment_document',
        'other'
      ),
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM(
        'submitted',
        'assigned',
        'in_review',
        'approved',
        'rejected',
        'requires_changes'
      ),
      defaultValue: 'submitted'
    },
    clientNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reviewNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'documents',
    timestamps: true,
    createdAt: 'uploadedAt',
    updatedAt: 'updatedAt'
  });

  // Associations
  Document.associate = (models) => {
    Document.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'owner'
    });
    Document.belongsTo(models.User, {
      foreignKey: 'assignedToId',
      as: 'assignedTo'
    });
  };

  return Document;
};
```

#### Route Definition
```javascript
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { auth } = require('../controllers/authController');
const requireRole = require('../middleware/requireRole');
const { body } = require('express-validator');

// Validation middleware
const validateDocumentUpload = [
  body('category').isIn([
    'tax_document',
    'financial_statement',
    'identity_proof',
    'bank_statement',
    'investment_document',
    'other'
  ]).withMessage('Invalid document category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level')
];

// Routes
router.post('/upload',
  auth,
  requireRole(['user']),
  validateDocumentUpload,
  documentController.uploadDocument
);

router.get('/user',
  auth,
  requireRole(['user']),
  documentController.getUserDocuments
);

router.get('/pending',
  auth,
  requireRole(['ca', 'financial_planner']),
  documentController.getPendingDocuments
);

module.exports = router;
```

---

## 🔌 API Development

### RESTful API Design

#### Endpoint Naming Conventions
```
GET    /api/users              # Get all users
GET    /api/users/:id          # Get specific user
POST   /api/users              # Create new user
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user

GET    /api/users/:id/documents    # Get user's documents
POST   /api/users/:id/documents     # Create document for user
```

#### Response Format
```javascript
// Success Response
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "code": "ERROR_CODE"
}
```

#### Error Handling
```javascript
// Global error handler
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};
```

### Middleware Development

#### Authentication Middleware
```javascript
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

module.exports = { auth };
```

#### Role-based Authorization
```javascript
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

module.exports = requireRole;
```

#### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Usage
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per window
  'Too many authentication attempts'
);

const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100 // 100 requests per window
);
```

---

## 🎨 Frontend Development

### Component Development

#### Custom Hooks
```javascript
// useApi hook
import { useState, useEffect } from 'react';
import api from '../utils/api';

const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(url, options);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [url]);

  return { data, loading, error, refetch: fetchData };
};

export default useApi;
```

#### Form Handling
```javascript
import { Form, Input, Button, Select } from 'antd';
import { useState } from 'react';

const DocumentUploadForm = ({ onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="category"
        label="Document Category"
        rules={[{ required: true, message: 'Please select a category' }]}
      >
        <Select placeholder="Select category">
          <Select.Option value="tax_document">Tax Document</Select.Option>
          <Select.Option value="financial_statement">Financial Statement</Select.Option>
          <Select.Option value="identity_proof">Identity Proof</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="priority"
        label="Priority"
        rules={[{ required: true, message: 'Please select priority' }]}
      >
        <Select placeholder="Select priority">
          <Select.Option value="low">Low</Select.Option>
          <Select.Option value="medium">Medium</Select.Option>
          <Select.Option value="high">High</Select.Option>
          <Select.Option value="urgent">Urgent</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};
```

### State Management

#### Redux Store Configuration
```javascript
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import documentReducer from './slices/documentSlice';
import meetingReducer from './slices/meetingSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    documents: documentReducer,
    meetings: meetingReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### API Service Layer
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🗄️ Database Design

### Entity Relationship Diagram

```
Users
├── id (PK)
├── name
├── email (UNIQUE)
├── password_hash
├── role (ENUM)
├── created_at
└── updated_at

Documents
├── id (PK)
├── user_id (FK -> Users.id)
├── assigned_to_id (FK -> Users.id)
├── file_name
├── file_path
├── category (ENUM)
├── priority (ENUM)
├── status (ENUM)
├── client_notes
├── review_notes
├── uploaded_at
└── updated_at

Meetings
├── id (PK)
├── client_id (FK -> Users.id)
├── professional_id (FK -> Users.id)
├── title
├── planning_type (ENUM)
├── status (ENUM)
├── starts_at
├── duration
├── description
├── zoom_join_url
├── zoom_start_url
├── created_at
└── updated_at

CreditCards
├── id (PK)
├── card_name
├── issuer
├── annual_fee
├── benefits (JSON)
├── eligibility_criteria (JSON)
├── created_at
└── updated_at

CreditCardApplications
├── id (PK)
├── user_id (FK -> Users.id)
├── card_id (FK -> CreditCards.id)
├── application_data (JSON)
├── status (ENUM)
├── applied_at
└── updated_at
```

### Migration Files

```javascript
// Create users table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('user', 'ca', 'financial_planner', 'admin'),
        defaultValue: 'user'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
```

---

## 🔐 Authentication & Security

### JWT Implementation

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
```

### Security Middleware

```javascript
const helmet = require('helmet');
const cors = require('cors');

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 🧪 Testing

### Frontend Testing

```javascript
// Component test example
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import UserDashboard from '../UserDashboard';
import userReducer from '../../redux/slices/userSlice';

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: userReducer
    },
    preloadedState: initialState
  });
};

describe('UserDashboard', () => {
  test('renders dashboard with user data', async () => {
    const store = createTestStore({
      user: {
        user: { id: 1, name: 'Test User', role: 'user' },
        token: 'test-token'
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <UserDashboard />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
  });
});
```

### Backend Testing

```javascript
// API test example
const request = require('supertest');
const app = require('../src/index');
const { User } = require('../src/models');

describe('Auth API', () => {
  beforeEach(async () => {
    await User.destroy({ where: {} });
  });

  test('POST /api/auth/register - should create new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.token).toBeDefined();
  });

  test('POST /api/auth/login - should authenticate user', async () => {
    // Create user first
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password_hash: await bcrypt.hash('password123', 12),
      role: 'user'
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });
});
```

---

## 🚀 Deployment

### Environment Configuration

#### Production Environment Variables
```env
# Database
DB_USER=production_user
DB_PASSWORD=secure_production_password
DB_NAME=financial_app_prod
DB_HOST=production-db-host
DB_PORT=5432

# JWT
JWT_SECRET=very_secure_production_jwt_secret

# Server
PORT=3001
NODE_ENV=production

# Frontend
REACT_APP_API_URL=https://api.yourdomain.com/api

# External Services
ZOOM_API_KEY=production_zoom_key
ZOOM_API_SECRET=production_zoom_secret
RAZORPAY_KEY_ID=production_razorpay_key
RAZORPAY_KEY_SECRET=production_razorpay_secret
```

### Docker Configuration

```dockerfile
# Dockerfile for backend
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: financial_app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./server
    environment:
      DB_HOST: db
      DB_USER: postgres
      DB_PASSWORD: password
      DB_NAME: financial_app
    ports:
      - "3001:3001"
    depends_on:
      - db

  frontend:
    build: ./client
    ports:
      - "5000:5000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Write tests** for new functionality
5. **Run tests** to ensure everything works
   ```bash
   npm test
   ```
6. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
7. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Create a Pull Request**

### Code Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: At least one reviewer must approve
3. **Testing**: Manual testing of new features
4. **Documentation**: Update relevant documentation
5. **Merge**: Merge after approval and testing

### Commit Message Convention

```
type(scope): description

feat(auth): add two-factor authentication
fix(api): resolve document upload timeout
docs(readme): update installation instructions
style(ui): improve button styling
refactor(db): optimize user queries
test(auth): add login test cases
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

---

This developer guide provides comprehensive information for contributing to the Financial Management Platform. For additional help or questions, please refer to the project documentation or contact the development team.
