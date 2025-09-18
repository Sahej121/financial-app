# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this format:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data (if applicable)
  "error": "Error message" // Only present on errors
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "user" // Optional: user, ca, financial_planner, admin
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Login User
**POST** `/auth/login`

Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Get User Profile
**GET** `/auth/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Document Management

### Upload Document
**POST** `/documents/upload`

Upload a financial document for review.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
file: <file>
category: "tax_document" // tax_document, financial_statement, identity_proof, etc.
priority: "high" // low, medium, high, urgent
clientNotes: "Additional notes about the document"
```

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "id": 1,
    "fileName": "tax_return_2023.pdf",
    "category": "tax_document",
    "priority": "high",
    "status": "submitted",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get User Documents
**GET** `/documents/user`

Get all documents uploaded by the current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status (submitted, in_review, approved, rejected)
- `category` (optional): Filter by category
- `limit` (optional): Number of documents to return (default: 10)
- `offset` (optional): Number of documents to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "id": 1,
      "fileName": "tax_return_2023.pdf",
      "category": "tax_document",
      "priority": "high",
      "status": "in_review",
      "uploadedAt": "2024-01-01T00:00:00.000Z",
      "assignedTo": {
        "id": 2,
        "name": "CA Smith",
        "role": "ca"
      }
    }
  ],
  "total": 1
}
```

### Get Pending Documents (Professionals)
**GET** `/documents/pending`

Get documents pending review (for CAs and Financial Planners).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `role` (optional): Filter by professional role (ca, financial_planner)
- `priority` (optional): Filter by priority level

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "id": 1,
      "fileName": "tax_return_2023.pdf",
      "category": "tax_document",
      "priority": "urgent",
      "status": "submitted",
      "uploadedAt": "2024-01-01T00:00:00.000Z",
      "owner": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "clientNotes": "Please review for tax optimization"
    }
  ]
}
```

### Assign Document
**PATCH** `/documents/:documentId/assign`

Assign a document to a professional for review.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "professionalId": 2,
  "professionalRole": "ca"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document assigned successfully"
}
```

### Review Document
**PATCH** `/documents/:documentId/review`

Submit a review for an assigned document.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "approved", // approved, rejected, requires_changes
  "reviewNotes": "Document is complete and accurate. No issues found."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document review submitted successfully"
}
```

### Download Document
**GET** `/documents/:documentId/download`

