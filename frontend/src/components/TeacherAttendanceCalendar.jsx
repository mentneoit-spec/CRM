import React, { useState } from 'react';
import { Box, Paper, Typography, IconButton, Grid } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const TeacherAttendanceCalendar = ({ attendanceData = [], month, year, onMonthChange, studentId }) => {
  const [currentMonth, setCurrentMonth] = useState(month || new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(year || new Date().getFullYear());

  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  // Create a map of attendance by date
  const attendanceMap = {};
  attendanceData.forEach(record => {
    if (studentId && record.studentId !== studentId) return;
    const date = new Date(record.date);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!attendanceMap[dateKey]) {
      attendanceMap[dateKey] = [];
    }
    attendanceMap[dateKey].push(record.status);
  });

  const getStatusForDate = (day) => {
    const dateKey = `${currentYear}-${currentMonth}-${day}`;
    const statuses = attendanceMap[dateKey] || [];
    
    if (statuses.length === 0) return null;
    
    if (statuses.includes('present')) return 'present';
    if (statuses.includes('absent')) return 'absent';
    if (statuses.includes('leave')) return 'leave';
    return 'sick';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
      case 'absent':
        return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case 'leave':
        return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      case 'sick':
        return { bg: '#fed7aa', text: '#9a3412', border: '#fdba74' };
      default:
        return { bg: '#f3f4f6', text: '#9ca3af', border: '#e5e7eb' };
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return '--';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    if (onMonthChange) {
      onMonthChange(currentMonth === 0 ? 11 : currentMonth - 1, currentMonth === 0 ? currentYear - 1 : currentYear);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    if (onMonthChange) {
      onMonthChange(currentMonth === 11 ? 0 : currentMonth + 1, currentMonth === 11 ? currentYear + 1 : currentYear);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {monthNames[currentMonth]} {currentYear}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={handlePrevMonth} title="Previous month">
              <ChevronLeftIcon />
            </IconButton>
            <IconButton size="small" onClick={handleNextMonth} title="Next month">
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Day names */}
        <Grid container spacing={1} sx={{ mb: 1 }}>
          {dayNames.map(day => (
            <Grid item xs={12 / 7} key={day} sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280' }}>
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Calendar grid */}
        <Grid container spacing={1}>
          {days.map((day, index) => {
            const status = day ? getStatusForDate(day) : null;
            const colors = getStatusColor(status);

            return (
              <Grid item xs={12 / 7} key={index}>
                <Box
                  sx={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.bg,
                    color: colors.text,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: day ? 'default' : 'auto',
                    transition: 'all 0.2s',
                  }}
                >
                  {day && (
                    <Box sx={{ textAlign: 'center' }}>
                      <div>{day}</div>
                      {status && <div sx={{ fontSize: '0.6rem', opacity: 0.8 }}>{getStatusLabel(status).charAt(0)}</div>}
                    </Box>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Legend */}
      <Box sx={{ borderTop: '1px solid #e5e7eb', pt: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', display: 'block', mb: 1 }}>
          Legend
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, borderRadius: '4px', backgroundColor: '#dcfce7', border: '1px solid #86efac' }} />
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Present</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, borderRadius: '4px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5' }} />
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Absent</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, borderRadius: '4px', backgroundColor: '#fef3c7', border: '1px solid #fcd34d' }} />
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Leave</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, borderRadius: '4px', backgroundColor: '#fed7aa', border: '1px solid #fdba74' }} />
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Sick</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TeacherAttendanceCalendar;
