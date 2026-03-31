const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/email-service');

// ==================== HR MANAGER CRUD ====================

// Add new HR Manager (Admin only)
const addHRManager = async (req, res) => {
    try {
        console.log('=== ADD HR MANAGER DEBUG ===');
        console.log('Request body:', JSON.stringify(req.body));
        console.log('Request user:', JSON.stringify(req.user));
        
        const { name, email, phone, designation, department } = req.body;
        const collegeId = req.user.collegeId;

        console.log('Extracted data:', { name, email, phone, designation, department, collegeId });

        if (!collegeId) {
            console.log('ERROR: No collegeId from user token');
            return res.status(400).json({
                success: false,
                message: 'College ID is required',
            });
        }

        if (!name || !email) {
            console.log('ERROR: Missing required fields - name:', name, 'email:', email);
            return res.status(400).json({
                success: false,
                message: 'Name and email are required',
            });
        }

        // Check if HR Manager with this email already exists
        const existingHR = await prisma.hRManager.findFirst({
            where: {
                email: email.toLowerCase(),
                collegeId,
            },
        });

        console.log('Existing HR check:', existingHR ? 'EXISTS' : 'NEW');

        if (existingHR) {
            return res.status(400).json({
                success: false,
                message: 'HR Manager with this email already exists',
            });
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-12);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        console.log('Creating user with:', { name, email: email.toLowerCase(), phone, role: 'HR', collegeId });

        // Create User
        let user;
        try {
            user = await prisma.user.create({
                data: {
                    name,
                    email: email.toLowerCase(),
                    phone,
                    password: hashedPassword,
                    tempPassword, // Store plain-text temporary password for display
                    role: 'HR',
                    collegeId,
                    isActive: true,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    tempPassword: true,
                    createdAt: true,
                },
            });
            console.log('User created successfully:', user.id, 'Password:', user.tempPassword);
        } catch (userError) {
            console.error('Failed to create User:', userError.message);
            throw userError;
        }

        console.log('Creating HR Manager with:', { name, email: email.toLowerCase(), phone, designation, department, collegeId, userId: user.id });

        // Create HR Manager profile
        let hrManager;
        try {
            hrManager = await prisma.hRManager.create({
                data: {
                    name,
                    email: email.toLowerCase(),
                    phone,
                    designation: designation || 'HR Manager',
                    department: department || 'Human Resources',
                    collegeId,
                    userId: user.id,
                    isActive: true,
                },
                include: {
                    college: {
                        select: { name: true, email: true },
                    },
                },
            });
            console.log('HR Manager created successfully:', hrManager.id);
        } catch (hrError) {
            console.error('Failed to create HR Manager:', hrError.message);
            throw hrError;
        }

        // Send email with credentials (non-blocking)
        const emailContent = `
            <h2>Welcome to ${hrManager.college.name}!</h2>
            <p>Your HR Manager account has been created.</p>
            <h3>Login Credentials:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            <p>Please log in and change your password immediately.</p>
            <p>You can now manage employees, track attendance, and handle payroll.</p>
        `;

        // Send email in background without blocking response
        sendEmail(
            email,
            'HR Manager Account Created',
            emailContent
        ).catch(err => {
            console.error('Failed to send HR Manager email:', err);
        });

        return res.status(201).json({
            success: true,
            message: 'HR Manager added successfully',
            data: {
                ...hrManager,
                tempPassword, // Return for admin display
            },
        });
    } catch (error) {
        console.error('=== ERROR ADDING HR MANAGER ===');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        // Handle specific Prisma errors
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'Email already exists in this college',
                error: 'Unique constraint violation on email',
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Error adding HR Manager',
            error: error.message,
            code: error.code,
        });
    }
};

