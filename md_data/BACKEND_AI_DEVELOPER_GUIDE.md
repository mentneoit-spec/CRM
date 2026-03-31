# 🚀 Backend AI Developer Guide

> **Complete guide for integrating AI features into the Gravity CRM backend**

---

## Table of Contents

1. [What is AI](#what-is-ai)
2. [AI Backend Architecture](#ai-backend-architecture)
3. [Current AI Features](#current-ai-features)
4. [How to Call AI Endpoints](#how-to-call-ai-endpoints)
5. [Group API Integration](#group-api-integration)
6. [Database Schema for AI](#database-schema-for-ai)
7. [Multi-Tenant AI Architecture](#multi-tenant-ai-architecture)
8. [Implementation Examples](#implementation-examples)
9. [Error Handling](#error-handling)
10. [Performance & Best Practices](#performance--best-practices)
11. [Future Enhancement Roadmap](#future-enhancement-roadmap)

---

## What is AI

### Definition
AI (Artificial Intelligence) in Gravity CRM is a set of intelligent, context-aware services that help different user roles (Admin, Teacher, Student, Parent) make better decisions, save time, and improve outcomes using machine learning and natural language processing.

### Core AI Capabilities
- **Natural Language Understanding**: Processes user queries and converts them to actionable insights
- **Context Awareness**: Understands the user's role, college context, and group/class information
- **Real-time Analytics**: Analyzes student performance, attendance, fees, and other metrics
- **Predictive Intelligence**: Identifies at-risk students, fee defaulters, and trends
- **Automated Generation**: Creates lesson plans, question papers, schedules, notifications
- **Personalization**: Tailors responses and suggestions based on user role and data

### AI Provider
Currently using **Groq API** with `mixtral-8x7b-32768` model
- Groq API Key: `$GROQ_API_KEY` (configured in `.env`)
- Base URL: `https://api.groq.com/openai/v1`
- Temperature: `0.7` (configurable, default balances creativity and consistency)
- Max Tokens: `2048` (configurable, limits response length)

### Why AI Matters
- **For Admins**: Data-driven decision making, risk detection, strategic planning
- **For Teachers**: Lesson automation, student insights, time-saving tools
- **For Students**: Learning support, personalized guidance, performance tracking
- **For Parents**: Child progress monitoring, smart alerts, actionable suggestions

---

## AI Backend Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│            Frontend (React/Next.js)                 │
│  (AI Dashboards for Admin/Teacher/Student/Parent)  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼ HTTP/REST
┌─────────────────────────────────────────────────────┐
│      Express Server (Node.js Backend)               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │    AI Chatbot Route: /api/ai/chat            │  │
│  │  - Route: routes/aiChatbot.js                │  │
│  │  - Method: POST                              │  │
│  │  - Auth: Requires JWT token                  │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │    Group API: /api/student, /api/teacher     │  │
│  │  - Manages class/section/group hierarchies   │  │
│  │  - Returns context for AI queries            │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │    Data Controllers                          │  │
│  │  - Admin Controller (analytics, risk data)   │  │
│  │  - Student Controller (performance, fees)    │  │
│  │  - Teacher Controller (class insights)       │  │
│  │  - Parent Controller (child data)            │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
    ┌────────────┐      ┌──────────────┐
    │ Groq API   │      │ PostgreSQL   │
    │ (Mixtral)  │      │ Database     │
    │            │      │ (Neon/RDS)   │
    └────────────┘      └──────────────┘
```

### Key Components

#### 1. AI Chatbot Route (`routes/aiChatbot.js`)
```javascript
// Endpoint: POST /api/ai/chat
{
  message: string,          // User query
  role: "student|teacher|admin|parent",  // User role
  conversationHistory: [],  // Previous messages for context
  collegeId: string,        // (Optional) For multi-tenant filtering
  groupId: string           // (Optional) Group/class context
}
```

#### 2. Group API Structure
Groups are used to organize users hierarchically:
```
College
  ├── Sclass (Class/Standard - e.g., "Class 10")
  │   ├── Section (Group/Section - e.g., "A", "B", "C")
  │   │   ├── Students
  │   │   ├── Teachers (assigned via TeacherSectionAssignment)
  │   │   └── Subjects
```

#### 3. Multi-Tenant Context
Every AI query is scoped to a specific college (`collegeId`), ensuring data isolation and security.

---

## Current AI Features

### 1. 🧠 AI Chatbot (Universal)
**Endpoint**: `POST /api/ai/chat`

**Purpose**: Conversational AI assistant for all user roles

**Features**:
- Role-based system prompts (different for each user type)
- Conversation history support for context
- Real-time token usage tracking
- Error resilience with fallback messages

**Response Format**:
```json
{
  "success": true,
  "message": "AI response text",
  "role": "student",
  "timestamp": "2026-03-31T10:00:00.000Z",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 200,
    "total_tokens": 350
  }
}
```

**Example Queries by Role**:
- **Student**: "Help me prepare for maths exam", "What are my weak areas in physics?"
- **Teacher**: "Generate a lesson plan for trigonometry", "Create multiple choice questions on photosynthesis"
- **Admin**: "Show me dropout risk students", "Which department needs improvement?"
- **Parent**: "How is my child performing in mathematics?", "Is there anything I should focus on?"

### 2. 📊 AI Analytics (Admin Feature)
**Data Source**: Uses existing admin analytics with AI enhancement

**AI-Enhanced Insights**:
- Performance prediction by department
- Attendance trend analysis
- Fee collection forecasting
- Risk identification with recommendations

### 3. ⚠️ AI Risk Detection (Admin Feature)
**Purpose**: Identify at-risk students proactively

**Detection Categories**:
- Low attendance (< 75%)
- Failing grades (< 40%)
- Fee defaulters
- Course dropout indicators

### 4. 💰 AI Fee Intelligence (Admin Feature)
**Purpose**: Forecast fees and identify payment patterns

**Insights**:
- Defaulter risk scores
- Collection trend predictions
- Payment pattern analysis
- Seasonal fee patterns

### 5. 📩 AI Bulk Notification Generator (Admin Feature)
**Purpose**: Auto-generate contextual notifications

**Types**:
- Circular announcements
- Personalized fee reminders
- Performance alerts
- Attendance notifications

### 6. 📝 AI Question Paper Generator (Teacher Feature)
**Purpose**: Auto-generate exam questions

**Capabilities**:
- Difficulty level selection (Easy, Medium, Hard)
- Question type mixing (MCQ, Short Answer, Long Answer)
- Topic-based generation
- Customizable marking schemes

### 7. 📊 AI Performance Insights (Student & Teacher Feature)
**Purpose**: Deep learning analytics

**Metrics**:
- Subject-wise performance breakdown
- Comparison to class average
- Improvement trajectory
- Weak area identification with study suggestions

### 8. 🎯 AI Study Planner (Student Feature)
**Purpose**: Personalized study schedules

**Inputs**:
- Student performance data
- Exam dates and targets
- Available study time
- Weak subjects

**Output**:
- Daily study schedule
- Topic prioritization
- Revision timeline
- Resource recommendations

---

## How to Call AI Endpoints

### Authentication
All AI endpoints require JWT authentication:

```javascript
// Request Header
Authorization: Bearer <JWT_TOKEN>
```

### Base Path
```
Development: http://localhost:5000/api/ai
Production: https://api.yoursite.com/api/ai
```

### Main Endpoint: POST /api/ai/chat

#### Basic Request
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "What is photosynthesis?",
    "role": "student"
  }'
```

#### With Conversation History
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Explain it in simpler terms",
    "role": "student",
    "conversationHistory": [
      {
        "role": "user",
        "content": "What is photosynthesis?"
      },
      {
        "role": "assistant",
        "content": "Photosynthesis is a process where plants convert sunlight..."
      }
    ]
  }'
```

#### With Group Context
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Generate a lesson plan for Class 10 Science",
    "role": "teacher",
    "groupContext": {
      "collegeId": "college-123",
      "classId": "class-10",
      "sectionId": "section-a",
      "subject": "Science"
    }
  }'
```

### Health Check Endpoint: GET /api/ai/health

```bash
curl -X GET http://localhost:5000/api/ai/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:
```json
{
  "status": "AI Service Active",
  "groqApiConfigured": true,
  "timestamp": "2026-03-31T10:00:00.000Z"
}
```

### Using in Frontend

#### React Example
```javascript
// Frontend - React Hook
import { useState } from 'react';

function useAIChat(role = 'student') {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (userMessage) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: userMessage,
          role: role,
          conversationHistory: messages
        })
      });

      if (!response.ok) throw new Error('AI request failed');
      
      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: data.message }
      ]);

      return data.message;
    } catch (error) {
      console.error('AI Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
}
```

### Using in Backend

#### Express/Node.js Example
```javascript
// Backend - Fetch AI response for admin analytics
const axios = require('axios');

async function getAIInsights(collegeId, theme) {
  try {
    const response = await fetch('http://localhost:5000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        message: `Give me top 3 insights about ${theme} for college ${collegeId}`,
        role: 'admin',
        groupContext: { collegeId }
      })
    });

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('AI Insights Error:', error);
    return null;
  }
}
```

---

## Group API Integration

### Understanding the Group Hierarchy

[Groups in Gravity CRM follow a hierarchical structure]:

```
College (Multi-Tenant)
  ↓
