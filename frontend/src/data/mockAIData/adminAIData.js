// Mock data for Admin AI Features

export const adminChatQuestions = [
  'Total attendance report ivvu',
  'Fee pending students list ivvu',
  'Which class is underperforming?',
  'Where to improve?',
  'Show fee collection trends',
  'Dropout risk students analysis',
];

export const aiAnalyticsDashboard = {
  overallPerformance: {
    studentEngagement: 78,
    academicPerformance: 82,
    attendanceRate: 85,
    feeCollection: 72,
  },
  departmentStats: [
    { department: 'Science', students: 240, avgPercentage: 78, teachers: 12 },
    { department: 'Mathematics', students: 200, avgPercentage: 75, teachers: 10 },
    { department: 'Languages', students: 280, avgPercentage: 80, teachers: 14 },
    { department: 'Social Studies', students: 220, avgPercentage: 76, teachers: 11 },
    { department: 'Physical Education', students: 180, avgPercentage: 88, teachers: 8 },
  ],
  attendanceTrends: [
    { month: 'January', overall: 82, present: 2460, absent: 540 },
    { month: 'February', overall: 84, present: 2520, absent: 480 },
    { month: 'March', overall: 83, present: 2490, absent: 510 },
    { month: 'April', overall: 85, present: 2550, absent: 450 },
    { month: 'May', overall: 87, present: 2610, absent: 390 },
  ],
};

export const aiRiskDetection = {
  dropoutRiskStudents: [
    { id: 101, name: 'Rajesh Kumar', class: '10-A', risk: 89, reason: 'Low attendance (52%)', attendance: 52 },
    { id: 102, name: 'Priya Singh', class: '9-B', risk: 76, reason: 'Poor marks trend', marksGrade: 'D' },
    { id: 103, name: 'Amit Patel', class: '10-C', risk: 68, reason: 'Payment delays', paymentStatus: 'Overdue 3 months' },
    { id: 104, name: 'Neha Yadav', class: '9-A', risk: 72, reason: 'Low engagement', engagementScore: 35 },
    { id: 105, name: 'Vikram Singh', class: '8-B', risk: 65, reason: 'Irregular attendance', attendance: 58 },
  ],
  lowAttendanceAlerts: [
    { class: '10-A', affectedStudents: 8, averageAttendance: 72, threshold: 75 },
    { class: '9-C', affectedStudents: 5, averageAttendance: 68, threshold: 75 },
    { class: '11-B', affectedStudents: 3, averageAttendance: 70, threshold: 75 },
  ],
};

export const aiFeeIntelligence = {
  feeDefaulters: [
    { id: 201, name: 'Suresh Kumar', class: '10-A', outstanding: 45000, dueDate: '2024-02-15', monthsOverdue: 6 },
    { id: 202, name: 'Deepak Verma', class: '9-B', outstanding: 30000, dueDate: '2024-03-20', monthsOverdue: 4 },
    { id: 203, name: 'Anil Singh', class: '10-C', outstanding: 60000, dueDate: '2024-01-10', monthsOverdue: 8 },
    { id: 204, name: 'Ramesh Gupta', class: '8-A', outstanding: 25000, dueDate: '2024-04-05', monthsOverdue: 3 },
  ],
  collectionTrends: [
    { month: 'Month 1', collected: 580000, pending: 120000, overdue: 45000 },
    { month: 'Month 2', collected: 620000, pending: 95000, overdue: 50000 },
    { month: 'Month 3', collected: 650000, pending: 75000, overdue: 55000 },
    { month: 'Month 4', collected: 680000, pending: 60000, overdue: 60000 },
    { month: 'Month 5', collected: 720000, pending: 50000, overdue: 65000 },
  ],
  predictionAnalytics: {
    nextMonthExpectedCollection: 780000,
    confidence: 0.92,
    potentialDefaults: 8,
  },
};

export const aiBulkNotifications = [
  {
    id: 1,
    type: 'Fee Reminder',
    template: 'Dear Parents, This is a reminder that the fee payment for [MONTH] is due by [DUE_DATE]. Please clear your dues to ensure your ward\'s admission is not affected.',
    recipients: 145,
    status: 'draft',
  },
  {
    id: 2,
    type: 'Attendance Alert',
    template: 'Dear [STUDENT_NAME], your attendance has dropped below 75%. Please ensure regular attendance as per school norms.',
    recipients: 78,
    status: 'draft',
  },
  {
    id: 3,
    type: 'Academic Performance',
    template: 'Dear [PARENT_NAME], [STUDENT_NAME] needs improvement in [SUBJECT]. Please encourage him/her to study diligently.',
    recipients: 120,
    status: 'draft',
  },
];

export const aiDecisionSupport = {
  underperformingClasses: [
    {
      class: '9-A',
      averagePercentage: 62,
      recommendation: 'Focus on foundational concepts. Consider remedial classes.',
      suggestedActions: ['Conduct weekly revision tests', 'Assign more practical work', 'Increase student-teacher interaction'],
    },
    {
      class: '10-B',
      averagePercentage: 68,
      recommendation: 'Improve in Mathematics. Assign extra problem sets.',
      suggestedActions: ['Hire tutor for math', 'Increase practice sessions', 'Use digital tools'],
    },
    {
      class: '8-C',
      averagePercentage: 71,
      recommendation: 'Moderate performance. Maintain current strategies.',
      suggestedActions: ['Continue current schedule', 'Monitor borderline students', 'Encourage participation'],
    },
  ],
};

export const aiScheduling = {
  timetableSuggestions: [
    {
      class: '10-A',
      suggestion: 'Schedule Science practicals on Tuesday/Thursday (Low attendance risk)',
      impact: 'Expected attendance improvement: 8-12%',
    },
    {
      class: '9-B',
      suggestion: 'Place Mathematics in morning (Student engagement higher)',
      impact: 'Expected performance improvement: 5-7%',
    },
  ],
  examPlanning: {
    suggestedSchedule: [
      { date: '2024-03-15', subject: 'Mathematics', classes: ['10-A', '10-B', '10-C'], duration: '3 hours' },
      { date: '2024-03-18', subject: 'English', classes: ['10-A', '10-B', '10-C'], duration: '2.5 hours' },
      { date: '2024-03-21', subject: 'Science', classes: ['10-A', '10-B', '10-C'], duration: '3 hours' },
    ],
    conflictResolution: 'No conflicts detected',
  },
};

export const sampleAIResponse = {
  query: 'Total attendance report ivvu',
  response: `📊 **Attendance Report Summary**

**Overall Statistics:**
- Total Students: 3,000
- Overall Attendance: 84.2%
- Average Classes: 245 days

**By Class:**
- Class 10: 87.3% (Excellent)
- Class 9: 84.1% (Good)
- Class 8: 81.5% (Fair)

**Recommendations:**
- Class 8 needs attendance improvement programs
- Recognize top 3 classes for good attendance
- Schedule parent-teacher meets for low attendance students`,
};
