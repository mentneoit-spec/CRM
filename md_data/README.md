# College ERP System

A comprehensive College/School Management System built with React, Node.js, Express, Prisma, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database (or use Neon cloud database)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/UVineethaa/collegedata.git
cd collegedata
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure Environment Variables**

Backend `.env`:
```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_jwt_secret"
PORT=5001
```

Frontend `.env`:
```env
REACT_APP_API_URL=http://localhost:5001/api
```

5. **Run Database Migrations**
```bash
cd backend
npx prisma generate
npx prisma db push
```

6. **Start the Application**

Terminal 1 - Backend:
```bash
cd backend
npm start
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## 🎯 Features

### Authentication
- ✅ Email/Password login
- ✅ Phone OTP login
- ✅ Role-based authentication
- ✅ JWT token management
- ✅ Secure password hashing

### User Roles
- **Student**: Access to attendance, marks, homework, fees
- **Teacher**: Manage classes, attendance, assignments
- **Parent**: View children's progress and fees
- **Admin**: Manage students, teachers, classes, subjects
- **SuperAdmin**: Platform-wide management

### Core Modules
- Student Management
- Teacher Management
- Class & Subject Management
- Attendance Tracking
- Exam & Results Management
- Fee Management
- Admission Portal
- Notice Board
- Transport Management

## 🧪 Test Accounts

### Student
- Email: `teststudent@example.com`
- Password: `test123`

### Teacher
- Email: `newteacher@example.com`
- Password: `test123`

### Admin
- Email: `admin@college.com`
- Password: `admin123`

## �️ Tech Stack

### Frontend
- React.js
- Material-UI
- React Router
- Redux Toolkit
- Axios

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Bcrypt

## 📁 Project Structure

```
collegedata/
├── backend/
│   ├── controllers/     # API controllers
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation
│   ├── prisma/          # Database schema
│   └── utils/           # Helper functions
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── redux/       # State management
│   │   └── services/    # API services
│   └── public/
└── README.md
```

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Role-based access control
- Input validation
- SQL injection prevention (Prisma)

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/otp/request` - Request OTP
- `POST /api/auth/otp/verify` - Verify OTP

### Student Endpoints
- `GET /api/student/profile` - Get student profile
- `GET /api/student/attendance` - Get attendance records
- `GET /api/student/marks` - Get exam results
- `GET /api/student/fees` - Get fee details

### Admin Endpoints
- `GET /api/admin/dashboard` - Get dashboard stats
- `POST /api/admin/students` - Create student
- `GET /api/admin/students` - List all students
- `POST /api/admin/teachers` - Create teacher

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)
1. Set environment variables
2. Deploy from GitHub
3. Run migrations

### Frontend Deployment (Netlify/Vercel)
1. Build the app: `npm run build`
2. Deploy the `build` folder
3. Set environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Uppada Vineetha

## 🐛 Bug Reports

If you find a bug, please open an issue on GitHub with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

## 📞 Support

For support, email: uppadavineetha@gmail.com

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: March 6, 2026