// Get all HR Managers for college
const getHRManagers = async (req, res) => {
    try {
        console.log('=== GET HR MANAGERS DEBUG ===');
        console.log('Request URL:', req.originalUrl);
        console.log('Request headers:', req.headers);
        console.log('Request user:', req.user?.id);
        
        const collegeId = req.user.collegeId;
        
        console.log('College ID:', collegeId);

        if (!collegeId) {
            console.log('ERROR: No collegeId from user');
            return res.status(400).json({
                success: false,
                message: 'College ID is required',
            });
        }

        const hrManagers = await prisma.hRManager.findMany({
            where: { collegeId },
            include: {
                user: {
                    select: { lastLogin: true, isActive: true, createdAt: true, tempPassword: true },
                },
                Employees: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        console.log('Found HR Managers:', hrManagers.length);

        return res.status(200).json({
            success: true,
            data: hrManagers,
        });
    } catch (error) {
        console.error('=== ERROR FETCHING HR MANAGERS ===');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error:', JSON.stringify(error, null, 2));
        return res.status(500).json({
            success: false,
            message: 'Error fetching HR Managers',
            error: error.message,
        });
    }
};

// Delete HR Manager
const deleteHRManager = async (req, res) => {
    try {
        const { hrManagerId } = req.params;
        const collegeId = req.user.collegeId;

        const hrManager = await prisma.hRManager.findFirst({
            where: { id: hrManagerId, collegeId },
        });

        if (!hrManager) {
            return res.status(404).json({
                success: false,
                message: 'HR Manager not found',
            });
        }

        // Delete associated user
        await prisma.user.delete({
            where: { id: hrManager.userId },
        });

        // Delete HR Manager
        await prisma.hRManager.delete({
            where: { id: hrManagerId },
        });

        return res.status(200).json({
            success: true,
            message: 'HR Manager deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting HR Manager:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting HR Manager',
            error: error.message,
        });
    }
};

// ==================== EMPLOYEE CRUD ====================

// Add new Employee (HR Manager or Admin)
const addEmployee = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            employeeId,
            department,
            designation,
            dateOfJoining,
            dateOfBirth,
            gender,
            qualification,
            experience,
            salary,
            bankAccount,
            bankName,
            ifscCode,
            address,
        } = req.body;

        const collegeId = req.user.collegeId;
        const hrManagerId = req.user.HRManagerProfile?.id || req.body.hrManagerId;

        if (!collegeId) {
            return res.status(400).json({
                success: false,
                message: 'College ID is required',
            });
        }

        if (!name || !email || !employeeId || !department || !designation) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields',
            });
        }

        // Check if employee with this email already exists
        const existingEmployee = await prisma.employee.findFirst({
            where: {
                email: email.toLowerCase(),
                collegeId,
            },
        });

        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: 'Employee with this email already exists',
            });
        }

        // Check if employeeId is unique
        const existingId = await prisma.employee.findFirst({
            where: {
                employeeId,
                collegeId,
            },
        });

        if (existingId) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID already exists',
            });
        }

        // Create Employee
        const employee = await prisma.employee.create({
            data: {
                name,
                email: email.toLowerCase(),
                phone,
                employeeId,
                department,
                designation,
                dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : null,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                gender,
                qualification,
                experience: experience ? parseInt(experience) : 0,
                salary: salary ? parseFloat(salary) : 0,
                bankAccount,
                bankName,
                ifscCode,
                address,
                collegeId,
                hrManagerId,
                status: 'Active',
            },
            include: {
                hrManager: {
                    select: { name: true, email: true },
                },
                college: {
                    select: { name: true },
                },
            },
        });

        return res.status(201).json({
            success: true,
            message: 'Employee added successfully',
            data: employee,
        });
    } catch (error) {
        console.error('Error adding Employee:', error);
        return res.status(500).json({
            success: false,
            message: 'Error adding Employee',
            error: error.message,
        });
    }
};

