// Fake Attendance Data for March 2024
export const attendanceRecords = [
  // Employee EMP001 - Rajesh Kumar
  { empId: 'EMP001', empName: 'Rajesh Kumar', date: '2024-03-01', status: 'Present', remarks: '' },
  { empId: 'EMP001', empName: 'Rajesh Kumar', date: '2024-03-02', status: 'Present', remarks: '' },
  { empId: 'EMP001', empName: 'Rajesh Kumar', date: '2024-03-03', status: 'Present', remarks: '' },
  { empId: 'EMP001', empName: 'Rajesh Kumar', date: '2024-03-04', status: 'Present', remarks: '' },
  { empId: 'EMP001', empName: 'Rajesh Kumar', date: '2024-03-05', status: 'Half-Day', remarks: 'Early leave' },
  { empId: 'EMP001', empName: 'Rajesh Kumar', date: '2024-03-06', status: 'Absent', remarks: 'Medical' },
  { empId: 'EMP001', empName: 'Rajesh Kumar', date: '2024-03-07', status: 'Paid-Leave', remarks: '' },
  { empId: 'EMP001', empName: 'Rajesh Kumar', date: '2024-03-08', status: 'Present', remarks: '' },
  // ... More days (simplified for this example)

  // Employee EMP002 - Priya Sharma
  { empId: 'EMP002', empName: 'Priya Sharma', date: '2024-03-01', status: 'Present', remarks: '' },
  { empId: 'EMP002', empName: 'Priya Sharma', date: '2024-03-02', status: 'Present', remarks: '' },
  { empId: 'EMP002', empName: 'Priya Sharma', date: '2024-03-03', status: 'Absent', remarks: 'Leave' },
  { empId: 'EMP002', empName: 'Priya Sharma', date: '2024-03-04', status: 'Present', remarks: '' },
  { empId: 'EMP002', empName: 'Priya Sharma', date: '2024-03-05', status: 'Present', remarks: '' },
  { empId: 'EMP002', empName: 'Priya Sharma', date: '2024-03-06', status: 'Present', remarks: '' },
  { empId: 'EMP002', empName: 'Priya Sharma', date: '2024-03-07', status: 'Present', remarks: '' },
  { empId: 'EMP002', empName: 'Priya Sharma', date: '2024-03-08', status: 'Half-Day', remarks: 'Medical appointment' },

  // Employee EMP003 - Amit Singh
  { empId: 'EMP003', empName: 'Amit Singh', date: '2024-03-01', status: 'Present', remarks: '' },
  { empId: 'EMP003', empName: 'Amit Singh', date: '2024-03-02', status: 'Absent', remarks: '' },
  { empId: 'EMP003', empName: 'Amit Singh', date: '2024-03-03', status: 'Present', remarks: '' },
  { empId: 'EMP003', empName: 'Amit Singh', date: '2024-03-04', status: 'Present', remarks: '' },
  { empId: 'EMP003', empName: 'Amit Singh', date: '2024-03-05', status: 'Present', remarks: '' },
  { empId: 'EMP003', empName: 'Amit Singh', date: '2024-03-06', status: 'Absent', remarks: 'Sick leave' },
  { empId: 'EMP003', empName: 'Amit Singh', date: '2024-03-07', status: 'Paid-Leave', remarks: '' },
  { empId: 'EMP003', empName: 'Amit Singh', date: '2024-03-08', status: 'Present', remarks: '' },

  // Employee EMP004 - Neha Gupta
  { empId: 'EMP004', empName: 'Neha Gupta', date: '2024-03-01', status: 'Present', remarks: '' },
  { empId: 'EMP004', empName: 'Neha Gupta', date: '2024-03-02', status: 'Present', remarks: '' },
  { empId: 'EMP004', empName: 'Neha Gupta', date: '2024-03-03', status: 'Present', remarks: '' },
  { empId: 'EMP004', empName: 'Neha Gupta', date: '2024-03-04', status: 'Present', remarks: '' },
  { empId: 'EMP004', empName: 'Neha Gupta', date: '2024-03-05', status: 'Present', remarks: '' },
  { empId: 'EMP004', empName: 'Neha Gupta', date: '2024-03-06', status: 'Present', remarks: '' },
  { empId: 'EMP004', empName: 'Neha Gupta', date: '2024-03-07', status: 'Present', remarks: '' },
  { empId: 'EMP004', empName: 'Neha Gupta', date: '2024-03-08', status: 'Present', remarks: '' },

  // Employee EMP006 - Sneha Desai
  { empId: 'EMP006', empName: 'Sneha Desai', date: '2024-03-01', status: 'Present', remarks: '' },
  { empId: 'EMP006', empName: 'Sneha Desai', date: '2024-03-02', status: 'Present', remarks: '' },
  { empId: 'EMP006', empName: 'Sneha Desai', date: '2024-03-03', status: 'Absent', remarks: '' },
  { empId: 'EMP006', empName: 'Sneha Desai', date: '2024-03-04', status: 'Present', remarks: '' },
  { empId: 'EMP006', empName: 'Sneha Desai', date: '2024-03-05', status: 'Present', remarks: '' },
  { empId: 'EMP006', empName: 'Sneha Desai', date: '2024-03-06', status: 'Half-Day', remarks: 'Doctor visit' },
  { empId: 'EMP006', empName: 'Sneha Desai', date: '2024-03-07', status: 'Present', remarks: '' },
  { empId: 'EMP006', empName: 'Sneha Desai', date: '2024-03-08', status: 'Present', remarks: '' },
];

export const attendanceStateColors = {
  'Present': '#4caf50',
  'Absent': '#f44336',
  'Half-Day': '#ff9800',
  'Paid-Leave': '#2196f3',
  'Unpaid-Leave': '#9c27b0',
};

export const workingDaysPerMonth = 22; // Typical working days
