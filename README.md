# Financial Management Platform

A comprehensive financial management application that connects users with Chartered Accountants (CAs) and Financial Planners for personalized financial advice, document management, and credit card recommendations.

## 🌟 Features

### Core Functionality
- **User Authentication & Role Management**: Secure JWT-based authentication with role-based access control
- **CA Selection & Consultation**: Browse and select from qualified Chartered Accountants
- **Document Management**: Secure upload, storage, and review of financial documents
- **Financial Planning**: Comprehensive financial planning tools and workflows
- **Credit Card Recommendations**: AI-powered personalized credit card suggestions
- **Real-time Communication**: Video consultations via Zoom integration
- **Analytics Dashboard**: Detailed insights and reporting for all user types

### User Roles
- **Regular Users**: Access to financial planning, document upload, and CA consultation
- **Chartered Accountants (CAs)**: Professional dashboard for client management and document review
- **Financial Planners**: Specialized dashboard for financial planning services
- **Administrators**: System management and oversight capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- SQLite (included with Node.js)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd financial-app
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   Create a `.env` file in the `server` directory:
   ```env

   # JWT Secret (REQUIRED)
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

   # Server Configuration
   PORT=3001

   # Email Configuration (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # Razorpay Configuration (optional)
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret

   # Zoom Configuration (optional)
   ZOOM_API_KEY=your_zoom_api_key
   ZOOM_API_SECRET=your_zoom_api_secret
   ```

4. **Set up the database**
   ```bash
   # SQLite database is automatically created
   # Run database migrations (if available)
   cd server
   npm run migrate
   ```

5. **Start the application**
   ```bash
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:5000
   - Backend API: http://localhost:3001

## 🏗️ Project Structure

```
financial-app/
├── client/                     # React frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── dashboards/     # Dashboard components
│   │   │   ├── common/         # Shared components
│   │   │   └── ...
│   │   ├── pages/              # Page components
│   │   ├── redux/              # State management
│   │   ├── services/           # API services
│   │   └── utils/              # Utility functions
│   └── package.json
├── server/                     # Node.js backend
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Custom middleware
│   │   └── services/          # Business logic
│   ├── config/                # Configuration files
│   └── package.json
├── database/                  # Database scripts
└── docs/                     # Documentation
```

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Ant Design**: Comprehensive UI component library
- **Redux Toolkit**: State management with modern Redux patterns
- **React Router**: Client-side routing
- **Styled Components**: CSS-in-JS styling
- **Axios**: HTTP client for API communication

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Sequelize**: SQLite ORM
- **JWT**: JSON Web Tokens for authentication
- **Multer**: File upload handling
- **Socket.io**: Real-time communication

### Database
- **SQLite**: Primary database (file-based, no setup required)

### External Services
- **Zoom API**: Video conferencing integration
- **Razorpay**: Payment processing
- **AWS S3**: File storage (configurable)

## 📱 User Interface

### Public Pages
- **Home**: Landing page with hero section and feature overview
- **About**: Company information and team details
- **Services**: Available financial services
- **CA Selection**: Browse and select Chartered Accountants
- **Credit Card**: Credit card recommendation tool
- **Contact**: Contact information and support

### Protected Dashboards
- **User Dashboard**: Personal financial overview and document management
- **CA Dashboard**: Professional tools for client management
- **Financial Planner Dashboard**: Specialized financial planning interface
- **Admin Dashboard**: System administration and analytics

## 🔐 Authentication & Security

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions based on user roles
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Cross-origin resource sharing setup
- **Rate Limiting**: API rate limiting to prevent abuse

## 📊 API Documentation

The application provides RESTful APIs for all major functionality:

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Document Management
- `POST /api/documents/upload` - Upload documents
- `GET /api/documents/user` - Get user documents
- `GET /api/documents/pending` - Get pending documents (professionals)

### Meeting Management
- `GET /api/meetings/user` - Get user meetings
- `GET /api/meetings/professional` - Get professional meetings
- `POST /api/meetings` - Create new meeting
- `POST /api/meetings/:id/zoom-link` - Generate Zoom meeting link

### Analytics
- `GET /api/analytics/summary` - Get analytics summary
- `GET /api/analytics/charts` - Get chart data
- `GET /api/analytics/insights` - Get business insights

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
# Build frontend
cd client
npm run build

# Start production server
cd server
npm start
```

### Docker Deployment (Optional)
```bash
docker-compose up -d
```

## 🧪 Testing

```bash
# Run frontend tests
cd client
npm test

# Run backend tests
cd server
npm test
```

## 📈 Performance Optimization

- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Optimized image loading
- **Caching**: API response caching
- **Database Indexing**: Optimized database queries
- **Bundle Analysis**: Webpack bundle optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Added financial planning features
- **v1.2.0**: Enhanced dashboard analytics
- **v1.3.0**: Zoom integration and real-time communication

---

**Built with ❤️ for better financial management**