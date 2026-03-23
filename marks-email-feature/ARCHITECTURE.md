# 🏗️ System Architecture

## Overview

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Admin     │────────▶│   React     │────────▶│   Express   │
│  (Browser)  │         │  Frontend   │         │   Backend   │
└─────────────┘         └─────────────┘         └─────────────┘
                              │                        │
                              │                        ▼
                              │                  ┌─────────────┐
                              │                  │   MongoDB   │
                              │                  │  Database   │
                              │                  └─────────────┘
                              │                        │
                              │                        ▼
                              │                  ┌─────────────┐
                              └─────────────────▶│  Nodemailer │
                                                 │    Gmail    │
                                                 └─────────────┘
                                                       │
                                                       ▼
                                                 ┌─────────────┐
                                                 │   Student   │
                                                 │    Email    │
                                                 └─────────────┘
```

---

## Data Flow

### 1. Admin Enters Marks

```
Admin Form
    │
    ├─ Student ID: STU001
    ├─ Subject: Mathematics
    ├─ Marks: 85
    └─ Total: 100
    │
    ▼
POST /api/send-marks
```

### 2. Backend Processing

```
Express Server
    │
    ├─ Validate Input
    │   └─ Check required fields
    │   └─ Validate marks range
    │
    ├─ Find Student in DB
    │   └─ Query: { studentId: "STU001" }
    │   └─ Get: name, email
    │
    ├─ Save Marks Record
    │   └─ Create Marks document
    │   └─ Store in MongoDB
    │
    ├─ Calculate Grade
    │   └─ Percentage: (85/100) * 100 = 85%
    │   └─ Grade: A
    │
    ├─ Send Email
    │   └─ Nodemailer + Gmail SMTP
    │   └─ HTML template with data
    │
    └─ Return Response
        └─ Success/Error message
```

### 3. Email Delivery

```
Nodemailer
    │
    ├─ Connect to Gmail SMTP
    │   └─ smtp.gmail.com:587
    │
    ├─ Authenticate
    │   └─ App Password
    │
    ├─ Compose Email
    │   ├─ To: student@example.com
    │   ├─ Subject: Exam Results - Mathematics
    │   └─ Body: HTML template
    │
    └─ Send
        └─ Student receives email
```

---

## Database Schema

### Student Collection

```javascript
{
  _id: ObjectId("..."),
  studentId: "STU001",        // Unique identifier
  name: "John Doe",           // Student name
  email: "john@example.com",  // Email for notifications
  phone: "1234567890",        // Optional
  class: "10th Grade",        // Optional
  createdAt: ISODate("...")
}
```

### Marks Collection

```javascript
{
  _id: ObjectId("..."),
  studentId: "STU001",        // Reference to Student
  subject: "Mathematics",     // Subject name
  marks: 85,                  // Marks obtained
  totalMarks: 100,            // Total marks
  examType: "Final",          // Exam type
  remarks: "Good work",       // Optional
  emailSent: true,            // Email status
  sentAt: ISODate("..."),     // When email was sent
  createdAt: ISODate("...")
}
```

---

## API Architecture

### Routes Structure

```
/api
├── /students
│   ├── GET    /           → Get all students
│   └── POST   /           → Create student
│
├── /marks
│   └── GET    /:studentId → Get marks history
│
└── /send-marks
    └── POST   /           → Send marks & email
```

### Request/Response Flow

```
Client Request
    │
    ▼
Express Middleware
    ├─ CORS
    ├─ Body Parser
    └─ Error Handler
    │
    ▼
Route Handler
    ├─ Validate Input
    ├─ Business Logic
    └─ Database Operations
    │
    ▼
Response
    └─ JSON { success, message, data }
```

---

## Frontend Architecture

### Component Hierarchy

```
App
├── Header
│   ├── Title
│   └── Description
│
└── Container
    ├── MarksForm
    │   ├── Student Dropdown
    │   ├── Subject Input
    │   ├── Marks Input
    │   ├── Total Marks Input
    │   ├── Exam Type Select
    │   └── Submit Button
    │
    └── StudentsList
        └── Student Cards
            ├── Name
            ├── ID
            ├── Email
            └── Class
```

### State Management

```javascript
App State
├── students: []           // List of all students
└── loading: false         // Loading state

