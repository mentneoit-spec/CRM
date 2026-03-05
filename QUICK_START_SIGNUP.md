# Quick Start Guide - Signup Feature

## How to Access the Signup Page

### Option 1: From Login Page
1. Open your browser and go to: http://localhost:3000/login
2. Scroll down to the bottom of the login form
3. Click on the "Sign Up" button

### Option 2: Direct URL
1. Open your browser
2. Navigate directly to: http://localhost:3000/signup

### Option 3: From Landing Page
1. Go to: http://localhost:3000
2. Click on "Get Started" or "Sign Up" button (if available)
3. Or click "Login" and then "Sign Up"

## Registration Steps

### Step 1: Select Your Role
Choose one of the following roles:
- **Student** - For students enrolling in courses
- **Teacher** - For teaching staff
- **Parent** - For parents/guardians
- **Admin** - For college administrators (requires college name)

### Step 2: Fill in Your Details

#### Required Fields (marked with *)
- Full Name
- Email Address
- Password (minimum 6 characters)
- Confirm Password

#### Optional Fields
- Phone Number
- Date of Birth
- Gender

#### Admin-Specific Field
- College/School Name (required only for Admin role)

### Step 3: Submit
1. Click the "Create Account" button
2. Wait for the registration to process
3. You'll see a success message
4. You'll be automatically redirected to the login page

### Step 4: Login
1. Use your registered email and password
2. Select your role
3. Click "Sign In"

## Example Registration

### Student Registration
```
Role: Student
Name: John Doe
Email: john.doe@example.com
Phone: +91 9876543210
Date of Birth: 2000-01-15
Gender: Male
Password: student123
Confirm Password: student123
```

### Admin Registration
```
Role: Admin
Name: Jane Smith
Email: jane.smith@college.edu
Phone: +91 9876543211
College Name: ABC College of Engineering
Password: admin123
Confirm Password: admin123
```

## Troubleshooting

### "Email is required" error
- Make sure you've entered a valid email address
- Format: username@domain.com

### "Passwords do not match" error
- Check that both password fields have the same value
- Passwords are case-sensitive

### "Password must be at least 6 characters long" error
- Use a password with 6 or more characters
- Example: "pass123" or "mypassword"

### "College name is required for Admin registration" error
- This appears only for Admin role
- Enter your institution's name in the College Name field

### "Registration failed" error
- Check your internet connection
- Make sure the backend server is running
- Try again after a few seconds

## Navigation

### From Signup to Login
- Click "Sign In" button at the bottom of the signup form
- Or use the back button in your browser

### From Login to Signup
- Click "Sign Up" button at the bottom of the login form

## URLs Reference

| Page | URL |
|------|-----|
| Landing Page | http://localhost:3000 |
| Login Page | http://localhost:3000/login |
| Signup Page | http://localhost:3000/signup |
| Admission Portal | http://localhost:3000/admission |
| Student Dashboard | http://localhost:3000/student/dashboard |
| Teacher Dashboard | http://localhost:3000/teacher/dashboard |
| Parent Dashboard | http://localhost:3000/parent/dashboard |
| Admin Dashboard | http://localhost:3000/admin/dashboard |

## Tips

1. **Use a valid email**: You might need it for password recovery later
2. **Remember your password**: Write it down securely
3. **Choose the correct role**: This determines your access level
4. **Fill optional fields**: Helps with profile completeness
5. **Check for typos**: Especially in email and password fields

## Security Notes

- Passwords are encrypted before storage
- Use a strong password (mix of letters, numbers, symbols)
- Don't share your credentials
- Log out after using shared computers

## Need Help?

If you encounter any issues:
1. Check the browser console for errors (F12 → Console tab)
2. Verify the backend server is running (http://localhost:5001/api/health)
3. Check the TEST_RESULTS.md file for system status
4. Review the SIGNUP_FEATURE_ADDED.md for technical details

## What's Next?

After successful registration:
1. Login with your credentials
2. Complete your profile
3. Explore the dashboard
4. Start using the system features

Enjoy using the College ERP System! 🎓
