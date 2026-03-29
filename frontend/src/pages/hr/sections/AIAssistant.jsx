import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
} from '@mui/icons-material';
import { calculateSalary } from '../../../data/hr-data/payroll';
import { workingDaysPerMonth } from '../../../data/hr-data/attendance';

const AIAssistant = ({ employees, attendance }) => {
  const [userQuery, setUserQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'assistant',
      message: 'Hello! 👋 I\'m your HR Assistant. I can help you with:\n• Employee information queries\n• Attendance statistics\n• Salary calculations\n• Department details\n• Leave policies\nHow can I assist you today?',
    },
  ]);

  const suggestedQueries = [
    'How many active employees do we have?',
    'Tell me about Employee EMP001',
    'What is the average salary?',
    'Show me employees in CSE department',
    'What\'s the current attendance rate?',
    'Calculate salary for an employee with 20 absent days',
  ];

  const processQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    let response = '';

    // Count active employees
    if (lowerQuery.includes('active employee') || lowerQuery.includes('how many employee')) {
      const activeCount = employees.filter((e) => e.status === 'Active').length;
      const inactiveCount = employees.filter((e) => e.status === 'Inactive').length;
      response = `📊 Employee Count:\n• Active: ${activeCount}\n• Inactive: ${inactiveCount}\n• Total: ${employees.length}`;
    }

    // Search for specific employee
    else if (lowerQuery.includes('employee') && lowerQuery.includes('emp')) {
      const empId = lowerQuery.match(/emp\d+/i)?.[0].toUpperCase();
      if (empId) {
        const emp = employees.find((e) => e.id === empId);
        if (emp) {
          response = `👤 Employee Details:\n\n**${emp.name}**\n• ID: ${emp.id}\n• Department: ${emp.department}\n• Designation: ${emp.designation}\n• Salary: ₹${emp.salary.toLocaleString()}\n• Status: ${emp.status}\n• Email: ${emp.email}\n• Phone: ${emp.phone}\n• Join Date: ${emp.joinDate}`;
        } else {
          response = `❌ Employee ${empId} not found in the system.`;
        }
      } else {
        response = `Please specify an employee ID (e.g., EMP001, EMP002)`;
      }
    }

    // Average salary
    else if (lowerQuery.includes('average salary') || lowerQuery.includes('avg salary')) {
      const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);
      const avgSalary = totalSalary / employees.length;
      response = `💰 Salary Information:\n• Average Salary: ₹${Math.round(avgSalary).toLocaleString()}\n• Total Salary Budget: ₹${totalSalary.toLocaleString()}\n• Highest: ₹${Math.max(...employees.map((e) => e.salary)).toLocaleString()}\n• Lowest: ₹${Math.min(...employees.map((e) => e.salary)).toLocaleString()}`;
    }

    // Department query
    else if (lowerQuery.includes('department') || lowerQuery.includes('cse') || lowerQuery.includes('math') || lowerQuery.includes('physics')) {
      let dept = '';
      if (lowerQuery.includes('cse') || lowerQuery.includes('computer')) {
        dept = 'Computer Science';
      } else if (lowerQuery.includes('math')) {
        dept = 'Mathematics';
      } else if (lowerQuery.includes('physics')) {
        dept = 'Physics';
      } else if (lowerQuery.includes('chemistry')) {
        dept = 'Chemistry';
      }

      if (dept) {
        const deptEmps = employees.filter((e) => e.department === dept);
        response = `🏢 ${dept} Department:\n• Total Employees: ${deptEmps.length}\n• Members:\n${deptEmps.map((e) => `  - ${e.name} (${e.designation})`).join('\n')}`;
      } else {
        response = 'Which department? Available: Computer Science, Mathematics, Physics, Chemistry, Biology, English, PE, Admin';
      }
    }

    // Attendance rate
    else if (lowerQuery.includes('attendance')) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyAttendance = attendance.filter((a) => a.date.startsWith(currentMonth));
      const presentCount = monthlyAttendance.filter((a) => a.status === 'Present').length;
      const totalRecords = monthlyAttendance.length;
      const rate = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(2) : 0;
      response = `📅 Current Month Attendance:\n• Total Records: ${totalRecords}\n• Present: ${presentCount}\n• Attendance Rate: ${rate}%\n• Working Days: ${workingDaysPerMonth}`;
    }

    // Salary calculation
    else if (lowerQuery.includes('calculate salary') || lowerQuery.includes('salary calculation')) {
      response = `💻 To calculate salary, provide:\n1. Employee ID\n2. Number of working days\n3. Number of absent days\n\nExample: "Calculate salary for EMP001 with 20 absent days"\n\nDeductions Applied:\n• PF: 12%\n• ESI: 4.75%\n• Professional Tax: ₹100\n• Loss of Pay (LOP): For absent/unpaid leave days`;
    }

    // Leave policies
    else if (lowerQuery.includes('leave') || lowerQuery.includes('policy')) {
      response = `📋 Leave Policies:\n\n**Types of Leave:**\n• Paid Leave (PL): No salary deduction\n• Unpaid Leave (UL): Salary deduction\n• Half-Day: 50% attendance\n• Casual Leave: Not tracked separately\n\n**Loss of Pay (LOP):**\nCalculated for:\n✓ Absent days\n✓ Unpaid leave days\n\n**Formula:**\nPer Day = Gross Salary / ${workingDaysPerMonth}\nLOP = Per Day × (Absent + Unpaid Leave days)`;
    }

    // Help
    else if (lowerQuery.includes('help') || lowerQuery.includes('what can')) {
      response = `🤖 I can assist with:\n\n**Employee Queries:**\n• "Show me employee EMP001"\n• "How many active employees?"\n• "Employees in CSE department"\n\n**Salary & Payroll:**\n• "Average salary"\n• "Calculate salary for..."\n• "Highest and lowest salaries"\n\n**Attendance:**\n• "Current attendance rate"\n• "Attendance breakdown"\n\n**Policies:**\n• "Tell me about leave policies"\n• "Deduction calculation"\n\nJust ask me anything!`;
    }

    // Default response
    else {
      response = `❓ I didn't quite understand your query.\n\nTry asking about:\n• Employee details (e.g., "Show EMP001")\n• Salaries (e.g., "Average salary")\n• Departments (e.g., "CSE department")\n• Attendance (e.g., "Attendance rate")\n• Leave policies\n\nOr type "help" to see more options!`;
    }

    return response;
  };

  const handleSendQuery = () => {
    if (!userQuery.trim()) return;

    // Add user message
    const newHistory = [
      ...chatHistory,
      { type: 'user', message: userQuery },
    ];

    // Process and add AI response
    const aiResponse = processQuery(userQuery);
    newHistory.push({ type: 'assistant', message: aiResponse });

    setChatHistory(newHistory);
    setUserQuery('');
  };

  const handleSuggestedQuery = (query) => {
    setUserQuery(query);
  };

  const handleQuickSearch = (query) => {
    const newHistory = [
      ...chatHistory,
      { type: 'user', message: query },
    ];
    const aiResponse = processQuery(query);
    newHistory.push({ type: 'assistant', message: aiResponse });
    setChatHistory(newHistory);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Chat Area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
            {/* Chat Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                backgroundColor: '#f9f9f9',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {chatHistory.map((msg, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '80%',
                      backgroundColor: msg.type === 'user' ? '#2196f3' : '#e3f2fd',
                      color: msg.type === 'user' ? 'white' : 'text.primary',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.95rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.message}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>

            <Divider />

            {/* Input Area */}
            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Ask me about employees, salaries, attendance..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendQuery();
                  }
                }}
                multiline
                maxRows={3}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleSendQuery}
                disabled={!userQuery.trim()}
                sx={{ alignSelf: 'flex-end' }}
              >
                <SendIcon />
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar - Suggested Queries & Quick Stats */}
        <Grid item xs={12} md={4}>
          {/* Suggested Queries */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                💡 Try Asking
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {suggestedQueries.map((query, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    fullWidth
                    onClick={() => handleQuickSearch(query)}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      height: 'auto',
                      py: 1,
                    }}
                  >
                    {query}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                📊 Quick Stats
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Employees:</Typography>
                  <Chip label={employees.length} color="primary" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Active:</Typography>
                  <Chip
                    label={employees.filter((e) => e.status === 'Active').length}
                    color="success"
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Inactive:</Typography>
                  <Chip
                    label={employees.filter((e) => e.status === 'Inactive').length}
                    color="error"
                    size="small"
                  />
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Avg Salary:</Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    ₹
                    {Math.round(
                      employees.reduce((sum, e) => sum + e.salary, 0) / employees.length
                    ).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                ❓ FAQ
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                <strong>What's a Loss of Pay (LOP)?</strong>
                <br />
                Deduction from salary for absent or unpaid leave days.
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                <strong>How are deductions calculated?</strong>
                <br />
                PF (12%), ESI (4.75%), Prof Tax (₹100) from gross salary.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIAssistant;