Download a document (authorized users only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```
File download stream
```

---

## Meeting Management

### Get User Meetings
**GET** `/meetings/user`

Get meetings for the current user (client).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `upcoming` (optional): Filter upcoming meetings (true/false)
- `status` (optional): Filter by status (scheduled, confirmed, completed, cancelled)

**Response:**
```json
{
  "success": true,
  "meetings": [
    {
      "id": 1,
      "title": "Tax Planning Consultation",
      "planningType": "tax_planning",
      "status": "scheduled",
      "startsAt": "2024-01-15T10:00:00.000Z",
      "duration": 60,
      "professional": {
        "id": 2,
        "name": "CA Smith",
        "role": "ca",
        "email": "ca.smith@example.com"
      },
      "zoomJoinUrl": "https://zoom.us/j/123456789",
      "zoomStartUrl": "https://zoom.us/s/123456789"
    }
  ]
}
```

### Get Professional Meetings
**GET** `/meetings/professional`

Get meetings assigned to the current professional.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `role` (optional): Professional role (ca, financial_planner)
- `upcoming` (optional): Filter upcoming meetings (true/false)

**Response:**
```json
{
  "success": true,
  "meetings": [
    {
      "id": 1,
      "title": "Tax Planning Consultation",
      "planningType": "tax_planning",
      "status": "scheduled",
      "startsAt": "2024-01-15T10:00:00.000Z",
      "duration": 60,
      "client": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "documents": [
        {
          "id": 1,
          "fileName": "tax_return_2023.pdf",
          "status": "approved"
        }
      ]
    }
  ]
}
```

### Create Meeting
**POST** `/meetings`

Create a new meeting (professionals and admins only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Tax Planning Consultation",
  "planningType": "tax_planning", // tax_planning, business_expansion, loan_protection
  "clientId": 1,
  "startsAt": "2024-01-15T10:00:00.000Z",
  "duration": 60,
  "description": "Discussion about tax optimization strategies"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Meeting created successfully",
  "meeting": {
    "id": 1,
    "title": "Tax Planning Consultation",
    "planningType": "tax_planning",
    "status": "scheduled",
    "startsAt": "2024-01-15T10:00:00.000Z",
    "duration": 60
  }
}
```

### Update Meeting Status
**PATCH** `/meetings/:id/status`

Update the status of a meeting.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "confirmed" // scheduled, confirmed, completed, cancelled
}
```

**Response:**
```json
{
  "success": true,
  "message": "Meeting status updated successfully"
}
```

### Generate Zoom Link
**POST** `/meetings/:id/zoom-link`

Generate Zoom meeting link for a meeting (professionals only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Zoom link generated successfully",
  "zoomData": {
    "joinUrl": "https://zoom.us/j/123456789",
    "startUrl": "https://zoom.us/s/123456789",
    "meetingId": "123456789",
    "password": "abc123"
  }
}
```

---

## Analytics Endpoints

### Get Analytics Summary
**GET** `/analytics/summary`

Get analytics summary for the current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (optional): Time period (month, quarter, year) - default: month

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalDocuments": 5,
    "totalMeetings": 3,
    "completedMeetings": 2,
    "upcomingMeetings": 1,
    "documentStats": {
      "submitted": 2,
      "in_review": 1,
      "approved": 2
    },
    "meetingStats": {
      "scheduled": 1,
      "completed": 2
    },
    "period": "month",
    "dateRange": {
      "start": "2023-12-01T00:00:00.000Z",
      "end": "2024-01-01T00:00:00.000Z"
    }
  },
  "recentActivity": {
    "documents": [
      {
        "id": 1,
        "fileName": "tax_return_2023.pdf",
        "status": "approved",
        "uploadedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "meetings": [
      {
        "id": 1,
        "title": "Tax Planning Consultation",
        "status": "completed",
        "startsAt": "2024-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

### Get Chart Data
**GET** `/analytics/charts`

Get chart data for dashboard visualizations.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `type` (required): Chart type (documents, meetings, activity)
- `period` (optional): Time period (week, month, quarter, year)

**Response:**
```json
{
  "success": true,
  "chartData": {
    "documentActivity": [
      {
        "date": "2024-01-01",
        "documents": 2
      },
      {
        "date": "2024-01-02",
        "documents": 1
      }
    ],
    "meetingActivity": [
      {
        "date": "2024-01-01",
        "meetings": 1
      }
    ]
  },
  "type": "activity",
  "period": "month"
}
```

### Get Business Insights
**GET** `/analytics/insights`

Get business insights and recommendations.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "insights": [
    {
      "type": "recommendation",
      "title": "Document Organization",
      "message": "Consider organizing your documents by category for better management",
      "priority": "medium"
    },
    {
      "type": "alert",
      "title": "Upcoming Meeting",
      "message": "You have a meeting scheduled for tomorrow at 10:00 AM",
      "priority": "high"
    }
  ]
}
```

---

## CA Management

### Get CAs
**GET** `/cas`

Get list of available Chartered Accountants.

**Query Parameters:**
- `experience` (optional): Filter by years of experience
- `fee_range` (optional): Filter by fee range (min-max)
- `specialization` (optional): Filter by specialization
- `limit` (optional): Number of results (default: 10)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "cas": [
    {
      "id": 1,
      "name": "CA Smith",
      "email": "ca.smith@example.com",
      "yearsOfExperience": 10,
      "consultingFee": 1500,
      "specializations": ["tax_planning", "audit"],
      "rating": 4.8,
      "profilePicture": "https://example.com/profile.jpg",
      "bio": "Experienced CA specializing in tax planning and audit services"
    }
  ],
  "total": 1
}
```

---

## Credit Card Recommendations

### Get Credit Card Recommendations
**POST** `/credit-cards/recommend`

Get personalized credit card recommendations based on user profile.

**Request Body:**
```json
{
  "annualIncome": 500000,
  "monthlyExpenses": 25000,
  "lifestylePreferences": {
    "dining": "frequent",
    "travel": "occasional",
    "shopping": "moderate"
  },
  "cardUsage": "personal",
  "preferences": {
    "feeTolerance": "low",
    "benefits": ["cashback", "rewards"],
    "emiRequired": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "cardName": "Premium Cashback Card",
      "issuer": "Bank Name",
      "annualFee": 2000,
      "benefits": [
        "5% cashback on dining",
        "2% cashback on groceries",
        "1% cashback on all other purchases"
      ],
      "eligibility": "High",
      "matchScore": 95,
      "whyRecommended": "Matches your dining preferences and income level"
    }
  ]
}
```

### Apply for Credit Card
**POST** `/credit-cards/apply`

Submit credit card application.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "cardId": 1,
  "personalDetails": {
    "fullName": "John Doe",
    "dateOfBirth": "1990-01-01",
    "phoneNumber": "+1234567890",
    "address": "123 Main St, City, State"
  },
  "financialDetails": {
    "annualIncome": 500000,
    "employmentStatus": "employed",
    "companyName": "ABC Corp"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "applicationId": "APP123456789",
  "status": "pending"
}
```

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication required
- `INVALID_TOKEN`: Invalid or expired token
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `SERVER_ERROR`: Internal server error

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- **Authentication endpoints**: 5 requests per minute
- **Document upload**: 10 requests per minute
- **General API**: 100 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

---

## WebSocket Events

### Real-time Notifications
Connect to WebSocket for real-time updates:

```javascript
const socket = io('http://localhost:3001');

// Listen for document status updates
socket.on('documentStatusUpdate', (data) => {
  console.log('Document status updated:', data);
});

// Listen for meeting notifications
socket.on('meetingNotification', (data) => {
  console.log('Meeting notification:', data);
});
```

### Available Events
- `documentStatusUpdate`: Document review status changed
- `meetingNotification`: New meeting scheduled or updated
- `messageReceived`: New chat message received
- `systemAlert`: System-wide notifications