// Get all Employees
const getEmployees = async (req, res) => {
    try {
        const collegeId = req.user.collegeId;
        const { hrManagerId, department, status } = req.query;

        let where = { collegeId };
        if (hrManagerId) where.hrManagerId = hrManagerId;
        if (department) where.department = department;
        if (status) where.status = status;

        const employees = await prisma.employee.findMany({
            where,
            include: {
                hrManager: {
                    select: { id: true, name: true, email: true },
                },
                Attendances: {
                    select: { id: true, date: true, status: true },
                    orderBy: { date: 'desc' },
                    take: 5,
                },
                SalaryDetails: {
                    select: { id: true, month: true, year: true, netSalary: true, status: true },
                    orderBy: { createdAt: 'desc' },
                    take: 3,
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate stats
        const stats = {
            totalEmployees: employees.length,
            activeEmployees: employees.filter((e) => e.status === 'Active').length,
            totalSalary: employees.reduce((sum, e) => sum + e.salary, 0),
        };

        return res.status(200).json({
            success: true,
            data: employees,
            stats,
        });
    } catch (error) {
        console.error('Error fetching Employees:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching Employees',
            error: error.message,
        });
    }
};

// Get single Employee
const getEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const collegeId = req.user.collegeId;

        const employee = await prisma.employee.findFirst({
            where: { id: employeeId, collegeId },
            include: {
                hrManager: true,
                Attendances: {
                    orderBy: { date: 'desc' },
                    take: 30,
                },
                SalaryDetails: {
                    orderBy: { createdAt: 'desc' },
                    take: 12,
                },
                LeaveRecords: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: employee,
        });
    } catch (error) {
        console.error('Error fetching Employee:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching Employee',
            error: error.message,
        });
    }
};

// Update Employee
const updateEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const collegeId = req.user.collegeId;
        const updateData = req.body;

        const employee = await prisma.employee.findFirst({
            where: { id: employeeId, collegeId },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        // Parse date fields if provided
        if (updateData.dateOfJoining) {
            updateData.dateOfJoining = new Date(updateData.dateOfJoining);
        }
        if (updateData.dateOfBirth) {
            updateData.dateOfBirth = new Date(updateData.dateOfBirth);
        }
        if (updateData.salary) {
            updateData.salary = parseFloat(updateData.salary);
        }

        const updated = await prisma.employee.update({
            where: { id: employeeId },
            data: updateData,
            include: {
                hrManager: true,
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
            data: updated,
        });
    } catch (error) {
        console.error('Error updating Employee:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating Employee',
            error: error.message,
        });
    }
};

// Delete Employee
const deleteEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const collegeId = req.user.collegeId;

        const employee = await prisma.employee.findFirst({
            where: { id: employeeId, collegeId },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        // Delete related records
        await prisma.employeeAttendance.deleteMany({
            where: { employeeId },
        });

        await prisma.employeeSalary.deleteMany({
            where: { employeeId },
        });

        await prisma.employeeLeave.deleteMany({
            where: { employeeId },
        });

        // Delete employee
        await prisma.employee.delete({
            where: { id: employeeId },
        });

        return res.status(200).json({
            success: true,
            message: 'Employee deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting Employee:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting Employee',
            error: error.message,
        });
    }
};

// ==================== EMPLOYEE ATTENDANCE ====================

// Mark Attendance
const markAttendance = async (req, res) => {
    try {
        const { employeeId, date, status, leaveType, remarks } = req.body;
        const collegeId = req.user.collegeId;

        if (!employeeId || !date || !status) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID, date, and status are required',
            });
        }

        const employee = await prisma.employee.findFirst({
            where: { id: employeeId, collegeId },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        // Check if attendance already marked for this date
        const existing = await prisma.employeeAttendance.findFirst({
            where: {
                employeeId,
                date: attendanceDate,
            },
        });

        if (existing) {
            // Update existing
            const updated = await prisma.employeeAttendance.update({
                where: { id: existing.id },
                data: {
                    status,
                    leaveType,
                    remarks,
                    updatedAt: new Date(),
                },
            });

            return res.status(200).json({
                success: true,
                message: 'Attendance updated successfully',
                data: updated,
            });
        } else {
            // Create new
            const attendance = await prisma.employeeAttendance.create({
                data: {
                    employeeId,
                    date: attendanceDate,
                    status,
                    leaveType,
                    remarks,
                    collegeId,
                },
            });

            return res.status(201).json({
                success: true,
                message: 'Attendance marked successfully',
                data: attendance,
            });
        }
    } catch (error) {
        console.error('Error marking attendance:', error);
        return res.status(500).json({
            success: false,
            message: 'Error marking attendance',
            error: error.message,
        });
    }
};

// Get Attendance for Employee
const getEmployeeAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { startDate, endDate } = req.query;
        const collegeId = req.user.collegeId;

        let where = { employeeId, collegeId };

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const attendance = await prisma.employeeAttendance.findMany({
            where,
            orderBy: { date: 'desc' },
        });

        // Calculate stats
        const stats = {
            total: attendance.length,
            present: attendance.filter((a) => a.status === 'Present').length,
            absent: attendance.filter((a) => a.status === 'Absent').length,
            halfDay: attendance.filter((a) => a.status === 'Half-Day').length,
            leaves: attendance.filter((a) => a.status.includes('Leave')).length,
        };

        return res.status(200).json({
            success: true,
            data: attendance,
            stats,
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching attendance',
            error: error.message,
        });
    }
};

