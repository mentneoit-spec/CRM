const prisma = require('./lib/prisma');

async function createSampleHRData() {
  try {
    console.log('🔍 Fetching college data...');
    
    // Get Demo College
    const demoCollege = await prisma.college.findFirst({
      where: { name: 'Demo College' }
    });

    if (!demoCollege) {
      console.log('❌ Demo College not found. Creating it...');
      const college = await prisma.college.create({
        data: {
          name: 'Demo College',
          email: 'demo@college.com',
          phone: '9999999999',
          address: '123 Demo Street, College City',
          city: 'Demo City',
          state: 'Demo State',
          pincode: '123456',
          principalName: 'Dr. Demo Principal'
        }
      });
      console.log('✅ College created:', college.id);
    }

    const collegeId = demoCollege?.id || (await prisma.college.findFirst({ where: { name: 'Demo College' } })).id;

    console.log(`✅ Using collegeId: ${collegeId}`);

    // ==================== CREATE HR MANAGERS ====================
    console.log('\n📌 Creating HR Managers...');
    
    const hrManagers = [];
    const hrManagerData = [
      { name: 'Neha Patel', email: 'neha.patel@hr.com', phone: '9876543210', department: 'Human Resources' },
      { name: 'Raj Singh', email: 'raj.singh@hr.com', phone: '9876543211', department: 'Human Resources' }
    ];

    for (const data of hrManagerData) {
      const existingHR = await prisma.hRManager.findFirst({
        where: { email: data.email }
      });

      if (!existingHR) {
        const hrManager = await prisma.hRManager.create({
          data: {
            collegeId,
            ...data,
            password: 'hashedpassword123', // In real app, hash this
            status: 'Active'
          }
        });
        hrManagers.push(hrManager);
        console.log(`✅ HR Manager created: ${hrManager.name} (${hrManager.email})`);
      } else {
        console.log(`⏭️  HR Manager already exists: ${data.email}`);
        hrManagers.push(existingHR);
      }
    }

    // ==================== CREATE EMPLOYEES ====================
    console.log('\n👥 Creating Employees...');
    
    const employees = [];
    const employeeData = [
      // Finance Department
      {
        name: 'Arjun Kumar',
        email: 'arjun.kumar@demo.com',
        employeeId: 'EMP001',
        phone: '9876543212',
        department: 'Finance',
        designation: 'Senior Accountant',
        salary: 65000,
        dateOfJoining: new Date('2020-01-15'),
        status: 'Active'
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@demo.com',
        employeeId: 'EMP002',
        phone: '9876543213',
        department: 'Finance',
        designation: 'Finance Executive',
        salary: 45000,
        dateOfJoining: new Date('2021-06-20'),
        status: 'Active'
      },
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@demo.com',
        employeeId: 'EMP003',
        phone: '9876543214',
        department: 'Finance',
        designation: 'Finance Manager',
        salary: 85000,
        dateOfJoining: new Date('2019-03-10'),
        status: 'Active'
      },
      // IT Department
      {
        name: 'Divya Singh',
        email: 'divya.singh@demo.com',
        employeeId: 'EMP004',
        phone: '9876543215',
        department: 'IT',
        designation: 'Senior Developer',
        salary: 95000,
        dateOfJoining: new Date('2018-08-05'),
        status: 'Active'
      },
      {
        name: 'Vikram Patel',
        email: 'vikram.patel@demo.com',
        employeeId: 'EMP005',
        phone: '9876543216',
        department: 'IT',
        designation: 'Junior Developer',
        salary: 55000,
        dateOfJoining: new Date('2022-01-15'),
        status: 'Active'
      },
      {
        name: 'Sneha Desai',
        email: 'sneha.desai@demo.com',
        employeeId: 'EMP006',
        phone: '9876543217',
        department: 'IT',
        designation: 'QA Engineer',
        salary: 60000,
        dateOfJoining: new Date('2021-09-01'),
        status: 'Active'
      },
      // HR Department
      {
        name: 'Pooja Nair',
        email: 'pooja.nair@demo.com',
        employeeId: 'EMP007',
        phone: '9876543218',
        department: 'Human Resources',
        designation: 'HR Specialist',
        salary: 55000,
        dateOfJoining: new Date('2020-11-10'),
        status: 'Active'
      },
      {
        name: 'Aditya Gupta',
        email: 'aditya.gupta@demo.com',
        employeeId: 'EMP008',
        phone: '9876543219',
        department: 'Human Resources',
        designation: 'Recruitment Officer',
        salary: 50000,
        dateOfJoining: new Date('2021-04-05'),
        status: 'Active'
      },
      // Operations Department
      {
        name: 'Karan Malhotra',
        email: 'karan.malhotra@demo.com',
        employeeId: 'EMP009',
        phone: '9876543220',
        department: 'Operations',
        designation: 'Operations Manager',
        salary: 70000,
        dateOfJoining: new Date('2019-07-20'),
        status: 'Active'
      },
      {
        name: 'Zara Khan',
        email: 'zara.khan@demo.com',
        employeeId: 'EMP010',
        phone: '9876543221',
        department: 'Operations',
        designation: 'Operations Executive',
        salary: 42000,
        dateOfJoining: new Date('2022-05-10'),
        status: 'Active'
      }
    ];

    for (const data of employeeData) {
      const existingEmployee = await prisma.employee.findFirst({
        where: { email: data.email }
      });

      if (!existingEmployee) {
        const employee = await prisma.employee.create({
          data: {
            collegeId,
            hrManagerId: hrManagers[0].id,
            ...data
          }
        });
        employees.push(employee);
        console.log(`✅ Employee created: ${employee.name} (${employee.designation}) - ₹${employee.salary}`);
      } else {
        console.log(`⏭️  Employee already exists: ${data.email}`);
        employees.push(existingEmployee);
      }
    }

    // ==================== CREATE SALARY RECORDS ====================
    console.log('\n💰 Creating Salary Records...');
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    for (const employee of employees) {
      const existingSalaryRecord = await prisma.employeeSalary.findFirst({
        where: {
          employeeId: employee.id,
          month: currentMonth,
          year: currentYear
        }
      });

      if (!existingSalaryRecord) {
        const salaryRecord = await prisma.employeeSalary.create({
          data: {
            collegeId,
            employeeId: employee.id,
            baseSalary: employee.salary,
            allowances: Math.round(employee.salary * 0.1),
            deductions: Math.round(employee.salary * 0.05),
            netSalary: Math.round(employee.salary + (employee.salary * 0.1) - (employee.salary * 0.05)),
            month: currentMonth,
            year: currentYear,
            status: Math.random() > 0.3 ? 'Paid' : 'Pending'
          }
        });
        console.log(`✅ Salary record created: ${employee.name} (Month: ${currentMonth}/${currentYear})`);
      }
    }

    // ==================== CREATE ATTENDANCE RECORDS ====================
    console.log('\n📍 Creating Attendance Records...');
    
    for (const employee of employees) {
      const attendanceCount = await prisma.employeeAttendance.count({
        where: {
          employeeId: employee.id
        }
      });

      if (attendanceCount === 0) {
        // Create 20 days of attendance records
        const attendanceData = [];
        for (let i = 0; i < 20; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          attendanceData.push({
            collegeId,
            employeeId: employee.id,
            date,
            status: Math.random() > 0.1 ? 'Present' : 'Absent', // 90% present
            checkInTime: Math.random() > 0.1 ? new Date(date.setHours(9, 0, 0)) : null,
            checkOutTime: Math.random() > 0.1 ? new Date(date.setHours(18, 0, 0)) : null
          });
        }

        await prisma.employeeAttendance.createMany({
          data: attendanceData
        });
        console.log(`✅ Attendance records created for: ${employee.name}`);
      }
    }

    console.log('\n✅ ========== SAMPLE HR DATA CREATED SUCCESSFULLY ==========');
    console.log(`✅ HR Managers: ${hrManagers.length}`);
    console.log(`✅ Employees: ${employees.length}`);
    console.log(`✅ Salary Records: ${employees.length}`);
    console.log(`✅ Attendance Records: ${employees.length * 20}`);
    console.log('\n🎉 Now test the HR Management page - it should show real data!');

  } catch (error) {
    console.error('❌ Error creating HR data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleHRData();
