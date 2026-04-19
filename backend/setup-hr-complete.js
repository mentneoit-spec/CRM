/**
 * Complete HR Management Backend Setup
 * Creates HR Managers, Employees, Attendance, Salaries, and Leave Records
 */

const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function setupCompleteHR() {
  try {
    console.log('🚀 Starting Complete HR Management Setup...\n');

    // ==================== STEP 1: GET OR CREATE COLLEGE ====================
    console.log('📍 Step 1: Setting up College...');
    let college = await prisma.college.findFirst({
      where: { name: 'Demo College' }
    });

    if (!college) {
      college = await prisma.college.create({
        data: {
          name: 'Demo College',
          email: 'demo@college.com',
          phone: '9999999999',
          address: '123 Demo Street, College City',
          city: 'Demo City',
          state: 'Demo State',
          pincode: '123456'
        }
      });
      console.log('✅ College created:', college.name);
    } else {
      console.log('✅ College found:', college.name);
    }
    const collegeId = college.id;

    // ==================== STEP 2: CREATE HR MANAGER USER ACCOUNTS ====================
    console.log('\n👥 Step 2: Creating HR Manager User Accounts...');
    const hrManagerUsers = [
      {
        name: 'Neha Patel',
        email: 'neha.hr@test.com',
        password: 'Test@123',
        phone: '9876543210',
        designation: 'HR Manager',
        department: 'Human Resources'
      },
      {
        name: 'Raj Singh',
        email: 'raj.hr@test.com',
        password: 'Test@123',
        phone: '9876543211',
        designation: 'Senior HR Manager',
        department: 'Human Resources'
      }
    ];

    let hrManagerIds = [];
    for (const hrData of hrManagerUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email_collegeId: { email: hrData.email, collegeId } }
      }).catch(() => null);

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(hrData.password, 10);
        const user = await prisma.user.create({
          data: {
            name: hrData.name,
            email: hrData.email,
            password: hashedPassword,
            role: 'HR Manager',
            collegeId,
            isEmailVerified: true
          }
        });

        const hrManager = await prisma.hRManager.create({
          data: {
            name: hrData.name,
            email: hrData.email,
            phone: hrData.phone,
            designation: hrData.designation,
            department: hrData.department,
            collegeId,
            userId: user.id,
            isActive: true
          }
        });

        hrManagerIds.push(hrManager.id);
        console.log(`✅ HR Manager created: ${hrData.name} (${hrData.email})`);
      } else {
        const hrManager = await prisma.hRManager.findFirst({
          where: { email: hrData.email, collegeId }
        });
        if (hrManager) {
          hrManagerIds.push(hrManager.id);
          console.log(`✅ HR Manager already exists: ${hrData.name}`);
        }
      }
    }

    // ==================== STEP 3: CREATE EMPLOYEES ====================
    console.log('\n👔 Step 3: Creating Employees...');
    const employeeData = [
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@employee.com',
        phone: '9111111111',
        employeeId: 'EMP001',
        department: 'Computer Science',
        designation: 'Assistant Professor',
        dateOfJoining: new Date('2022-01-15'),
        dateOfBirth: new Date('1990-05-20'),
        gender: 'Female',
        qualification: 'M.Tech in Computer Science',
        experience: 8,
        salary: 60000,
        bankAccount: '9876543210001',
        bankName: 'State Bank of India',
        ifscCode: 'SBIN0001234',
        address: '123 Scholar Lane, College City',
        status: 'Active'
      },
      {
        name: 'Arjun Verma',
        email: 'arjun.verma@employee.com',
        phone: '9222222222',
        employeeId: 'EMP002',
        department: 'Mathematics',
        designation: 'Associate Professor',
        dateOfJoining: new Date('2021-06-01'),
        dateOfBirth: new Date('1988-03-10'),
        gender: 'Male',
        qualification: 'Ph.D in Mathematics',
        experience: 10,
        salary: 75000,
        bankAccount: '9876543210002',
        bankName: 'HDFC Bank',
        ifscCode: 'HDFC0001234',
        address: '456 Academic Plaza, College City',
        status: 'Active'
      },
      {
        name: 'Deepa Malhotra',
        email: 'deepa.malhotra@employee.com',
        phone: '9333333333',
        employeeId: 'EMP003',
        department: 'Physics',
        designation: 'Lecturer',
        dateOfJoining: new Date('2023-02-01'),
        dateOfBirth: new Date('1992-08-15'),
        gender: 'Female',
        qualification: 'M.Sc in Physics',
        experience: 3,
        salary: 45000,
        bankAccount: '9876543210003',
        bankName: 'ICICI Bank',
        ifscCode: 'ICIC0001234',
        address: '789 Knowledge Road, College City',
        status: 'Active'
      },
      {
        name: 'Vikram Rao',
        email: 'vikram.rao@employee.com',
        phone: '9444444444',
        employeeId: 'EMP004',
        department: 'Human Resources',
        designation: 'HR Executive',
        dateOfJoining: new Date('2022-09-15'),
        dateOfBirth: new Date('1994-12-05'),
        gender: 'Male',
        qualification: 'B.Tech + MBA HR',
        experience: 5,
        salary: 55000,
        bankAccount: '9876543210004',
        bankName: 'Axis Bank',
        ifscCode: 'AXIS0001234',
        address: '321 Corporate Street, College City',
        status: 'Active'
      },
      {
        name: 'Ananya Singh',
        email: 'ananya.singh@employee.com',
        phone: '9555555555',
        employeeId: 'EMP005',
        department: 'Chemistry',
        designation: 'Assistant Professor',
        dateOfJoining: new Date('2023-07-01'),
        dateOfBirth: new Date('1991-06-22'),
        gender: 'Female',
        qualification: 'M.Sc in Chemistry',
        experience: 6,
        salary: 52000,
        bankAccount: '9876543210005',
        bankName: 'Kotak Bank',
        ifscCode: 'KKBK0001234',
        address: '654 Laboratory Lane, College City',
        status: 'Active'
      }
    ];

    let employeeIds = [];
    const hrManagerId = hrManagerIds[0] || null;

    if (!hrManagerId) {
      console.log('❌ No HR Manager found. Creating default HR Manager first...');
      const hashedPassword = await bcrypt.hash('Test@123', 10);
      const user = await prisma.user.create({
        data: {
          name: 'Default HR Manager',
          email: 'default.hr@test.com',
          password: hashedPassword,
          role: 'HR Manager',
          collegeId,
          isEmailVerified: true
        }
      });

      const hrManager = await prisma.hRManager.create({
        data: {
          name: 'Default HR Manager',
          email: 'default.hr@test.com',
          phone: '9999999999',
          designation: 'HR Manager',
          department: 'Human Resources',
          collegeId,
          userId: user.id,
          isActive: true
        }
      });
      hrManagerIds.push(hrManager.id);
    }

    for (const empData of employeeData) {
      const existing = await prisma.employee.findFirst({
        where: { collegeId, employeeId: empData.employeeId }
      }).catch(() => null);

      if (!existing) {
        const employee = await prisma.employee.create({
          data: {
            name: empData.name,
            email: empData.email,
            phone: empData.phone,
            employeeId: empData.employeeId,
            department: empData.department,
            designation: empData.designation,
            dateOfJoining: empData.dateOfJoining,
            dateOfBirth: empData.dateOfBirth,
            gender: empData.gender,
            qualification: empData.qualification,
            experience: empData.experience,
            salary: empData.salary,
            bankAccount: empData.bankAccount,
            bankName: empData.bankName,
            ifscCode: empData.ifscCode,
            address: empData.address,
            status: empData.status,
            collegeId,
            hrManagerId: hrManagerIds[0]
          }
        });

        employeeIds.push(employee.id);
        console.log(`✅ Employee created: ${empData.name} (${empData.employeeId})`);
      } else {
        employeeIds.push(existing.id);
        console.log(`✅ Employee already exists: ${empData.name}`);
      }
    }

    // ==================== STEP 4: CREATE EMPLOYEE ATTENDANCE ====================
    console.log('\n📅 Step 4: Creating Employee Attendance Records...');
    let attendanceCount = 0;

    for (const employeeId of employeeIds) {
      for (let day = 1; day <= 20; day++) {
        const dateStr = `2024-04-${String(day).padStart(2, '0')}`;
        const existing = await prisma.employeeAttendance.findUnique({
          where: { employeeId_date: { employeeId, date: new Date(dateStr) } }
        }).catch(() => null);

        if (!existing) {
          await prisma.employeeAttendance.create({
            data: {
              employeeId,
              date: new Date(dateStr),
              status: Math.random() > 0.15 ? 'Present' : (Math.random() > 0.5 ? 'Absent' : 'Leave'),
              leaveType: Math.random() > 0.8 ? 'Sick Leave' : null,
              collegeId
            }
          });
          attendanceCount++;
        }
      }
    }
    console.log(`✅ Created ${attendanceCount} attendance records`);

    // ==================== STEP 5: CREATE SALARY RECORDS ====================
    console.log('\n💰 Step 5: Creating Employee Salary Records...');
    let salaryCount = 0;

    const months = ['January', 'February', 'March'];
    const year = 2024;

    for (const employeeId of employeeIds) {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId }
      });

      for (const month of months) {
        const existing = await prisma.employeeSalary.findUnique({
          where: { employeeId_month_year: { employeeId, month, year } }
        }).catch(() => null);

        if (!existing) {
          const baseSalary = employee.salary;
          const allowances = baseSalary * 0.15; // 15% allowances
          const deductions = baseSalary * 0.1; // 10% deductions
          const netSalary = baseSalary + allowances - deductions;

          await prisma.employeeSalary.create({
            data: {
              employeeId,
              month,
              year,
              baseSalary,
              allowances,
              deductions,
              netSalary,
              workingDays: 30,
              attendedDays: 25 + Math.floor(Math.random() * 4),
              status: Math.random() > 0.3 ? 'Paid' : 'Pending',
              collegeId
            }
          });
          salaryCount++;
        }
      }
    }
    console.log(`✅ Created ${salaryCount} salary records`);

    // ==================== STEP 6: CREATE LEAVE RECORDS ====================
    console.log('\n🏖️ Step 6: Creating Employee Leave Records...');
    let leaveCount = 0;

    const leaveTypes = ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Medical Leave'];

    for (const employeeId of employeeIds) {
      const leaveCount_emp = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < leaveCount_emp; i++) {
        const startDay = Math.floor(Math.random() * 15) + 1;
        const endDay = startDay + Math.floor(Math.random() * 3);

        const leave = await prisma.employeeLeave.create({
          data: {
            employeeId,
            leaveType: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
            startDate: new Date(`2024-04-${String(startDay).padStart(2, '0')}`),
            endDate: new Date(`2024-04-${String(Math.min(endDay, 30)).padStart(2, '0')}`),
            reason: 'Personal reasons',
            status: Math.random() > 0.4 ? 'Approved' : 'Pending',
            collegeId
          }
        }).catch(() => null);

        if (leave) leaveCount++;
      }
    }
    console.log(`✅ Created ${leaveCount} leave records`);

    // ==================== SUMMARY ====================
    console.log('\n✨ ========================================');
    console.log('✨ HR MANAGEMENT BACKEND SETUP COMPLETE!');
    console.log('✨ ========================================\n');

    console.log(`📊 Setup Summary:
  • College: ${college.name} (${collegeId})
  • HR Managers: ${hrManagerIds.length}
  • Employees: ${employeeIds.length}
  • Attendance Records: ${attendanceCount}
  • Salary Records: ${salaryCount}
  • Leave Records: ${leaveCount}

🔑 HR Manager Credentials:
  • Email 1: neha.hr@test.com / Password: Test@123
  • Email 2: raj.hr@test.com / Password: Test@123

📱 Access HR Dashboard:
  • Login with any HR Manager email
  • Navigate to /hr/dashboard
  • View employee details, attendance, and salary information

✅ All HR systems are now connected and ready to use!
    `);

  } catch (error) {
    console.error('❌ Error setting up HR:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupCompleteHR();
