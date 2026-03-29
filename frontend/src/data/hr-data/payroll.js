// Payroll Calculation Logic and Data
export const calculateSalary = (employee, attendanceData, workingDays = 22) => {
  const perDaySalary = employee.salary / workingDays;
  
  // Count attendance types
  let presentDays = 0;
  let halfDays = 0;
  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;
  let absentDays = 0;

  attendanceData.forEach((record) => {
    if (record.empId === employee.id) {
      if (record.status === 'Present') presentDays++;
      else if (record.status === 'Half-Day') halfDays++;
      else if (record.status === 'Paid-Leave') paidLeaveDays++;
      else if (record.status === 'Unpaid-Leave') unpaidLeaveDays++;
      else if (record.status === 'Absent') absentDays++;
    }
  });

  // Calculate LOP (Loss of Pay)
  const lopDays = absentDays + unpaidLeaveDays;
  const lopAmount = lopDays * perDaySalary;

  // Basic calculation
  const presentPayable = presentDays * perDaySalary;
  const halfDayPayable = halfDays * (perDaySalary * 0.5);
  const paidLeavePayable = paidLeaveDays * perDaySalary;

  // Deductions
  const basicSalary = employee.salary;
  const totalEarnings = presentPayable + halfDayPayable + paidLeavePayable;
  const lopDeduction = lopAmount;
  const providentFund = basicSalary * 0.12; // 12% PF
  const esi = basicSalary * 0.0475; // 4.75% ESI
  const professionalTax = 100; // Fixed professional tax

  const totalDeductions = lopDeduction + providentFund + esi + professionalTax;
  const netSalary = totalEarnings - totalDeductions;

  return {
    empId: employee.id,
    empName: employee.name,
    department: employee.department,
    designation: employee.designation,
    basicSalary,
    presentDays,
    halfDays,
    paidLeaveDays,
    unpaidLeaveDays,
    absentDays,
    presentPayable,
    halfDayPayable,
    paidLeavePayable,
    totalEarnings,
    lopDays,
    lopDeduction,
    providentFund,
    esi,
    professionalTax,
    totalDeductions,
    netSalary,
    perDaySalary: perDaySalary.toFixed(2),
    month: 'March 2024',
    year: 2024,
    status: 'Pending', // Pending, Processed, Paid
  };
};

// Sample payroll for all employees
export const generatePayroll = (employees, attendanceData) => {
  return employees.map((emp) => calculateSalary(emp, attendanceData));
};

export const payrollStatus = {
  'Pending': '#ff9800',
  'Processed': '#2196f3',
  'Paid': '#4caf50',
  'Rejected': '#f44336',
};