// ==================== EMPLOYEE SALARY ====================

// Create Salary Record
const createSalaryRecord = async (req, res) => {
    try {
        const {
            employeeId,
            month,
            year,
            baseSalary,
            allowances,
            deductions,
            workingDays,
            attendedDays,
            remarks,
        } = req.body;

        const collegeId = req.user.collegeId;

        if (!employeeId || !month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID, month, and year are required',
            });
        }

        // Check if record already exists
        const existing = await prisma.employeeSalary.findFirst({
            where: {
                employeeId,
                month,
                year: parseInt(year),
            },
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Salary record already exists for this month',
            });
        }

        const base = baseSalary || 0;
        const allow = allowances || 0;
        const deduct = deductions || 0;
        const netSal = base + allow - deduct;

        const salary = await prisma.employeeSalary.create({
            data: {
                employeeId,
                month,
                year: parseInt(year),
                baseSalary: parseFloat(base),
                allowances: parseFloat(allow),
                deductions: parseFloat(deduct),
                netSalary: netSal,
                workingDays: workingDays || 30,
                attendedDays: attendedDays || 30,
                remarks,
                collegeId,
                status: 'Pending',
            },
        });

        return res.status(201).json({
            success: true,
            message: 'Salary record created successfully',
            data: salary,
        });
    } catch (error) {
        console.error('Error creating salary record:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating salary record',
            error: error.message,
        });
    }
};

// Get Salary Records
const getSalaryRecords = async (req, res) => {
    try {
        const collegeId = req.user.collegeId;
        const { employeeId, month, year, status } = req.query;

        let where = { collegeId };
        if (employeeId) where.employeeId = employeeId;
        if (month) where.month = month;
        if (year) where.year = parseInt(year);
        if (status) where.status = status;

        const salaries = await prisma.employeeSalary.findMany({
            where,
            include: {
                employee: {
                    select: { name: true, email: true, employeeId: true },
                },
            },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
        });

        return res.status(200).json({
            success: true,
            data: salaries,
        });
    } catch (error) {
        console.error('Error fetching salary records:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching salary records',
            error: error.message,
        });
    }
};

// Update Salary Status
const updateSalaryStatus = async (req, res) => {
    try {
        const { salaryId } = req.params;
        const { status } = req.body;
        const collegeId = req.user.collegeId;

        const salary = await prisma.employeeSalary.findFirst({
            where: { id: salaryId, collegeId },
        });

        if (!salary) {
            return res.status(404).json({
                success: false,
                message: 'Salary record not found',
            });
        }

        const updated = await prisma.employeeSalary.update({
            where: { id: salaryId },
            data: { status },
        });

        return res.status(200).json({
            success: true,
            message: 'Salary status updated successfully',
            data: updated,
        });
    } catch (error) {
        console.error('Error updating salary status:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating salary status',
            error: error.message,
        });
    }
};

// ==================== DASHBOARD ====================

// Get HR Dashboard Data
const getHRDashboard = async (req, res) => {
    try {
        const collegeId = req.user.collegeId;
        const hrManagerId = req.user.HRManagerProfile?.id;

        let whereEmployee = { collegeId };
        if (hrManagerId) {
            whereEmployee.hrManagerId = hrManagerId;
        }

        // Get stats
        const totalEmployees = await prisma.employee.count({
            where: whereEmployee,
        });

        const activeEmployees = await prisma.employee.count({
            where: { ...whereEmployee, status: 'Active' },
        });

        const totalSalary = await prisma.employee.aggregate({
            where: whereEmployee,
            _sum: { salary: true },
        });

        // Get recent attendance
        const recentAttendance = await prisma.employeeAttendance.findMany({
            where: { collegeId },
            include: {
                employee: {
                    select: { name: true, email: true, employeeId: true },
                },
            },
            orderBy: { date: 'desc' },
            take: 10,
        });

        // Get pending salaries
        const pendingSalaries = await prisma.employeeSalary.findMany({
            where: { collegeId, status: 'Pending' },
            include: {
                employee: {
                    select: { name: true, email: true },
                },
            },
            take: 5,
        });

        // Get pending leaves
        const pendingLeaves = await prisma.employeeLeave.findMany({
            where: { collegeId, status: 'Pending' },
            include: {
                employee: {
                    select: { name: true, email: true },
                },
            },
            take: 5,
        });

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalEmployees,
                    activeEmployees,
                    totalSalary: totalSalary._sum.salary || 0,
                    attendanceToday: recentAttendance.length,
                },
                recentAttendance,
                pendingSalaries,
                pendingLeaves,
            },
        });
    } catch (error) {
        console.error('Error fetching HR dashboard:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching HR dashboard',
            error: error.message,
        });
    }
};

