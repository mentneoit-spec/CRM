// Mock data for Student AI Features

export const studentChatQuestions = [
  'What is Photosynthesis?',
  'How do I solve quadratic equations?',
  'Explain Newton\'s Laws',
  'Help me with my chemistry doubts',
  'Solve this word problem',
];

export const personalAIChatbot = {
  suggestedTopics: [
    'Photosynthesis',
    'Quadratic Equations',
    'Newton\'s Laws of Motion',
    'The French Revolution',
    'Trigonometry',
    'Shakespearean Literature',
  ],
  sampleAnswers: {
    'Photosynthesis': `
🌱 **Photosynthesis - What You Need to Know:**

**Simple Definition:** The process where plants use sunlight to make food

**The Chemical Equation:**
6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂
(Carbon dioxide + Water + Light = Glucose + Oxygen)

**Two Steps:**
1. **Light Reactions** - Happens in sunlight
   - Chlorophyll absorbs light energy
   - Water is split, releasing oxygen
   - Energy stored in ATP & NADPH

2. **Dark Reactions (Calvin Cycle)** - Uses the energy from step 1
   - CO₂ is converted to glucose
   - Doesn't need sunlight

**Why is it Important?**
- Creates oxygen ↔ We breathe
- Creates food ↔ We eat plants
- Basis of all food chains

**Practice Question:** Where does photosynthesis happen in a plant cell?
✏️ Answer: In the chloroplasts
    `,
    'Quadratic Equations': `
📐 **Solving Quadratic Equations - Easy Guide:**

**What is it?** An equation with x² (squared variable)
General form: ax² + bx + c = 0

**Three Methods to Solve:**

**1. Factorization Method:**
Example: x² + 5x + 6 = 0
- Find factors: (x + 2)(x + 3) = 0
- Solutions: x = -2 or x = -3

**2. Quadratic Formula:** (Most reliable)
x = [-b ± √(b² - 4ac)] / 2a
Example: 2x² - 7x + 3 = 0
- a = 2, b = -7, c = 3
- Calculate: x = (7 ± √(49-24))/4 = (7 ± 5)/4
- x = 3 or x = 0.5

**3. Completing the Square:**
- Move constant to right side
- Make perfect square on left
- Take square root of both sides

**Quick Tips:**
✓ Always check if it factors simply first
✓ The discriminant (b² - 4ac) tells you how many solutions
✓ When stuck, use the formula!
    `,
  },
};

export const performanceInsights = {
  overallScore: 78,
  trend: 'Improving ↑',
  subjectScores: [
    { subject: 'Mathematics', score: 82, grade: 'A' },
    { subject: 'English', score: 75, grade: 'B' },
    { subject: 'Science', score: 80, grade: 'A' },
    { subject: 'Social Studies', score: 76, grade: 'B' },
    { subject: 'Computer Science', score: 88, grade: 'A+' },
  ],
  classRank: 12,
  totalStudents: 45,
  monthlyTrend: [
    { month: 'Jan', percentage: 72 },
    { month: 'Feb', percentage: 74 },
    { month: 'Mar', percentage: 75 },
    { month: 'Apr', percentage: 76 },
    { month: 'May', percentage: 78 },
  ],
};

