import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Send as SendIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import hrAPI from '../../config/hrAPI';

const AIHRAssistant = () => {
  const [employees, setEmployees] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: 'Hello! I\'m your AI HR Assistant. I can help you with:\n• Salary analysis & optimization\n• Team performance insights\n• Leave management strategies\n• Department statistics\n• Increment planning\n\nWhat would you like help with today?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [openSuggestions, setOpenSuggestions] = useState(false);

  useEffect(() => {
    fetchHRData();
  }, []);

  const fetchHRData = async () => {
    try {
      const [empResponse, dashResponse, salaryResponse] = await Promise.all([
        hrAPI.getEmployees({}),
        hrAPI.getHRDashboard(),
        hrAPI.getSalaryRecords(),
      ]);

      if (empResponse.data?.success) {
        setEmployees(empResponse.data.data);
      }

      if (dashResponse.data?.success) {
        setDashboardData(dashResponse.data.data);
      }

      if (salaryResponse.data?.success) {
        setSalaryRecords(salaryResponse.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch HR data:', err);
    }
  };

  const generateAISuggestions = (query) => {
    const suggestions = [];
    const queryLower = query.toLowerCase();

    // Check if there's NO employee data
    if (employees.length === 0) {
      suggestions.push({
        type: 'no_data',
        title: '📊 No Data Available',
        details: `No employee data found. Please:\n\n1. Add HR Manager (if not done)\n2. Have HR Manager add employees\n3. Then AI analysis will be available\n\nAI features work with real employee data from your HR system. Currently, you have 0 employees in the database.`,
        icon: LightbulbIcon,
      });
      return suggestions;
    }

    // SALARY ANALYSIS - Real Data
    if (queryLower.includes('salary') || queryLower.includes('increment')) {
      if (employees.length > 0) {
        const salaries = employees.map(e => e.salary || 0).filter(s => s > 0);
        const avgSalary = salaries.reduce((a, b) => a + b, 0) / salaries.length;
        const maxSalary = Math.max(...salaries);
        const minSalary = Math.min(...salaries);
        const highEarners = employees.filter(e => e.salary > avgSalary * 1.5).slice(0, 5);
        const lowEarners = employees.filter(e => e.salary < avgSalary * 0.7).slice(0, 5);

        suggestions.push({
          type: 'salary_recommendation',
          title: 'Salary Analysis & Recommendations',
          details: `📊 REAL DATA ANALYSIS:\n\n💰 Salary Overview:\n- Average: ₹${avgSalary.toLocaleString()}/month\n- Highest: ₹${maxSalary.toLocaleString()}\n- Lowest: ₹${minSalary.toLocaleString()}\n- Range: ₹${(maxSalary - minSalary).toLocaleString()}\n\n📈 High Earners (${highEarners.length}):\n${highEarners.map(e => `• ${e.name} (${e.designation}): ₹${e.salary?.toLocaleString()}`).join('\n')}\n\n📉 Budget Optimization Candidates (${lowEarners.length}):\n${lowEarners.map(e => `• ${e.name} (${e.designation}): ₹${e.salary?.toLocaleString()} - Consider review`).join('\n')}\n\n✅ Recommendation: Review high earners for performance alignment and plan increments for low earners.`,
          icon: TrendingUpIcon,
        });
      }
    }

    // PERFORMANCE & ATTENDANCE - Real Data
    if (queryLower.includes('performance') || queryLower.includes('attendance') || queryLower.includes('team')) {
      if (employees.length > 0) {
        const activeEmps = employees.filter(e => e.status === 'Active').length;
        const inactiveEmps = employees.filter(e => e.status !== 'Active').length;
        const deptBreakdown = {};
        employees.forEach(e => {
          deptBreakdown[e.department] = (deptBreakdown[e.department] || 0) + 1;
        });
        const designations = [...new Set(employees.map(e => e.designation))];

        suggestions.push({
          type: 'performance_analysis',
          title: 'Team Performance Analysis',
          details: `👥 REAL TEAM DATA:\n\n📊 Workforce Status:\n- Total Employees: ${employees.length}\n- Active: ${activeEmps} (${((activeEmps/employees.length)*100).toFixed(1)}%)\n- Inactive: ${inactiveEmps}\n- Average Salary: ₹${(employees.reduce((sum, e) => sum + (e.salary || 0), 0) / employees.length).toLocaleString()}\n\n🏢 Department Breakdown:\n${Object.entries(deptBreakdown).map(([dept, count]) => `• ${dept}: ${count} employees`).join('\n')}\n\n👔 Designations (${designations.length}):\n${designations.slice(0, 8).map(d => `• ${d}`).join('\n')}\n\n✅ Insights: Your team structure is well organized. Focus on active employees for projects and monitor inactive staff.`,
          icon: PsychologyIcon,
        });
      }
    }

    // LEAVE MANAGEMENT - Real Data
    if (queryLower.includes('leave') || queryLower.includes('approval') || queryLower.includes('time off')) {
      if (employees.length > 0) {
        const description = `🏖️ LEAVE MANAGEMENT STRATEGY:\n\nBased on your team of ${employees.length} employees:\n\n📋 Best Practices:\n• Set clear leave policies for all departments\n• Maintain 2-3 days buffer per department always\n• Track leave patterns to identify trends\n• Enforce approvals with HR manager sign-off\n\n💡 Your Team:\n- Monitor department coverage during peak seasons\n- Encourage work-from-home for urgent cases\n- Balance emergency vs planned leaves\n- Conduct quarterly policy reviews\n\n📅 Technical Setup:\n• Document all leave requests with dates\n• Set auto-notifications 2 weeks before leaves\n• Maintain backup resources for each role\n• Create leave dashboards for visibility`;

        suggestions.push({
          type: 'leave_suggestion',
          title: 'Strategic Leave Management',
          details: description,
          icon: CheckCircleIcon,
        });
      }
    }

    // DEPARTMENT STATISTICS - Real Data
    if (queryLower.includes('department') || queryLower.includes('stats') || queryLower.includes('structure')) {
      if (employees.length > 0) {
        const deptStats = {};
        employees.forEach(e => {
          if (!deptStats[e.department]) {
            deptStats[e.department] = { count: 0, totalSalary: 0, designations: new Set() };
          }
          deptStats[e.department].count++;
          deptStats[e.department].totalSalary += e.salary || 0;
          deptStats[e.department].designations.add(e.designation);
        });

        const deptDetails = Object.entries(deptStats)
          .sort((a, b) => b[1].count - a[1].count)
          .map(([dept, data]) => {
            const avgSal = data.totalSalary / data.count;
            return `\n📍 ${dept}:\n  • Count: ${data.count} employees\n  • Total Budget: ₹${data.totalSalary.toLocaleString()}\n  • Avg Salary: ₹${avgSal.toLocaleString()}\n  • Roles: ${Array.from(data.designations).slice(0, 3).join(', ')}`;
          })
          .join('');

        suggestions.push({
          type: 'department_stats',
          title: 'Department Statistics & Structure',
          details: `🏢 DEPARTMENT BREAKDOWN:\n${deptDetails}\n\n📊 Total Investment: ₹${employees.reduce((sum, e) => sum + (e.salary || 0), 0).toLocaleString()}/month\n\n✅ Action Items:\n• Review salary ranges by department\n• Identify hiring needs\n• Optimize resource allocation`,
          icon: LightbulbIcon,
        });
      }
    }

    // SALARY INCREMENT ANALYSIS - Real Data
    if (queryLower.includes('increment') || queryLower.includes('raise') || queryLower.includes('promotion')) {
      if (employees.length > 0) {
        const avgSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0) / employees.length;
        const suggestedIncrement = avgSalary * 0.1; // 10% increment suggestion
        const belowAverage = employees.filter(e => e.salary < avgSalary).sort((a, b) => a.salary - b.salary).slice(0, 5);
        
        suggestions.push({
          type: 'increment_analysis',
          title: 'Increment & Promotion Strategy',
          details: `📈 INCREMENT ANALYSIS:\n\n💡 Market Benchmark:\n- Current Average: ₹${avgSalary.toLocaleString()}/month\n- Suggested 10% Increment: ₹${suggestedIncrement.toLocaleString()}\n\n👥 Priority for Increments (${belowAverage.length} candidates):\n${belowAverage.map((e, i) => `${i+1}. ${e.name} (${e.designation}): ₹${e.salary?.toLocaleString()} → ₹${(e.salary * 1.1).toLocaleString()}`).join('\n')}\n\n💰 Budget Impact:\n- Current Total: ₹${(employees.reduce((sum, e) => sum + (e.salary || 0), 0) / 100000).toFixed(1)}L/month\n- With Increments: ₹${((employees.reduce((sum, e) => sum + (e.salary || 0), 0)) * 1.05) / 100000).toFixed(1)}L/month (5% increase)\n\n✅ Recommendation: Process increments in phases to manage budget impact.`,
          icon: TrendingUpIcon,
        });
      }
    }

    if (suggestions.length === 0) {
      if (employees.length > 0) {
        suggestions.push({
          type: 'general',
          title: 'AI HR Assistant Ready',
          details: `🤖 I can help with:\n\n📊 Ask about:\n✓ Salary analysis & recommendations\n✓ Performance & team analysis\n✓ Attendance & leave management\n✓ Department statistics\n✓ Increment planning\n✓ Budget optimization\n✓ Workforce insights\n\n💡 Try saying:\n• "Show salary recommendations"\n• "Analyze team performance"\n• "Department statistics"\n• "Increment strategy"\n\nOr describe your specific HR need!`,
          icon: LightbulbIcon,
        });
      } else {
        suggestions.push({
          type: 'no_data',
          title: '📊 No Data Available',
          details: `No employee data found. Please:\n\n1. Add HR Manager (if not done)\n2. Have HR Manager add employees\n3. Then AI analysis will be available`,
          icon: LightbulbIcon,
        });
      }
    }

    return suggestions;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputValue,
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // Get collegeId from localStorage or auth context
      const collegeId = localStorage.getItem('collegeId') || '';

      // Prepare messages for Groq AI
      const conversationMessages = messages
        .filter(m => m.type !== 'initial') // Skip initial welcome message
        .map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.content,
        }))
        .concat([{ role: 'user', content: inputValue }]);

      // Call real Groq AI endpoint (using chat for conversational interface)
      const response = await hrAPI.chatWithAI(conversationMessages, collegeId);

      if (response.data?.success) {
        const assistantMessage = {
          type: 'assistant',
          content: response.data.data.message,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Also generate suggestions from the message
        const suggestions = generateSuggestionsFromResponse(response.data.data.message, inputValue);
        setAiSuggestions(suggestions);
        setOpenSuggestions(true);
      }
      setLoading(false);
    } catch (err) {
      console.error('AI Error:', err);
      const errorMessage = {
        type: 'assistant',
        content: `Sorry, I encountered an error: ${err.response?.data?.error || err.message}. Please try again.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
    }
  };

  const generateSuggestionsFromResponse = (response, query) => {
    // Parse the AI response to extract suggestions
    const suggestions = [];

    if (
      query.toLowerCase().includes('salary') ||
      query.toLowerCase().includes('increment')
    ) {
      suggestions.push({
        type: 'salary_recommendation',
        title: 'Salary Analysis from AI',
        details: response.substring(0, 500) + '...',
        icon: TrendingUpIcon,
      });
    }

    if (
      query.toLowerCase().includes('performance') ||
      query.toLowerCase().includes('team')
    ) {
      suggestions.push({
        type: 'performance_analysis',
        title: 'Team Performance Insights',
        details: response.substring(0, 500) + '...',
        icon: PsychologyIcon,
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        type: 'general',
        title: 'AI Response',
        details: response.substring(0, 500) + '...',
        icon: LightbulbIcon,
      });
    }

    return suggestions;
  };

  const handleQuickAction = async (action) => {
    setInputValue(action);
    
    // Optionally auto-send the quick action
    const collegeId = localStorage.getItem('collegeId') || '';
    
    if (action.toLowerCase().includes('salary') && action.toLowerCase().includes('recommendation')) {
      // Call salary recommendations endpoint
      try {
        setLoading(true);
        const response = await hrAPI.getSalaryRecommendations(collegeId);
        if (response.data?.success) {
          const assistantMessage = {
            type: 'assistant',
            content: response.data.data.recommendations,
          };
          setMessages((prev) => [...prev, {
            type: 'user',
            content: action,
          }, assistantMessage]);
          setInputValue('');
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    } else if (action.toLowerCase().includes('performance')) {
      // Call team analysis endpoint
      try {
        setLoading(true);
        const response = await hrAPI.analyzeTeam(collegeId);
        if (response.data?.success) {
          const assistantMessage = {
            type: 'assistant',
            content: response.data.data.analysis,
          };
          setMessages((prev) => [...prev, {
            type: 'user',
            content: action,
          }, assistantMessage]);
          setInputValue('');
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <AIIcon sx={{ color: '#2196f3' }} />
        AI HR Assistant
      </Typography>

      <Grid container spacing={2}>
        {/* Chat Area */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                bgcolor: '#fafafa',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {messages.map((msg, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Paper
                    sx={{
                      p: 1.5,
                      maxWidth: '80%',
                      bgcolor: msg.type === 'user' ? '#2196f3' : '#e3f2fd',
                      color: msg.type === 'user' ? 'white' : 'inherit',
                      borderRadius: 2,
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    <Typography variant="body2">{msg.content}</Typography>
                  </Paper>
                </Box>
              ))}
              {loading && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                    AI is thinking...
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Input */}
            <Box sx={{ p: 2, borderTop: '1px solid #eee', display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Ask me anything about HR management..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={loading}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={loading || !inputValue.trim()}
                endIcon={<SendIcon />}
              >
                Send
              </Button>
            </Box>
          </Card>

          {/* Quick Actions */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Quick Actions:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickAction('Show salary recommendations')}
              >
                Salary Recommendations
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickAction('Analyze team performance')}
              >
                Performance Analysis
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickAction('Leave management tips')}
              >
                Leave Management
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickAction('Department statistics')}
              >
                Department Stats
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Dashboard Stats */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>📊 Real Data Stats</Typography>
              {employees.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {/* Real Employee Data */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Total Employees:</Typography>
                    <Chip label={employees.length} size="small" color="primary" variant="filled" />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Active:</Typography>
                    <Chip label={employees.filter(e => e.status === 'Active').length} size="small" color="success" variant="filled" />
                  </Box>

                  {/* Real Salary Data */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Monthly Salary Bill:</Typography>
                    <Chip
                      label={`₹${(employees.reduce((sum, e) => sum + (e.salary || 0), 0) / 100000).toFixed(2)}L`}
                      size="small"
                      color="warning"
                      variant="filled"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Avg Salary:</Typography>
                    <Chip
                      label={`₹${(employees.reduce((sum, e) => sum + (e.salary || 0), 0) / Math.max(1, employees.length)).toLocaleString()}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {/* Real Salary Records Data */}
                  {salaryRecords.length > 0 && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Salary Records:</Typography>
                        <Chip label={salaryRecords.length} size="small" color="info" variant="filled" />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Processed:</Typography>
                        <Chip 
                          label={salaryRecords.filter(s => s.status === 'Processed').length} 
                          size="small" 
                          color="success" 
                          variant="outlined"
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Pending:</Typography>
                        <Chip 
                          label={salaryRecords.filter(s => s.status === 'Pending').length} 
                          size="small" 
                          color="warning" 
                          variant="outlined"
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Total Processed:</Typography>
                        <Chip
                          label={`₹${(salaryRecords.filter(s => s.status === 'Processed').reduce((sum, s) => sum + (s.netSalary || 0), 0) / 100000).toFixed(2)}L`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </>
                  )}

                  {/* Department Breakdown */}
                  {Array.from(new Set(employees.map(e => e.department))).length > 0 && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #eee' }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                        Departments ({Array.from(new Set(employees.map(e => e.department))).length}):
                      </Typography>
                      <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {Array.from(new Set(employees.map(e => e.department))).map((dept, idx) => (
                          <Chip 
                            key={idx}
                            label={`${dept}: ${employees.filter(e => e.department === dept).length}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>Loading data...</Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>💡 Smart Recommendations</Typography>
              <List sx={{ p: 0 }}>
                {employees.length > 0 && (
                  <>
                    <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', pb: 1.5 }}>
                      <ListItemText
                        primary={<Typography variant="body2" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>⚠️ Budget Alert</Typography>}
                        secondary={`Total monthly salary: ₹${(employees.reduce((sum, e) => sum + (e.salary || 0), 0) / 100000).toFixed(2)}L - Monitor spending`}
                        sx={{ m: 0 }}
                      />
                    </ListItem>

                    <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', pb: 1.5 }}>
                      <ListItemText
                        primary={<Typography variant="body2" sx={{ fontWeight: 'bold', color: '#388e3c' }}>✓ Team Structure</Typography>}
                        secondary={`${employees.length} employees across ${Array.from(new Set(employees.map(e => e.department))).length} departments - Well balanced`}
                        sx={{ m: 0 }}
                      />
                    </ListItem>

                    {salaryRecords.length > 0 && (
                      <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', pb: 1.5 }}>
                        <ListItemText
                          primary={<Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>📊 Salary Processing</Typography>}
                          secondary={`${salaryRecords.filter(s => s.status === 'Pending').length} pending records - Process ${salaryRecords.filter(s => s.status === 'Pending').length > 0 ? 'today' : 'all done'}`}
                          sx={{ m: 0 }}
                        />
                      </ListItem>
                    )}

                    {employees.filter(e => e.status === 'Active').length === employees.length && (
                      <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', pb: 1.5 }}>
                        <ListItemText
                          primary={<Typography variant="body2" sx={{ fontWeight: 'bold', color: '#00bcd4' }}>👥 All Active</Typography>}
                          secondary="All employees are active - Great workforce engagement"
                          sx={{ m: 0 }}
                        />
                      </ListItem>
                    )}

                    <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <ListItemText
                        primary={<Typography variant="body2" sx={{ fontWeight: 'bold' }}>💡 Next Action</Typography>}
                        secondary="Ask me about salary analysis, team performance, or department statistics"
                        sx={{ m: 0 }}
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Suggestions Dialog */}
      <Dialog
        open={openSuggestions}
        onClose={() => setOpenSuggestions(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>AI Suggestions</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {aiSuggestions.map((suggestion, idx) => (
              <Card key={idx} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {suggestion.title}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {suggestion.details}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSuggestions(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIHRAssistant;
