// Mock data for Teacher AI Features

export const teacherChatQuestions = [
  'Generate lesson plan for Chapter 5',
  'Explain Photosynthesis in simple terms',
  'Create assignment for Algebra',
  'Analyze class performance',
  'Weak students in my class',
];

export const aiTeachingAssistant = {
  lessonPlans: [
    {
      id: 1,
      chapter: 'Photosynthesis',
      duration: '6 classes',
      topics: ['Process overview', 'Light-dependent reactions', 'Light-independent reactions', 'Importance'],
      activities: ['Video demonstration', 'Practical experiment', 'Group discussion', 'Quiz'],
      resources: ['Video link', 'Diagrams', 'Experiment kit', 'Worksheets'],
    },
    {
      id: 2,
      chapter: 'Algebra - Linear Equations',
      duration: '4 classes',
      topics: ['One variable equations', 'Two variable equations', 'Graphical representation', 'Real-world applications'],
      activities: ['Problem solving', 'Interactive graph tool', 'Group projects'],
      resources: ['Textbook reference', 'Online calculator', 'Problem sets'],
    },
  ],
  topicExplanations: {
    'Photosynthesis': `
      🌱 **Photosynthesis Simplified:**
      
      **What is it?** The process by which plants convert sunlight into chemical energy.
      
      **Simple Equation:** 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂
      
      **Where it happens:** In the chloroplasts of plant cells
      
      **Two Main Stages:**
      1. **Light Reactions** - Uses sunlight to create ATP and NADPH
      2. **Dark Reactions** - Uses ATP/NADPH to fix CO₂ into glucose
      
      **Why it matters:** It produces oxygen we breathe and glucose for plant energy
    `,
    'Algebra': `
      📐 **Learning Algebra Step by Step:**
      
      **Basic Concepts:**
      - Variables are unknowns (usually x, y, z)
      - Equations show relationships between numbers
      - Goal: Isolate the variable
      
      **Solving Linear Equations:**
      Example: 2x + 5 = 13
      Step 1: 2x = 13 - 5 → 2x = 8
      Step 2: x = 8 ÷ 2 → x = 4
      
      **Key Rules:**
      - Whatever you do to one side, do to the other
      - Simplify before solving
      - Check your answer
    `,
  },
};

export const aiQuestionGenerator = {
  examQuestions: [
    {
      id: 1,
      subject: 'Biology',
      topic: 'Photosynthesis',
      difficulty: 'Medium',
      question: 'Explain the role of chlorophyll in photosynthesis.',
      marks: 5,
    },
    {
      id: 2,
      subject: 'Biology',
      topic: 'Photosynthesis',
      difficulty: 'Hard',
      question: 'Compare light-dependent and light-independent reactions in photosynthesis.',
      marks: 8,
    },
    {
      id: 3,
      subject: 'Biology',
      topic: 'Photosynthesis',
      difficulty: 'Easy',
      question: 'Name the products of photosynthesis.',
      marks: 2,
    },
  ],
  assignmentQuestions: [
    {
      id: 1,
      subject: 'Mathematics',
      topic: 'Quadratic Equations',
      difficulty: 'Easy',
      question: 'Solve: x² + 5x + 6 = 0',
      marks: 3,
      hint: 'Use factorization method',
    },
    {
      id: 2,
      subject: 'Mathematics',
      topic: 'Quadratic Equations',
      difficulty: 'Medium',
      question: 'Find the roots of 2x² - 7x + 3 = 0 using quadratic formula',
      marks: 5,
    },
  ],
};

export const aiClassInsights = {
  weakStudents: [
    { id: 101, name: 'Rajesh Kumar', percentage: 52, weakSubjects: ['Mathematics', 'Science'], attendanceIssue: true },
    { id: 102, name: 'Anil Singh', percentage: 58, weakSubjects: ['English', 'Science'], attendanceIssue: false },
    { id: 103, name: 'Priya Verma', percentage: 61, weakSubjects: ['Mathematics'], attendanceIssue: false },
  ],
  subjectAnalysis: [
    { subject: 'Mathematics', avgScore: 72, classAvg: 75, topicWeak: 'Geometry', studentAffected: 12 },
    { subject: 'English', avgScore: 78, classAvg: 80, topicWeak: 'Poetry', studentAffected: 8 },
    { subject: 'Science', avgScore: 75, classAvg: 78, topicWeak: 'Chemistry', studentAffected: 10 },
  ],
  overallAnalysis: {
    classAverage: 75.8,
    topper: 'Neha Yadav (95%)',
    bottomPerformer: 'Rajesh Kumar (52%)',
    classStrength: 'Strong in Languages',
    classWeakness: 'Weak in Mathematics',
  },
};

export const aiAutoEvaluation = {
  marksAnalysis: {
    averageMarks: 75.4,
    distribution: [
      { range: '90-100', count: 5, percentage: 5 },
      { range: '80-89', count: 20, percentage: 20 },
      { range: '70-79', count: 35, percentage: 35 },
      { range: '60-69', count: 25, percentage: 25 },
      { range: 'Below 60', count: 15, percentage: 15 },
    ],
    trend: 'Improving',
  },
  feedbackGeneration: [
    {
      studentId: 101,
      studentName: 'Rajesh Kumar',
      feedback: `Strong effort in Problem Solving. Work on Time Management. Your Mathematics skills are developing - keep practicing. 💪`,
      suggestions: ['Practice more word problems', 'Attend extra classes', 'Form study group'],
    },
    {
      studentId: 102,
      studentName: 'Neha Yadav',
      feedback: `Excellent work! Outstanding performance across all topics. Your analytical thinking is impressive. 🌟 Keep it up!`,
      suggestions: ['Mentor classmates', 'Participate in advanced projects'],
    },
  ],
};

export const aiCommunication = {
  messageTemplates: [
    {
      type: 'Parent Message',
      template: 'Dear [PARENT_NAME], [STUDENT_NAME] has shown [PROGRESS/CONCERN] in [SUBJECT]. [SPECIFIC_FEEDBACK]. Please contact me if you need to discuss further.',
    },
    {
      type: 'Student Feedback',
      template: '[STUDENT_NAME], Great work on [TOPIC]! You can improve in [AREA]. Focus on [SUGGESTION]. Keep it up! 👍',
    },
  ],
  suggestedMessages: {
    toParents: [
      'Congratulations! Your ward is among the top performers in the class.',
      'We need to discuss your ward\'s attendance and academic progress.',
      'Your ward participated excellently in the recent project.',
    ],
    toStudents: [
      'Outstanding performance in the recent exam! Keep up the excellent work.',
      'Your attendance needs improvement. Please ensure regular attendance.',
      'Great effort in the practical assignment!',
    ],
  },
};
