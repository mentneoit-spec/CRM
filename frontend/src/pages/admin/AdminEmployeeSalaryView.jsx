import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  MenuItem,
  TextField,
  Button,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import hrAPI from '../../config/hrAPI';

const AdminEmployeeSalaryView = () => {
  const [employees, setEmployees] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [empResponse, salaryResponse] = await Promise.all([
        hrAPI.getAllEmployees({}),
        hrAPI.getSalaryRecords({ month: selectedMonth.split('-')[1], year: selectedMonth.split('-')[0] }),
      ]);

      if (empResponse.data?.success) {
        setEmployees(empResponse.data.data || []);
      }

      if (salaryResponse.data?.success) {
        setSalaryRecords(salaryResponse.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate department-wise salary distribution
  const calculateDepartmentSalaries = () => {
    const deptSalaries = {};
    employees.forEach((emp) => {
      if (!deptSalaries[emp.department]) {
        deptSalaries[emp.department] = 0;
      }
      deptSalaries[emp.department] += emp.salary;
    });

    return Object.entries(deptSalaries).map(([dept, salary]) => ({
      name: dept,
      value: salary,
    }));
  };

  const departmentData = calculateDepartmentSalaries();
  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const totalProcessedSalary = salaryRecords
    .filter((s) => s.status === 'Processed')
    .reduce((sum, s) => sum + s.netSalary, 0);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Employee Salary & Attendance Management</Typography>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography color="textSecondary" variant="small">Total Salary Bill</Typography>
              <Typography variant="h6" sx={{ color: '#1976d2' }}>
                ₹{(totalSalary / 100000).toFixed(1)}L
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography color="textSecondary" variant="small">Processed Salary</Typography>
              <Typography variant="h6" sx={{ color: '#4caf50' }}>
                ₹{(totalProcessedSalary / 100000).toFixed(1)}L
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography color="textSecondary" variant="small">Total Employees</Typography>
              <Typography variant="h6" sx={{ color: '#f57c00' }}>{employees.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Typography color="textSecondary" variant="small">Pending Salaries</Typography>
              <Typography variant="h6" sx={{ color: '#7b1fa2' }}>
                {salaryRecords.filter((s) => s.status === 'Pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Department-wise Salary Distribution</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ₹${(value / 100000).toFixed(1)}L`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Employee Salary Distribution</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={employees.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value?.toLocaleString() || 0}`} />
                  <Bar dataKey="salary" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Salary Records */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Salary Records</Typography>
            <TextField
              label="Month"
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 200 }}
            />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Base Salary</TableCell>
                  <TableCell>Allowances</TableCell>
                  <TableCell>Deductions</TableCell>
                  <TableCell>Net Salary</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salaryRecords.length > 0 ? (
                  salaryRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.employee?.name}</TableCell>
                      <TableCell>₹{record.baseSalary?.toLocaleString() || 0}</TableCell>
                      <TableCell>₹{record.allowances?.toLocaleString() || 0}</TableCell>
                      <TableCell>₹{record.deductions?.toLocaleString() || 0}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>₹{record.netSalary?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          size="small"
                          color={record.status === 'Processed' ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      No salary records for this month
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* All Employees */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>All Employees</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>Salary</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id} hover>
                    <TableCell>{emp.employeeId}</TableCell>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>{emp.designation}</TableCell>
                    <TableCell>₹{emp.salary?.toLocaleString() || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={emp.status}
                        size="small"
                        color={emp.status === 'Active' ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminEmployeeSalaryView;