export const aiStudyPlanner = {
  dailySchedule: [
    {
      day: 'Monday',
      sessions: [
        { time: '4:00 PM', subject: 'Mathematics', topic: 'Algebra Revision' },
        { time: '5:30 PM', subject: 'Science', topic: 'Physics - Motion' },
        { time: '7:00 PM', subject: 'English', topic: 'Literature Reading' },
      ],
    },
    {
      day: 'Tuesday',
      sessions: [
        { time: '4:00 PM', subject: 'Science', topic: 'Chemistry Practicals' },
        { time: '5:30 PM', subject: 'Computer Science', topic: 'Python Coding' },
        { time: '7:00 PM', subject: 'Social Studies', topic: 'History Notes' },
      ],
    },
    {
      day: 'Wednesday',
      sessions: [
        { time: '4:00 PM', subject: 'Mathematics', topic: 'Geometry Practice' },
        { time: '5:30 PM', subject: 'English', topic: 'Grammar & Composition' },
        { time: '7:00 PM', subject: 'Biology', topic: 'Cell Structure' },
      ],
    },
    {
      day: 'Thursday',
      sessions: [
        { time: '4:00 PM', subject: 'Physics', topic: 'Waves & Sound' },
        { time: '5:30 PM', subject: 'Computer Science', topic: 'Data Structures' },
        { time: '7:00 PM', subject: 'Mathematics', topic: 'Trigonometry' },
      ],
    },
    {
      day: 'Friday',
      sessions: [
        { time: '4:00 PM', subject: 'Revision', topic: 'Weekly Mock Test' },
        { time: '5:30 PM', subject: 'Science', topic: 'Important Formulas' },
        { time: '7:00 PM', subject: 'General Study', topic: 'Any Weak Topic' },
      ],
    },
    {
      day: 'Saturday',
      sessions: [
        { time: '10:00 AM', subject: 'Mathematics', topic: 'Problem Solving' },
        { time: '12:00 PM', subject: 'Science', topic: 'Lab Practical' },
        { time: '3:00 PM', subject: 'Overall Revision', topic: 'Topics Review' },
      ],
    },
    {
      day: 'Sunday',
      sessions: [
        { time: '10:00 AM', subject: 'Rest Day', topic: 'Light Study Only' },
        { time: '4:00 PM', subject: 'Planning', topic: 'Plan for Next Week' },
        { time: '6:00 PM', subject: 'Hobby Time', topic: 'Sports/Games' },
      ],
    },
  ],
};

export const weakAreaDetection = {
  weakTopics: [
    { subject: 'Mathematics', topic: 'Trigonometry', reason: 'Score: 65% - Needs focused practice' },
    { subject: 'Science', topic: 'Organic Chemistry', reason: 'Score: 68% - Complex concepts' },
    { subject: 'English', topic: 'Grammar Rules', reason: 'Score: 70% - Tense confusion' },
  ],
  strongTopics: [
    { subject: 'Computer Science', topic: 'Python Basics' },
    { subject: 'Mathematics', topic: 'Algebra' },
    { subject: 'Science', topic: 'Biology' },
  ],
  recommendations: [
    'Practice trigonometry problems daily for 30 minutes',
    'Watch animated chemistry videos for better concept clarity',
    'Take grammar practice tests weekly',
    'Join peer study groups for difficult topics',
    'Solve previous year exam questions',
  ],
};

export const aiNotesGenerator = {
  notes: [
    {
      subject: 'Mathematics',
      topic: 'Quadratic Equations',
      keyPoints: [
        '• Standard form: ax² + bx + c = 0',
        '• Solving methods: Factorization, Formula, Completing Square',
        '• Quadratic Formula: x = [-b ± √(b²-4ac)] / 2a',
        '• Discriminant determines type of roots',
        '• Practice: Solve 10 questions daily',
      ],
    },
    {
      subject: 'Science',
      topic: 'Photosynthesis',
      keyPoints: [
        '• Location: In chloroplasts of plant cells',
        '• Equation: 6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂',
        '• Two stages: Light reactions & Dark reactions (Calvin Cycle)',
        '• Products: Glucose and Oxygen',
        '• Importance: Food production and oxygen release',
      ],
    },
    {
      subject: 'English',
      topic: 'Parts of Speech',
      keyPoints: [
        '• Noun: Person, place, thing, idea',
        '• Verb: Action or state of being',
        '• Adjective: Describes noun',
        '• Adverb: Describes verb, adjective, adverb',
        '• Practice: Identify POS in 5 sentences daily',
      ],
    },
    {
      subject: 'Computer Science',
      topic: 'Python Loops',
      keyPoints: [
        '• For loop: Iterate over sequence',
        '• While loop: Repeat until condition false',
        '• Break: Exit loop early',
        '• Continue: Skip to next iteration',
        '• Syntax: for/while + condition + colon',
      ],
    },
  ],
};

export const aiGoalTracker = {
  goals: [
    {
      goal: 'Achieve 85% in Mathematics',
      progress: 80,
      actionItems: ['Practice daily', 'Doubt solving', 'Weekly tests'],
    },
    {
      goal: 'Improve from Rank 12 to Top 10',
      progress: 50,
      actionItems: ['Score 80+ all subjects', 'Complete projects', 'Perfect attendance'],
    },
    {
      goal: 'Complete syllabus by April 30',
      progress: 75,
      actionItems: ['2 chapters/week', 'Revision notes', 'Practice problems'],
    },
    {
      goal: 'Score 90+ in Computer Science',
      progress: 95,
      actionItems: ['Practice coding', 'Project work', 'Final revisions'],
    },
  ],
};
