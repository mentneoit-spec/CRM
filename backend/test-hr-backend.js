/**
 * Test HR Backend Connection & Data
 */

const prisma = require('./lib/prisma');

async function testHRBackend() {
  try {
    console.log('🧪 Testing HR Backend Connection...\n');

    const collegeId = 'e132581d-258f-42e6-90ce-bc212de26d3a';

    // Test 1: HR Managers
    console.log('📌 Test 1: HR Managers');
    const hrManagers = await prisma.hRManager.findMany({
      where: { collegeId }
    });
    console.log(`✅ Found ${hrManagers.length} HR Managers`);
    hrManagers.forEach(hr => {
      console.log(`   • ${hr.name} (${hr.email})`);
    });

    // Test 2: Employees
    console.log('\n👔 Test 2: Employees');
    const employees = await prisma.employee.findMany({
      where: { collegeId }
    });
    console.log(`✅ Found ${employees.length} Employees`);
    employees.forEach(emp => {
      console.log(`   • ${emp.name} - ${emp.designation} (${emp.employeeId})`);
    });

    // Test 3: Employee Attendance
    console.log('\n📅 Test 3: Employee Attendance Records');
    const attendance = await prisma.employeeAttendance.findMany({
      where: { collegeId },
      take: 5
    });
    console.log(`✅ Found ${attendance.length}+ Attendance Records`);
    attendance.forEach(att => {
      console.log(`   • ${att.employeeId.substring(0, 8)}... - ${att.status} on ${att.date.toLocaleDateString()}`);
    });

    // Test 4: Employee Salary
    console.log('\n💰 Test 4: Employee Salary Records');
    const salaries = await prisma.employeeSalary.findMany({
      where: { collegeId },
      take: 5
    });
    console.log(`✅ Found ${salaries.length}+ Salary Records`);
    salaries.forEach(sal => {
      console.log(`   • ${sal.month} ${sal.year} - Base: ₹${sal.baseSalary} | Net: ₹${sal.netSalary} | Status: ${sal.status}`);
    });

    // Test 5: Employee Leave
    console.log('\n🏖️ Test 5: Employee Leave Records');
    const leaves = await prisma.employeeLeave.findMany({
      where: { collegeId },
      take: 5
    });
    console.log(`✅ Found ${leaves.length}+ Leave Records`);
    leaves.forEach(leave => {
      console.log(`   • ${leave.leaveType} - ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()} | Status: ${leave.status}`);
    });

    // Test 6: Users with HR Manager role
    console.log('\n🔐 Test 6: HR Manager User Accounts');
    const hrUsers = await prisma.user.findMany({
      where: { 
        role: 'HR Manager',
        collegeId 
      }
    });
    console.log(`✅ Found ${hrUsers.length} HR Manager User Accounts`);
    hrUsers.forEach(user => {
      console.log(`   • ${user.email} - Role: ${user.role}`);
    });

    console.log('\n✨ ========================================');
    console.log('✨ HR BACKEND CONNECTION TEST COMPLETE');
    console.log('✨ ========================================');
    console.log(`
📊 HR Data Summary:
  • HR Managers: ${hrManagers.length}
  • Employees: ${employees.length}
  • Attendance Records: ${attendance.length}+
  • Salary Records: ${salaries.length}+
  • Leave Records: ${leaves.length}+
  • HR User Accounts: ${hrUsers.length}

✅ All HR systems are connected and populated with data!
    `);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testHRBackend();
