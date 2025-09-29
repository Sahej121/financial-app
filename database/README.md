# Financial App Database Architecture

This document describes the multi-database architecture for the Financial App, designed to separate concerns and improve scalability.

## Database Structure

The application uses **5 separate MySQL databases** to organize different types of data:

### 1. User Authentication Database (`user_auth_db`)
- **Purpose**: User authentication, sessions, and OAuth providers
- **Tables**:
  - `users` - Core user information and authentication
  - `oauth_providers` - OAuth provider connections
  - `user_sessions` - Active user sessions

### 2. Documents Database (`documents_db`)
- **Purpose**: Document storage, metadata, and assignments
- **Tables**:
  - `documents` - Document files and metadata
  - `document_assignments` - Professional assignments to documents
  - `document_versions` - Version control for documents

### 3. CA Profiles Database (`ca_profiles_db`)
- **Purpose**: Chartered Accountant profiles and specializations
- **Tables**:
  - `ca_profiles` - Core CA profile information
  - `ca_specializations` - CA specializations and expertise
  - `ca_qualifications` - Professional qualifications and certifications
  - `ca_languages` - Language proficiencies
  - `ca_availability` - Availability schedules
  - `ca_reviews` - Client reviews and ratings

### 4. Analyst Profiles Database (`analyst_profiles_db`)
- **Purpose**: Financial Analyst profiles and specializations
- **Tables**:
  - `analyst_profiles` - Core analyst profile information
  - `analyst_specializations` - Analyst specializations and expertise
  - `analyst_qualifications` - Professional qualifications and certifications
  - `analyst_languages` - Language proficiencies
  - `analyst_availability` - Availability schedules
  - `analyst_reviews` - Client reviews and ratings

### 5. Metadata & Analytics Database (`metadata_analytics_db`)
- **Purpose**: System metadata, analytics, and audit logs
- **Tables**:
  - `system_metadata` - Entity-specific metadata
  - `user_activity_logs` - User activity tracking
  - `performance_metrics` - System performance metrics
  - `audit_logs` - Audit trail for all changes

## Setup Instructions

### 1. Prerequisites
- MySQL 8.0+ installed and running
- Node.js 16+ installed
- Required npm packages (see package.json)

### 2. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your database credentials
nano .env
```

### 3. Database Initialization
```bash
# Initialize all databases and tables
node database/init.js init

# Seed initial data (admin user)
node database/init.js seed

# Test database connections
node database/init.js test
```

### 4. Using the Database Models

```javascript
const { db } = require('./database/models');

// Create a new user with CA profile
const userId = await db.createUserWithProfile({
  name: 'John Doe',
  email: 'john@example.com',
  password_hash: 'hashed_password',
  salt: 'salt',
  role: 'ca'
}, {
  ca_number: 'CA12345',
  consultation_fee: 500.00,
  bio: 'Experienced CA with 10+ years'
});

// Get user with profile
const userWithProfile = await db.getUserWithProfile(userId);

// Search across all entities
const searchResults = await db.globalSearch('financial planning');

// Get dashboard statistics
const dashboardData = await db.getDashboardData();
```

## Model Classes

### UserAuth
- User authentication and session management
- OAuth provider integration
- User verification and password reset

### Documents
- Document upload and storage
- Document assignments to professionals
- Version control and metadata

### CAProfiles
- CA profile management
- Specializations and qualifications
- Availability and reviews

### AnalystProfiles
- Analyst profile management
- Specializations and qualifications
- Availability and reviews

### MetadataAnalytics
- System metadata storage
- Activity logging
- Performance metrics
- Audit trails

## Security Features

1. **Password Security**: Bcrypt hashing with salt
2. **Session Management**: Secure session tokens with expiration
3. **Account Lockout**: Protection against brute force attacks
4. **Audit Logging**: Complete audit trail for all changes
5. **Data Validation**: Input validation and sanitization

## Performance Optimizations

1. **Indexed Queries**: Strategic indexes on frequently queried columns
2. **Connection Pooling**: Efficient database connection management
3. **Query Optimization**: Optimized queries for common operations
4. **Data Archiving**: Automatic cleanup of old logs and sessions

## Backup and Maintenance

### Regular Maintenance Tasks
```bash
# Clean up expired sessions
node -e "require('./database/models').db.userAuth.cleanExpiredSessions()"

# Clean up old logs
node -e "require('./database/models').db.metadataAnalytics.cleanupOldLogs(90)"

# Clean up expired documents
node -e "require('./database/models').db.documents.cleanupExpiredDocuments()"
```

### Backup Strategy
1. **Daily Backups**: Full database backups
2. **Incremental Backups**: Hourly incremental backups
3. **Point-in-Time Recovery**: Binary log enabled
4. **Cross-Region Replication**: For disaster recovery

## Monitoring and Analytics

The system includes comprehensive monitoring:

- **User Activity Tracking**: Login patterns, feature usage
- **Performance Metrics**: Response times, query performance
- **System Health**: Database connections, error rates
- **Business Metrics**: User registrations, consultations, reviews

## Troubleshooting

### Common Issues

1. **Connection Errors**: Check database credentials and network connectivity
2. **Permission Errors**: Ensure database user has proper privileges
3. **Performance Issues**: Check indexes and query optimization
4. **Data Inconsistency**: Use audit logs to trace changes

### Logs and Debugging
- Application logs: `logs/app.log`
- Database logs: MySQL error log
- Audit logs: `metadata_analytics_db.audit_logs` table

## Migration from Existing System

If migrating from the existing single-database system:

1. **Export Data**: Export data from existing tables
2. **Transform Data**: Transform data to match new schema
3. **Import Data**: Import into appropriate databases
4. **Update Application**: Update application code to use new models
5. **Test Thoroughly**: Test all functionality before going live

## Support

For database-related issues:
1. Check the logs first
2. Review the audit trail
3. Test database connections
4. Contact the development team

---

**Note**: This is a production-ready database architecture designed for scalability, security, and maintainability. Always test changes in a development environment before applying to production.