// Get Admin HR Dashboard (see all data)
const getAdminHRDashboard = async (req, res) => {
    try {
        const collegeId = req.user.collegeId;

        // Get all HR Managers with details
        const hrManagers = await prisma.hRManager.findMany({
            where: { collegeId },
            include: {
                Employees: {
                    select: { id: true },
                },
            },
        });

        // Get all Teachers (which are employees for HR management)
        const teachers = await prisma.teacher.findMany({
            where: { collegeId, isActive: true },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                qualification: true,
                experience: true,
                specialization: true,
            },
        });

        // Calculate salary stats (teacher salary if stored, or 0 for now)
        const totalSalaryBill = 0; // To be updated when salary is added to Teacher model

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    hrManagers: hrManagers.length,
                    totalEmployees: teachers.length,
                    activeEmployees: teachers.length,
                    totalSalaryBill,
                },
                hrManagers,
                teachers,
            },
        });
    } catch (error) {
        console.error('Error fetching admin HR dashboard:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching admin HR dashboard',
            error: error.message,
        });
    }
};

// ==================== AVAILABLE TEACHERS ====================

const getAvailableTeachers = async (req, res) => {
    try {
        console.log('=== GET AVAILABLE TEACHERS ===');
        const collegeId = req.user.collegeId;

        if (!collegeId) {
            return res.status(400).json({
                success: false,
                message: 'College ID is required',
            });
        }

        const teachers = await prisma.teacher.findMany({
            where: { collegeId, isActive: true },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                specialization: true,
                qualification: true,
                experience: true,
                createdAt: true,
            },
            orderBy: { name: 'asc' },
        });

        console.log('Found available teachers:', teachers.length);

        return res.status(200).json({
            success: true,
            data: teachers,
        });
    } catch (error) {
        console.error('Error fetching available teachers:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching available teachers',
            error: error.message,
        });
    }
};

// ==================== REGENERATE HR MANAGER PASSWORDS ====================

const regenerateHRManagerPasswords = async (req, res) => {
    try {
        console.log('=== REGENERATE HR MANAGER PASSWORDS ===');
        const collegeId = req.user?.collegeId;

        if (!collegeId) {
            return res.status(400).json({
                success: false,
                message: 'College ID is required',
            });
        }

        console.log('Regenerating passwords for college:', collegeId);

        // Find ALL HR Managers (update all)
        const hrManagers = await prisma.hRManager.findMany({
            where: { collegeId },
            include: { user: true },
        });

        console.log('Found HR Managers:', hrManagers.length);

        let updated = 0;
        const results = [];

        for (const manager of hrManagers) {
            try {
                // Generate new temporary password
                const tempPassword = Math.random().toString(36).slice(-12).toUpperCase();
                
                await prisma.user.update({
                    where: { id: manager.userId },
                    data: { tempPassword },
                });

                updated++;
                results.push({
                    name: manager.name,
                    email: manager.email,
                    tempPassword,
                });

                console.log(`✓ Updated password for ${manager.email}: ${tempPassword}`);
            } catch (err) {
                console.error(`✗ Error updating ${manager.email}:`, err.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: `Regenerated passwords for ${updated} HR Managers`,
            updated,
            results,
        });
    } catch (error) {
        console.error('=== ERROR REGENERATING PASSWORDS ===');
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error regenerating passwords',
            error: error.message,
        });
    }
};

module.exports = {
    // HR Manager
    addHRManager,
    getHRManagers,
    deleteHRManager,
    // Employee
    addEmployee,
    getEmployees,
    getEmployee,
    updateEmployee,
    deleteEmployee,
    // Attendance
    markAttendance,
    getEmployeeAttendance,
    // Salary
    createSalaryRecord,
    getSalaryRecords,
    updateSalaryStatus,
    // Dashboard
    getHRDashboard,
    getAdminHRDashboard,
    // Available Teachers
    getAvailableTeachers,
    // Password Management
    regenerateHRManagerPasswords,
};
