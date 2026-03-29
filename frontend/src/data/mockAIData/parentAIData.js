// Mock data for Parent AI Features

export const parentChatQuestions = [
  'How is my child performing?',
  'What are the attendance issues?',
  'Marks summary for this month',
  'Fee payment status',
  'How can my child improve?',
];

export const childPerformanceAI = {
  childProfile: {
    name: 'Rahul Sharma',
    rollNo: '10-A-25',
    class: '10-A',
    age: 15,
    photoUrl: 'https://via.placeholder.com/150',
  },
  marksSummary: {
    currentPercentage: 78,
    previousMonthPercentage: 75,
    trend: 'Improving',
    subjectsAbove75: 4,
    subjectsBelo75: 1,
  },
  subjectWiseMarks: [
    { subject: 'Mathematics', score: 82, grade: 'A', trend: 'up' },
    { subject: 'English', score: 75, grade: 'B', trend: 'stable' },
    { subject: 'Science', score: 80, grade: 'A', trend: 'up' },
    { subject: 'Social Studies', score: 76, grade: 'B', trend: 'down' },
    { subject: 'Computer Science', score: 88, grade: 'A+', trend: 'up' },
  ],
  attendanceSummary: {
    attendancePercentage: 85,
    daysPresent: 51,
    daysAbsent: 9,
    trend: 'Stable',
    status: 'Good',
  },
  overallAnalysis: `
✨ **Monthly Performance Summary for Rahul:**

**Academic Progress:** 📈 Improving
- Overall percentage: 78% (up from 75%)
- Top subject: Computer Science (88%)
- Needs attention: Social Studies (76%)

**Attendance:** ✓ Good (85%)
- Regular in attending classes
- 9 days absent this month

**Overall Status:** Doing Well
- Keep up the good performance in Math and Science
- Focus on Social Studies for better scores
  `,
};

export const aiAlerts = {
  lowAttendanceAlert: {
    triggered: false,
    threshold: 75,
    currentAttendance: 85,
    message: 'Your child\'s attendance is above the threshold. No alerts.',
  },
  lowMarksAlerts: [
    {
      subject: 'Social Studies',
      score: 76,
      threshold: 80,
      alert: '⚠️ Score below target in Social Studies',
      action: 'Schedule meeting with teacher or arrange tuition',
    },
  ],
  behaviorAlerts: [],
  upcomingDeadlines: [
    { type: 'Exam', date: '2024-06-15', subject: 'Annual Examination' },
    { type: 'Project', date: '2024-05-30', subject: 'Science Project Submission' },
    { type: 'Fee Payment', date: '2024-05-31', description: 'May fee due by end of month' },
  ],
};

export const aiMessageSystem = {
  autoUpdates: [
    {
      date: '2024-05-22',
      message: 'Rahul scored 82 in Mathematics test. Great job! 🌟',
      priority: 'info',
    },
    {
      date: '2024-05-20',
      message: 'Social Studies percentage dropped to 76. Please discuss with him.',
      priority: 'warning',
    },
    {
      date: '2024-05-18',
      message: 'May fees are due. Please make payment by 31st May.',
      priority: 'alert',
    },
  ],
  personalizedAlerts: [
    {
      type: 'Academic',
      message: 'Rahul is showing excellent progress in Math and Science.',
      timestamp: '2024-05-22 03:00 PM',
    },
    {
      type: 'Attendance',
      message: 'Congratulations! Rahul has maintained 85% attendance.',
      timestamp: '2024-05-21 10:30 AM',
    },
    {
      type: 'Fee',
      message: 'Your fee payment for April has been received. Thank you!',
      timestamp: '2024-05-01 02:15 PM',
    },
  ],
};

export const aiSuggestions = {
  improvementSuggestions: {
    academic: [
      'Rahul is doing well in Math and Science. Encourage him to pursue STEM fields.',
      'Focus on improving Social Studies marks through more reading and discussion.',
      'Suggest joining competitive exam prep (if applicable) to utilize Math skills.',
    ],
    behavioral: [
      'Rahul shows good classroom behavior.',
      'Encourage participation in co-curricular activities.',
    ],
    lifestyle: [
      'Ensure 7-8 hours of sleep for better concentration.',
      'Limit screen time to 2 hours daily (excluding studies).',
      'Encourage outdoor physical activity.',
    ],
  },
  parentAction: [
    'Have regular study time conversations',
    'Monitor screen time and social media usage',
    'Attend parent-teacher meetings regularly',
    'Celebrate achievements to boost confidence',
  ],
};

export const parentChatbot = {
  commonQuestions: [
    {
      q: 'How do I view my child\'s attendance?',
      a: 'Go to Attendance > View Monthly Report to see detailed attendance records.',
    },
    {
      q: 'Where can I see my child\'s exam results?',
      a: 'Navigate to Marks/Results tab. You\'ll see subject-wise scores and overall percentage.',
    },
    {
      q: 'How do I check fee payment status?',
      a: 'Go to Fees section. You\'ll see pending, paid, and pending payments.',
    },
    {
      q: 'How to contact the teacher?',
      a: 'Use the Messages section to send messages to your child\'s class teacher.',
    },
  ],
  parentQueries: [
    {
      query: 'My child is struggling in Math',
      suggestedResponse: `Here's what you can do:
- Talk to the Math teacher about current weak areas
- Arrange for additional practice sessions
- Use online resources like Khan Academy
- Consider tuition if needed
- Regular practice at home (30 mins daily)`,
    },
    {
      query: 'Low attendance concerns',
      suggestedResponse: `Ways to improve attendance:
- Set a regular morning routine
- Monitor with calendar reminders
- Discuss importance of attendance
- Contact school if there are genuine issues
- Celebrate attendance milestones`,
    },
  ],
};