MarksForm State
├── formData: {}          // Form inputs
├── loading: false        // Submit loading
└── message: {}           // Success/Error message
```

---

## Email Template Structure

```html
Email Layout
├── Header (Gradient)
│   └── "📊 Exam Results"
│
├── Content
│   ├── Greeting
│   │   └── "Dear [Student Name]"
│   │
│   ├── Marks Box
│   │   ├── Subject
│   │   ├── Marks Obtained
│   │   └── Percentage
│   │
│   ├── Grade Display
│   │   └── Large centered grade
│   │
│   └── Message
│       └── Congratulations/Motivation
│
└── Footer
    ├── Disclaimer
    └── Copyright
```

---

## Security Layers

```
Security Measures
├── Environment Variables
│   └── Sensitive data in .env
│
├── Input Validation
│   ├── Required fields check
│   ├── Data type validation
│   └── Range validation
│
├── Database Security
│   ├── Mongoose schema validation
│   └── Unique constraints
│
├── Email Security
│   ├── App Password (not real password)
│   └── TLS encryption
│
└── CORS
    └── Cross-origin protection
```

---

## Error Handling

```
Error Flow
├── Client-Side
│   ├── Form validation
│   ├── Network errors
│   └── Display error messages
│
└── Server-Side
    ├── Input validation errors (400)
    ├── Not found errors (404)
    ├── Server errors (500)
    └── Email sending errors
```

---

## Performance Considerations

### Backend Optimization

```
Optimizations
├── Database Indexing
│   └── Index on studentId
│
├── Connection Pooling
│   └── MongoDB connection reuse
│
├── Email Queue (Future)
│   └── Bull/Redis for async emails
│
└── Caching (Future)
    └── Cache student data
```

### Frontend Optimization

```
Optimizations
├── React.memo
│   └── Prevent unnecessary re-renders
│
├── Lazy Loading
│   └── Code splitting
│
└── Debouncing
    └── Form input delays
```

---

## Deployment Architecture

### Production Setup

```
Production
├── Frontend
│   ├── Netlify/Vercel
│   ├── CDN Distribution
│   └── Environment Variables
│
├── Backend
│   ├── Heroku/Railway/Render
│   ├── Environment Variables
│   └── Auto-scaling
│
└── Database
    ├── MongoDB Atlas
    ├── Automated Backups
    └── Replica Sets
```

---

## Technology Stack Details

### Backend Stack

```
Node.js Runtime
    │
    ├── Express.js (Web Framework)
    │   ├── Routing
    │   ├── Middleware
    │   └── Error Handling
    │
    ├── Mongoose (ODM)
    │   ├── Schema Definition
    │   ├── Validation
    │   └── Query Building
    │
    ├── Nodemailer (Email)
    │   ├── SMTP Transport
    │   ├── HTML Templates
    │   └── Attachments Support
    │
    └── Additional Packages
        ├── cors (CORS handling)
        ├── dotenv (Environment variables)
        └── express (Server framework)
```

### Frontend Stack

```
React.js
    │
    ├── Components
    │   ├── Functional Components
    │   ├── Hooks (useState, useEffect)
    │   └── Props
    │
    ├── Axios (HTTP Client)
    │   ├── API Calls
    │   ├── Interceptors
    │   └── Error Handling
    │
    └── CSS3
        ├── Flexbox
        ├── Grid
        └── Animations
```

---

## Scalability Considerations

### Current Capacity

```
Single Server Setup
├── ~1000 concurrent users
├── ~100 emails/minute
└── ~10GB database
```

### Future Scaling

```
Horizontal Scaling
├── Load Balancer
│   └── Multiple backend instances
│
├── Email Queue
│   └── Redis + Bull
│   └── Background workers
│
├── Database Sharding
│   └── Distribute by college/school
│
└── Microservices
    ├── Student Service
    ├── Marks Service
    └── Email Service
```

---

## Monitoring & Logging

```
Observability
├── Application Logs
│   ├── Request/Response logs
│   ├── Error logs
│   └── Email delivery logs
│
├── Performance Metrics
│   ├── Response times
│   ├── Database queries
│   └── Email send rate
│
└── Alerts
    ├── Email failures
    ├── Database errors
    └── High error rates
```

---

**This architecture supports the current implementation and provides a roadmap for future enhancements.**