Sclass (Class/Standard - e.g., B.Tech 2nd Year)
  ↓
Section (Group/Section - e.g., Section A, Group 1)
  ↓
Student / Teacher (Members)
```

### Key Models in Prisma Schema

#### Sclass (Class Model)
```prisma
model Sclass {
  id                        String     @id @default(uuid())
  sclassName                String     // "B.Tech 2nd Year", "Class 10"
  sclassCode                String?
  academicYear              String?
  sectionCount              Int        // Number of sections
  description               String?
  collegeId                 String     // Multi-tenant key
  classTeacherId            String?
  createdAt                 DateTime   @default(now())
  updatedAt                 DateTime   @updatedAt
  
  // Relations
  college                   College    @relation(fields: [collegeId])
  classTeacher              Teacher?   @relation("ClassTeacher")
  Sections                  Section[]
  Students                  Student[]
  Subjects                  Subject[]
  TeacherSectionAssignments TeacherSectionAssignment[]
}
```

#### Section (Group Model)
```prisma
model Section {
  id                        String     @id @default(uuid())
  sectionName               String     // "A", "B", "1", etc.
  capacity                  Int        @default(60)
  sclassId                  String     // Parent class
  collegeId                 String     // Tenant
  
  // Relations
  college                   College    @relation(fields: [collegeId])
  sclass                    Sclass     @relation(fields: [sclassId])
  Students                  Student[]
  TeacherSectionAssignments TeacherSectionAssignment[]
}
```

#### Student (with Group Field)
```prisma
model Student {
  id                String       @id @default(uuid())
  name              String
  studentId         String       // Unique within college
  studentName       String?
  // ...
  group             String?      // Stream/Group: "Science", "Commerce", etc.
  collegeId         String       // Tenant
  sclassId          String?      // Class
  sectionId         String?      // Section within class
  // ...
  
  // Relations
  college           College      @relation(fields: [collegeId])
  sclass            Sclass?      @relation(fields: [sclassId])
  section           Section?     @relation(fields: [sectionId])
}
```

#### TeacherSectionAssignment (Group Assignment)
```prisma
model TeacherSectionAssignment {
  id        String   @id @default(uuid())
  teacherId String
  sclassId  String   // Class ID
  sectionId String   // Section/Group ID
  collegeId String   // Tenant
  
  // Relations
  college   College  @relation(fields: [collegeId])
  sclass    Sclass   @relation(fields: [sclassId])
  section   Section  @relation(fields: [sectionId])
  teacher   Teacher  @relation(fields: [teacherId])
  
  @@unique([teacherId, sectionId])
}
```

### Retrieving Group Context for AI

#### Get Students in a Group
```javascript
// API Endpoint: GET /api/admin/groups/:sectionId/students
const groupStudents = await prisma.student.findMany({
  where: {
    sectionId: sectionId,
    collegeId: collegeId
  },
  include: {
    sclass: true,
    section: true,
    Fees: true,
    ExamResults: true,
    Attendances: true
  }
});
```

#### Get Teachers Assigned to a Group
```javascript
// Get all teachers teaching a section
const groupTeachers = await prisma.teacherSectionAssignment.findMany({
  where: {
    sectionId: sectionId,
    collegeId: collegeId
  },
  include: {
    teacher: true,
    sclass: true
  }
});
```

#### Get Group Analytics
```javascript
// AI-ready group statistics
const groupStats = {
  totalStudents: groupStudents.length,
  averageAttendance: calculateAverage(groupStudents.map(s => s.Attendances)),
  averageGPA: calculateAverage(groupStudents.map(s => s.ExamResults)),
  feeDefaulters: groupStudents.filter(s => hasPendingFees(s.Fees)),
  atRiskStudents: groupStudents.filter(s => s.ExamResults.every(r => r.percentage < 40))
};
```

### Group-Aware AI Queries

```javascript
// Example: Teacher asks for class insights
const aiQuery = `
Provide class performance insights for:
- Class: ${groupData.sclass.sclassName}
- Section: ${groupData.section.sectionName}
- Total Students: ${groupStudents.length}
- Average GPA: ${groupStats.averageGPA}
- At-Risk Students: ${groupStats.atRiskStudents.length}
`;

