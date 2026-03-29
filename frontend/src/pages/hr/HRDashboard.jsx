import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  EventNote as AttendanceIcon,
  AccountBalance as PayrollIcon,
  Receipt as PayslipIcon,
  BarChart as ReportsIcon,
  SmartToy as AIIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { employees as initialEmployees } from '../../data/hr-data/employees';
import { attendanceRecords } from '../../data/hr-data/attendance';
import EmployeeManagement from './sections/EmployeeManagement';
import AttendanceManagement from './sections/AttendanceManagement';
import PayrollManagement from './sections/PayrollManagement';
import PayslipViewer from './sections/PayslipViewer';
import ReportsSection from './sections/ReportsSection';
import AIAssistant from './sections/AIAssistant';

const DRAWER_WIDTH = 280;

const navigationItems = [
  { id: 0, label: 'Dashboard', icon: DashboardIcon, color: '#2196F3', bgColor: '#E3F2FD' },
  { id: 1, label: 'Employee Management', icon: PeopleIcon, color: '#4CAF50', bgColor: '#E8F5E9' },
  { id: 2, label: 'Attendance', icon: AttendanceIcon, color: '#FF9800', bgColor: '#FFF3E0' },
  { id: 3, label: 'Payroll', icon: PayrollIcon, color: '#9C27B0', bgColor: '#F3E5F5' },
  { id: 4, label: 'Payslips', icon: PayslipIcon, color: '#00BCD4', bgColor: '#E0F2F1' },
  { id: 5, label: 'Reports', icon: ReportsIcon, color: '#F44336', bgColor: '#FFEBEE' },
  { id: 6, label: 'AI Assistant', icon: AIIcon, color: '#FF5722', bgColor: '#FBE9E7' },
];

