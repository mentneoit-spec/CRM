import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AttendanceCalendar = ({ attendanceData = [], month, year, onMonthChange }) => {
  const [currentMonth, setCurrentMonth] = useState(month || new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(year || new Date().getFullYear());

  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  // Create a map of attendance by date
  const attendanceMap = {};
  attendanceData.forEach(record => {
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
    
    // If any status is 'present', show present
    if (statuses.includes('present')) return 'present';
    // If any status is 'absent', show absent
    if (statuses.includes('absent')) return 'absent';
    // If any status is 'leave', show leave
    if (statuses.includes('leave')) return 'leave';
    // Otherwise show sick
    return 'sick';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'leave':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'sick':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-400 border-gray-200';
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
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Previous month"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Next month"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const status = day ? getStatusForDate(day) : null;
            const statusColor = getStatusColor(status);

            return (
              <div
                key={index}
                className={`aspect-square flex items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                  day
                    ? `${statusColor} cursor-default`
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                }`}
              >
                {day && (
                  <div className="text-center">
                    <div className="text-xs">{day}</div>
                    {status && <div className="text-xs opacity-75">{getStatusLabel(status).charAt(0)}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">Legend</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-green-100 border border-green-300"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-red-100 border border-red-300"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-yellow-100 border border-yellow-300"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-orange-100 border border-orange-300"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Sick</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