// Send to AI with context
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: aiQuery,
    role: 'teacher',
    groupContext: {
      collegeId: collegId,
      classId: sclassId,
      sectionId: sectionId,
      stats: groupStats
    }
  })
});
```

---

## Database Schema for AI

### Models Used by AI Features

#### 1. Student Model (for Performance Analysis)
```prisma
Fields: id, name, email, group, sclassId, sectionId, collegeId
Relations: ExamResults, Attendances, Fees, Payments
AI Usage: Performance tracking, group analysis, fee intelligence
```

#### 2. ExamResult Model (for Performance Metrics)
```prisma
Fields: marksObtained, percentage, grade, studentId, subjectId, examId, collegeId
AI Usage: Predict weak areas, calculate at-risk status, trend analysis
```

#### 3. Attendance Model (for Engagement Analysis)
```prisma
Fields: date, status, studentId, subjectId, collegeId
AI Usage: Identify dropout risk, engagement patterns, alerting
```

#### 4. Fee Model (for Financial Predict)
```prisma
Fields: feeType, amount, dueDate, frequency, studentId, collegeId
AI Usage: Defaulter risk, collection forecasting, payment patterns
```

#### 5. Payment Model (for Financial Tracking)
```prisma
Fields: amount, paymentMethod, paymentDate, studentId, collegeId
AI Usage: Payment behavior analysis, collection trends
```

#### 6. Subject Model (for Academic Context)
```prisma
Fields: subName, maxMarks, passingMarks, sclassId, teacherId, collegeId
AI Usage: Curriculum context, performance normalization
```

### Creating AI-Ready Views

```javascript
// SQL View Example: Student Performance Summary
// (Can be queried for quick AI context)