function HRDashboard() {
  const [activeSection, setActiveSection] = useState(0);
  const [employees, setEmployees] = useState(initialEmployees);
  const [attendance, setAttendance] = useState(attendanceRecords);

  const renderContent = () => {
    switch (activeSection) {
      case 0:
        return <DashboardOverview employees={employees} attendance={attendance} />;
      case 1:
        return <EmployeeManagement employees={employees} setEmployees={setEmployees} />;
      case 2:
        return <AttendanceManagement employees={employees} attendance={attendance} setAttendance={setAttendance} />;
      case 3:
        return <PayrollManagement employees={employees} attendance={attendance} />;
      case 4:
        return <PayslipViewer employees={employees} attendance={attendance} />;
      case 5:
        return <ReportsSection employees={employees} attendance={attendance} />;
      case 6:
        return <AIAssistant employees={employees} attendance={attendance} />;
      default:
        return <DashboardOverview employees={employees} attendance={attendance} />;
    }
  };

  const currentNav = navigationItems[activeSection];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f6fa' }}>
      {/* Professional Sidebar */}
      <Drawer
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#2E7D32',
            color: '#ffffff',
            boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255,255,255,0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '3px',
            },
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {/* Navigation List */}
        <List sx={{ p: 1.5, flexGrow: 1 }}>
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            return (
              <ListItem
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                sx={{
                  mb: 0.5,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  bgcolor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  borderLeft: isActive ? `3px solid #A5D6A7` : '3px solid transparent',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  pl: isActive ? '18px' : '21px',
                  py: 1.2,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.08)',
                  },
                }}
                component="div"
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? '#A5D6A7' : 'rgba(255,255,255,0.65)',
                    transition: 'color 0.25s ease',
                  }}
                >
                  <IconComponent sx={{ fontSize: 22 }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: '0.3px',
                  }}
                />
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

        {/* Sidebar Footer */}
        <Box sx={{ p: 1.5 }}>
          <ListItem
            sx={{
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              py: 1.2,
              bgcolor: 'rgba(255,255,255,0.08)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.15)',
              },
            }}
            component="div"
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: '#FFB74D',
              }}
            >
              <LogoutIcon sx={{ fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFB74D',
              }}
            />
          </ListItem>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Professional Header */}
        <AppBar
          position="static"
          sx={{
            bgcolor: '#ffffff',
            color: '#2E7D32',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            borderBottom: '2px solid #C8E6C9',
          }}
        >
          <Toolbar sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              {/* Color bar indicator */}
              <Box
                sx={{
                  width: 5,
                  height: 40,
                  bgcolor: '#66BB6A',
                  borderRadius: '0 4px 4px 0',
                  boxShadow: '0 2px 8px rgba(102, 187, 106, 0.4)',
                }}
              />
              {/* Section title */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    fontSize: '18px',
                    color: '#2E7D32',
                    letterSpacing: '0.3px',
                  }}
                >
                  {currentNav?.label || 'HR Portal'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#558B2F',
                    fontSize: '11px',
                    display: 'block',
                    mt: 0.25,
                  }}
                >
                  Management System
                </Typography>
              </Box>

              {/* Right side */}
              <Box sx={{ ml: 'auto', display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#66BB6A' }}>
                    HR
                  </Avatar>
                </Box>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 4,
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
}

// Dashboard Overview Component
function DashboardOverview({ employees, attendance }) {
  const activeEmployees = employees.filter((e) => e.status === 'Active').length;
  const inactiveEmployees = employees.filter((e) => e.status === 'Inactive').length;

  const todayDate = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter((a) => a.date === todayDate);
  const presentToday = todayAttendance.filter((a) => a.status === 'Present').length;
  const absentToday = todayAttendance.filter((a) => a.status === 'Absent').length;

  const attendanceRate = attendance.length > 0
    ? ((presentToday / Math.max(todayAttendance.length, 1)) * 100).toFixed(1)
    : 0;

  const stats = [
    {
      label: 'Total Employees',
      value: employees.length,
      icon: PeopleIcon,
      color: '#4CAF50',
      bgColor: '#E8F5E9',
      trend: '+2.5%',
    },
    {
      label: 'Active Employees',
      value: activeEmployees,
      icon: DashboardIcon,
      color: '#2196F3',
      bgColor: '#E3F2FD',
      trend: '+0.8%',
    },
    {
      label: 'Present Today',
      value: presentToday,
      icon: AttendanceIcon,
      color: '#FF9800',
      bgColor: '#FFF3E0',
      trend: '↑',
    },
    {
      label: 'Attendance Rate',
      value: `${attendanceRate}%`,
      icon: ReportsIcon,
      color: '#9C27B0',
      bgColor: '#F3E5F5',
      trend: 'stable',
    },
  ];

  return (
    <Grid container spacing={3}>
      {/* KPI Stats Cards */}
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                border: '1px solid #e8eaf6',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                  transform: 'translateY(-6px)',
                  borderColor: stat.color,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666',
                        fontWeight: 600,
                        mb: 1.5,
                        fontSize: '12px',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        color: stat.color,
                        fontSize: '28px',
                        mb: 1,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Chip
                      label={stat.trend}
                      size="small"
                      sx={{
                        bgcolor: stat.bgColor,
                        color: stat.color,
                        fontWeight: 600,
                        fontSize: '11px',
                        height: 22,
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      bgcolor: stat.bgColor,
                      p: 1.5,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ml: 1,
                    }}
                  >
                    <IconComponent
                      sx={{
                        color: stat.color,
                        fontSize: 32,
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}

      {/* Employee Status Distribution */}
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
            border: '1px solid #e8eaf6',
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2.5,
                color: '#1a237e',
                fontSize: '16px',
              }}
            >
              Employee Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#E8F5E9',
                    border: '2px solid #4CAF50',
                    borderRadius: '10px',
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ color: '#666', fontSize: '12px', fontWeight: 600, mb: 0.5 }}>
                    Active
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '24px',
                      color: '#4CAF50',
                    }}
                  >
                    {activeEmployees}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#FFEBEE',
                    border: '2px solid #F44336',
                    borderRadius: '10px',
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ color: '#666', fontSize: '12px', fontWeight: 600, mb: 0.5 }}>
                    Inactive
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '24px',
                      color: '#F44336',
                    }}
                  >
                    {inactiveEmployees}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Attendance Summary */}
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
            border: '1px solid #e8eaf6',
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2.5,
                color: '#1a237e',
                fontSize: '16px',
              }}
            >
              Today's Attendance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#FFF3E0',
                    border: '2px solid #FF9800',
                    borderRadius: '10px',
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ color: '#666', fontSize: '12px', fontWeight: 600, mb: 0.5 }}>
                    Present
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '24px',
                      color: '#FF9800',
                    }}
                  >
                    {presentToday}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#FCE4EC',
                    border: '2px solid #E91E63',
                    borderRadius: '10px',
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ color: '#666', fontSize: '12px', fontWeight: 600, mb: 0.5 }}>
                    Absent
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '24px',
                      color: '#E91E63',
                    }}
                  >
                    {absentToday}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Department Distribution */}
      <Grid item xs={12}>
        <Card
          sx={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
            border: '1px solid #e8eaf6',
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2.5,
                color: '#1a237e',
                fontSize: '16px',
              }}
            >
              Department Distribution
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {Array.from(new Set(employees.map((e) => e.department)))
                .sort()
                .map((dept, idx) => {
                  const count = employees.filter((e) => e.department === dept).length;
                  const colors = [
                    { bg: '#E3F2FD', text: '#2196F3' },
                    { bg: '#E8F5E9', text: '#4CAF50' },
                    { bg: '#FFF3E0', text: '#FF9800' },
                    { bg: '#F3E5F5', text: '#9C27B0' },
                    { bg: '#E0F2F1', text: '#00BCD4' },
                    { bg: '#FFEBEE', text: '#F44336' },
                    { bg: '#FBE9E7', text: '#FF5722' },
                    { bg: '#F1F8E9', text: '#689F38' },
                  ];
                  const colorIndex = idx % colors.length;
                  return (
                    <Chip
                      key={dept}
                      label={`${dept} (${count})`}
                      sx={{
                        bgcolor: colors[colorIndex].bg,
                        color: colors[colorIndex].text,
                        fontWeight: 700,
                        fontSize: '12px',
                        height: 32,
                        borderWidth: 2,
                        borderStyle: 'solid',
                        borderColor: colors[colorIndex].text,
                      }}
                    />
                  );
                })}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default HRDashboard;
