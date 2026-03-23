# Student CSV Import Template

## Overview
When importing students via CSV, the system will:
1. Auto-generate email if not provided (format: `studentid@collegename.student`)
2. Use **Roll Number** as the password (or Student ID if roll number not provided)
3. Create login credentials automatically for each student

## Required Columns
- `student_id` (or `studentid`, `roll_no`, `roll`, `id`) - Unique identifier
- `name` (or `student_name`, `full_name`) - Student's full name
- `class` (or `class_name`, `sclass`, `sclass_name`) - Class name (must exist in system)

## Optional Columns
- `roll_number` (or `roll_num`, `rollnumber`, `rollnum`) - **Used as password**
- `email` (or `student_email`, `mail`, `e_mail`) - Student email (auto-generated if not provided)
- `phone` (or `mobile`, `contact_number`, `contact_phone`, `mobile_number`) - Contact number
- `section` (or `section_name`) - Section name (must exist for the class)
- `parent_name` (or `guardian_name`) - Parent/Guardian name
- `parent_phone` (or `guardian_phone`) - Parent/Guardian phone
- `board` - Board (STATE, CBSE, IGCSE, IB)
- `group` - Group (e.g., BIPC, PCMB)
- `integrated_course` (or `integratedcourse`) - Integrated course name
- `profile_image` (or `profileimage`) - Profile image URL

## Example CSV

```csv
student_id,name,roll_number,email,phone,class,section,parent_name,parent_phone,board
STU001,Arjun Kumar,1,arjun@example.com,9876543210,10A,A,Mr. Vikram Kumar,9222222222,CBSE
STU002,Priya Sharma,2,,9876543211,10A,A,Mrs. Anjali Sharma,9222222223,CBSE
STU003,Rahul Patel,3,,9876543212,10A,B,Mr. Rajesh Patel,9222222224,CBSE
STU004,Neha Gupta,1,,9876543213,12A,A,Mrs. Neha Gupta,9222222225,CBSE
```

## Login Credentials Generated

For each student created:
- **Email**: Provided email OR auto-generated as `studentid@collegename.student`
- **Password**: Roll Number (if provided) OR Student ID

Example:
- Student ID: STU001, Roll Number: 1 → Password: `1`
- Student ID: STU002, Roll Number: 2 → Password: `2`
- If no roll number: Password = Student ID

## Notes
- Email column is optional - if not provided, system auto-generates it
- Roll number is used as password for security (easy to remember, unique per student)
- All created students receive login credentials in the import result
- Class and Section must already exist in the system
- Board values must be one of: STATE, CBSE, IGCSE, IB