const studentPerformanceSummary = await prisma.$queryRaw`
  SELECT 
    s.id,
    s.name,
    s.group,
    ROUND(AVG(er.percentage)::numeric, 2) as avg_percentage,
    COUNT(DISTINCT er.id) as total_exams,
    COUNT(DISTINCT a.id) as total_attendances,
    ROUND(100.0 * SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / NULLIF(COUNT(DISTINCT a.id), 0)::numeric, 2) as attendance_percentage,
    COUNT(DISTINCT f.id) as total_fees,
    COUNT(DISTINCT CASE WHEN f.id NOT IN (SELECT fee_id FROM payment) THEN f.id END) as pending_fees
  FROM student s
  LEFT JOIN exam_result er ON s.id = er.student_id
  LEFT JOIN attendance a ON s.id = a.student_id
  LEFT JOIN fee f ON s.id = f.student_id
  WHERE s.college_id = $1 AND s.sclass_id = $2
  GROUP BY s.id, s.name, s.group
`;
```

---

## Multi-Tenant AI Architecture

### Key Principles

1. **Data Isolation**: Every AI query must include `collegeId` parameter
2. **Role-Based Access**: Different roles get different AI features
3. **Secure By Default**: Authorization middleware required on all AI endpoints
4. **Audit Trail**: Log all AI queries for compliance and debugging

### Implementation Checklist

```javascript
// ✅ Every AI endpoint must:

// 1. Verify JWT token
router.post('/chat', authorize('Student', 'Teacher', 'Admin', 'Parent'), async (req, res) => {
  
  // 2. Extract user context
  const { userId, collegeId, role } = req.user;
  
  // 3. Validate college exists and is active
  const college = await prisma.college.findUnique({
    where: { id: collegeId }
  });
  
  if (!college || college.status !== 'active') {
    return res.status(403).json({ error: 'College not active' });
  }
  
  // 4. Sanitize and validate query
  const message = sanitizeInput(req.body.message);
  
  // 5. Add college context to AI query
  const aiMessage = `[College: ${college.name}] ${message}`;
  
  // 6. Call AI with scoped data only
  const response = await callGroqAPI({
    message: aiMessage,
    role: role,
    tenant: collegeId
  });
  
  // 7. Log query for audit
  await logAIQuery({
    userId, collegeId, role, message, timestamp: new Date()
  });
  
  // 8. Return response
  res.json(response);
});
```

### Tenant-Scoped Data Queries

```javascript
// Always add collegeId to WHERE clause

// ✅ Correct: College-scoped
const students = await prisma.student.findMany({
  where: {
    collegeId: req.user.collegeId,  // Must have this
    sclassId: classId
  }
});

// ❌ WRONG: Data leak risk
const students = await prisma.student.findMany({
  where: {
    sclassId: classId  // Missing collegeId!
  }
});
```

---

## Implementation Examples

### Example 1: Teacher Asking for Class Insights

```javascript
// Frontend: Teacher Component
async function getClassInsights() {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message: 'Give me insights about my Class 10 Section A performance',
      role: 'teacher',
      groupContext: {
        sectionId: 'section-123'
      }
    })
  });
  
  return response.json();
}

// Backend Processing Flow:
// 1. Validate teacher and section ownership
// 2. Fetch section data: students, marks, attendance
// 3. Aggregate statistics
// 4. Send to AI with system prompt for teachers
// 5. Return insights
```

### Example 2: Admin Requesting Risk Analysis

```javascript
// Admin wants to identify at-risk students
const riskAnalysisQuery = async (collegeId) => {
  // Step 1: Fetch at-risk metrics
  const students = await prisma.student.findMany({
    where: { collegeId },
    include: {
      ExamResults: { 
        include: { subject: true }
      },
      Attendances: true,
      Fees: true
    }
  });

  // Step 2: Calculate risk scores
  const atRiskStudents = students.map(student => ({
    id: student.id,
    name: student.name,
    group: student.group,
    riskFactors: {
      lowAttendance: calculateAttendanceRisk(student.Attendances),
      lowGrades: calculateGradesRisk(student.ExamResults),
      feesDefaulted: calculateFeeRisk(student.Fees)
    }
  })).filter(s => calculateRiskScore(s.riskFactors) > 0.6);

  // Step 3: Ask AI for actions
  const aiResponse = await fetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: `I have identified ${atRiskStudents.length} at-risk students. 
        ${JSON.stringify(atRiskStudents, null, 2)}
        Provide intervention strategies for each risk category.`,
      role: 'admin'
    })
  });

  return aiResponse.json();
};
```

### Example 3: Student Getting Study Recommendations

```javascript
// Student asks for study help
const getStudyRecommendations = async (studentId, collegeId) => {
  // Step 1: Fetch student performance
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      ExamResults: {
        include: { subject: true },
        orderBy: { createdAt: 'desc' },
        take: 20
      },
      Attendances: true
    }
  });

  // Step 2: Identify weak areas
  const subjectPerformance = groupBy(student.ExamResults, 'subject.subName')
    .map(([subject, results]) => ({
      subject,
      avgPercentage: average(results.map(r => r.percentage))
    }))
    .sort((a, b) => a.avgPercentage - b.avgPercentage);

  // Step 3: Get AI personalized plan
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: `I'm a student with these grades: ${JSON.stringify(subjectPerformance)}
        Create a personalized study plan focusing on weak areas.
        My exam is in 30 days.`,
      role: 'student'
    })
  });

  return response.json();
};
```

---

## Error Handling

### Common Error Scenarios

#### 1. Missing API Key
```json
{
  "error": "GROQ_API_KEY not configured",
  "status": 500,
  "details": "Configure GROQ_API_KEY in .env file"
}
```

#### 2. Rate Limiting
```json
{
  "error": "AI service rate limit exceeded",
  "status": 429,
  "details": "Too many requests. Try again in 60 seconds"
}
```

#### 3. Invalid Token
```json
{
  "error": "Unauthorized",
  "status": 401,
  "details": "Invalid or expired JWT token"
}
```

#### 4. AI Service Error
```json
{
  "error": "AI service error",
  "status": 503,
  "details": "Groq API temporarily unavailable"
}
```

### Error Handler Middleware

```javascript
// Add to Express error handling
app.use((err, req, res, next) => {
  if (err.message.includes('GROQ')) {
    return res.status(500).json({
      error: 'AI service unavailable',
      message: 'Please try again later'
    });
  }
  
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: err.retryAfter
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: err.message,
    timestamp: new Date().toISOString()
  });
});
```

### Retry Logic

```javascript
// Implement exponential backoff
async function callAIWithRetry(message, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message })
      });
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Wait before retrying
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

## Performance & Best Practices

### Performance Optimization

#### 1. Caching AI Responses
```javascript
// Cache frequently asked questions
const cache = new Map();

function getCachedResponse(message, role) {
  const key = `${role}:${hashMessage(message)}`;
  return cache.get(key);
}

function cacheResponse(message, role, response, ttl = 3600) {
  const key = `${role}:${hashMessage(message)}`;
  cache.set(key, response);
  
  // Expire after TTL
  setTimeout(() => cache.delete(key), ttl * 1000);
}

// Usage in route
router.post('/chat', async (req, res) => {
  const cached = getCachedResponse(req.body.message, req.body.role);
  if (cached) return res.json(cached);
  
  // ... get fresh response ...
  cacheResponse(req.body.message, req.body.role, response);
});
```

#### 2. Batch Processing
```javascript
// For admin reports, batch AI processing
async function generateBatchInsights(studentIds, collegeId) {
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < studentIds.length; i += batchSize) {
    const batch = studentIds.slice(i, i + batchSize);
    
    const batchResponse = await Promise.all(
      batch.map(id => getStudentInsights(id, collegeId))
    );
    
    results.push(...batchResponse);
  }
  
  return results;
}
```

#### 3. Connection Pooling
```javascript
// Configure Prisma for optimal DB performance
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// .env
// Use connection pooling
DATABASE_URL="postgresql://user:pass@host/db?schema=public&connection_limit=10"
```

### Best Practices

#### 1. Input Validation
```javascript
const { body, validationResult } = require('express-validator');

router.post('/chat',
  body('message').trim().isLength({ min: 5, max: 5000 }).escape(),
  body('role').isIn(['student', 'teacher', 'admin', 'parent']),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ... process request
  }
);
```

#### 2. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many AI requests, please try again later.'
});

router.post('/chat', aiLimiter, async (req, res) => {
  // ... handle request
});
```

#### 3. Security Headers
```javascript
const helmet = require('helmet');
app.use(helmet()); // Adds security headers
```

#### 4. Logging & Monitoring
```javascript
// Log all AI interactions
async function logAIQuery(userId, collegeId, message, response) {
  await prisma.aiAuditLog.create({
    data: {
      userId,
      collegeId,
      message,
      response: response.substring(0, 500), // Store first 500 chars
      tokensUsed: response.usage?.total_tokens,
      responseTime: Date.now() - startTime,
      status: 'success',
      timestamp: new Date()
    }
  });
}
```

#### 5. Token Management
```javascript
// Monitor token usage to avoid unexpected costs
const MONTHLY_TOKEN_BUDGET = 1000000; // 1M tokens/month
let tokensUsedThisMonth = 0;

function checkTokenBudget(tokensNeeded) {
  if (tokensUsedThisMonth + tokensNeeded > MONTHLY_TOKEN_BUDGET) {
    throw new Error('Monthly token budget exceeded');
  }
}
```

---

## Future Enhancement Roadmap

### Phase 1: Core Foundation (Q2 2026)
- ✅ AI Chatbot with role-based prompts
- ✅ Integration with Groq API
- [ ] Implement caching layer
- [ ] Add audit logging

### Phase 2: Advanced Analytics (Q3 2026)
- [ ] Predictive models for dropout risk
- [ ] Fee collection forecasting
- [ ] Attendance pattern analysis
- [ ] Real-time dashboards with AI insights

### Phase 3: Automation (Q4 2026)
- [ ] Automated lesson plan generation
- [ ] Question paper auto-generation
- [ ] Scheduled AI reports (daily/weekly/monthly)
- [ ] Smart notification system

### Phase 4: Personalization (Q1 2027)
- [ ] Learning style adaptation
- [ ] Personalized study paths
- [ ] AI tutoring for weak subjects
- [ ] Parent engagement scoring

### Phase 5: Advanced Integration (Q2 2027)
- [ ] Multi-language support
- [ ] Video analysis for class engagement
- [ ] Document intelligence (PDF/image analysis)
- [ ] Integration with external LMS platforms

### Technology Roadmap
- **Switch to Advanced Models**: Consider GPT-4, Claude 3, or Mixtral 8x22B for better performance
- **Fine-Tuning**: Create college-specific AI models
- **Embeddings**: Implement vector DB (Pinecone, Weaviate) for semantic search
- **RAG (Retrieval-Augmented Generation)**: Pull college-specific data into responses
- **Local Models**: For privacy-critical operations, deploy local LLMs

---

## Quick Reference

### Routes Summary
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/ai/chat` | Send message to AI | ✅ Required |
| GET | `/api/ai/health` | Check AI service status | ✅ Required |

### Environment Variables
```bash
GROQ_API_KEY=your_key_here
TEMPERATURE=0.7
MAX_TOKENS=2048
DATABASE_URL=postgresql://...
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Database Queries for AI Features

**Get at-risk students**:
```sql
SELECT s.id, s.name, AVG(er.percentage) as avg_grade,
       COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as absences
FROM student s
LEFT JOIN exam_result er ON s.id = er.student_id
LEFT JOIN attendance a ON s.id = a.student_id
WHERE s.college_id = $1 AND (AVG(er.percentage) < 40 OR absences > 10)
GROUP BY s.id;
```

**Get fee defaulters**:
```sql
SELECT s.id, s.name, SUM(f.amount) as total_pending
FROM student s
LEFT JOIN fee f ON s.id = f.student_id
WHERE s.college_id = $1 AND f.id NOT IN 
      (SELECT fee_id FROM payment)
GROUP BY s.id;
```

---

## Support & Resources

### Documentation
- Backend API Docs: See `API_DOCUMENTATION.md`
- Frontend Guide: See `AI_FEATURES_GUIDE.md`
- Quick Start: See `QUICK_START_AI.md`

### Common Issues

**Q: AI responses are slow**
- A: Check Groq API status, implement caching, use shorter contexts

**Q: Token limit exceeded**
- A: Reduce max_tokens, implement pagination for large datasets

**Q: Multi-tenant data leak**
- A: Always include collegeId in queries, use middleware to enforce

---

**Last Updated**: March 31, 2026
**Maintained By**: Development Team
**Version**: 1.0.0
