import React, { useState } from 'react';
import {
  Drawer,
  Box,
  TextField,
  IconButton,
  Typography,
  Divider,
  Paper,
  Avatar,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close,
  Send,
  Psychology,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

// Chart Components
const ClassPerformanceChart = () => {
  const data = [
    { class: '10-A', performance: 87, attendance: 94 },
    { class: '10-B', performance: 76, attendance: 88 },
    { class: '11-A', performance: 82, attendance: 91 },
    { class: '11-B', performance: 79, attendance: 85 },
    { class: '12-A', performance: 88, attendance: 96 },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="class" stroke="#999" />
        <YAxis stroke="#999" />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey="performance" fill="#667eea" radius={[8, 8, 0, 0]} />
        <Line type="monotone" dataKey="attendance" stroke="#43e97b" dot={{ r: 4 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

const FeeCollectionChart = () => {
  const data = [
    { name: 'Collected', value: 94.2, fill: '#43e97b' },
    { name: 'Pending', value: 5.8, fill: '#ff4757' },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}%`} />
      </PieChart>
    </ResponsiveContainer>
  );
};

const StudentPerformanceTrendChart = () => {
  const data = [
    { month: 'Jan', avg: 72 },
    { month: 'Feb', avg: 75 },
    { month: 'Mar', avg: 78 },
    { month: 'Apr', avg: 82 },
    { month: 'May', avg: 84 },
    { month: 'Jun', avg: 85 },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="month" stroke="#999" />
        <YAxis stroke="#999" />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
          }}
        />
        <Line
          type="monotone"
          dataKey="avg"
          stroke="#667eea"
          strokeWidth={3}
          dot={{ fill: '#667eea', r: 5 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const AttendanceChart = () => {
  const data = [
    { class: '10-A', present: 92, absent: 8 },
    { class: '10-B', present: 88, absent: 12 },
    { class: '11-A', present: 91, absent: 9 },
    { class: '12-A', present: 96, absent: 4 },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis type="number" stroke="#999" />
        <YAxis dataKey="class" type="category" stroke="#999" />
        <Tooltip />
        <Legend />
        <Bar dataKey="present" fill="#43e97b" radius={[0, 8, 8, 0]} />
        <Bar dataKey="absent" fill="#ff4757" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Get chart based on question
const getChartResponse = (question, context, role) => {
  const q = question.toLowerCase();
  const ctx = context.toLowerCase();

  // Teacher-specific responses
  if (role === 'teacher') {
    if (ctx.includes('lesson plan')) {
      return {
        text: '📚 Lesson Plan Generated:\n\n✓ Topic: Algebra - Linear Equations\n✓ Duration: 45 mins\n✓ Learning Objectives:\n  • Understand linear equations\n  • Solve for x\n  • Real-world applications\n\n✓ Activities: Introduction (5 min), Direct Teaching (15 min), Problem-solving (20 min), Review (5 min)\n\n✓ Resources: Textbook Ch. 5, Worksheet Set A',
      };
    }
    if (ctx.includes('topic explanation')) {
      return {
        text: '💡 Topic Explanation: Photosynthesis\n\nPhotosynthesis is the process by which plants convert light energy into chemical energy. It occurs in two stages:\n\n🔹 Light-dependent reactions (occur in thylakoids):\n• Chlorophyll absorbs light energy\n• Water molecules split (photolysis)\n• Produces ATP and NADPH\n\n🔹 Light-independent reactions (Calvin cycle, occur in stroma):\n• Uses ATP and NADPH from light reactions\n• CO₂ is converted to glucose\n• Energy stored in chemical bonds\n\nKey Formula: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂',
      };
    }
    if (ctx.includes('exam')) {
      return {
        text: '📝 Question Paper Generated (Biology - Semester 2)\n\nPart A (1 mark x 5):\n1. Define photosynthesis\n2. Name the pigment in chloroplasts\n3. What is the reactant in cellular respiration?\n4. Which organisms are autotrophic?\n5. Where does Krebs cycle occur?\n\nPart B (3 marks x 5):\n6. Explain the stages of photosynthesis\n7. Compare aerobic and anaerobic respiration\n8. Describe the electron transport chain\n...\n\nPart C (5 marks x 3):\n... (Full paper generated with answers key)',
      };
    }
    if (ctx.includes('weak')) {
      return {
        text: '⚠️ Weak Students Identified:\n\n🔴 HIGH PRIORITY:\n• Rajesh Kumar (10-A) - Avg: 42%, Weak in: Math, Physics\n• Priya Singh (10-B) - Avg: 48%, Weak in: English, Math\n\n🟡 MEDIUM PRIORITY:\n• Arjun Patel (10-A) - Avg: 58%, Weak in: Science\n• Sneha Reddy (10-B) - Avg: 62%, Weak in: Math\n\n✅ RECOMMENDED ACTIONS:\n• Schedule 1:1 tutoring sessions\n• Conduct concept review classes\n• Practice problem-solving worksheets\n• Parent communication scheduled',
      };
    }
    if (ctx.includes('subject-wise')) {
      return {
        text: '📊 Subject-wise Performance Analysis:\n\n📕 English:\n• Class Average: 76%\n• Highest: 94% | Lowest: 38%\n• Strong: Writing & Literature\n• Weak: Grammar & Comprehension\n\n📗 Mathematics:\n• Class Average: 68%\n• Highest: 92% | Lowest: 32%\n• Strong: Algebra\n• Weak: Geometry & Trigonometry\n\n📙 Science:\n• Class Average: 82%\n• Highest: 96% | Lowest: 55%\n• Strong: Biology\n• Weak: Chemistry practical applications\n\n📓 Social Studies:\n• Class Average: 79%\n• Highest: 89% | Lowest: 62%\n• Strong: History\n• Weak: Geography mapping skills',
      };
    }
    if (ctx.includes('marks') || ctx.includes('auto evaluation')) {
      return {
        text: '✅ Marks Analysis Summary:\n\n📈 Class Performance Trend:\n• Avg (Last exam): 72%\n• Avg (This exam): 78%\n• Improvement: +6%\n• Pass rate: 96% (up from 92%)\n\n🏆 Top Performers:\n1. Aisha Khan - 94%\n2. Rohan Singh - 91%\n3. Priya Sharma - 89%\n\n📉 Performance Distribution:\n• 80-100%: 24 students\n• 60-80%: 18 students\n• 40-60%: 7 students\n• Below 40%: 3 students\n\n💡 Recommendations:\n• Conduct remedial sessions\n• Peer tutoring program\n• Parent-teacher meetings',
      };
    }
    if (ctx.includes('feedback')) {
      return {
        text: '📝 Auto-Generated Feedback Sample:\n\n🎓 STUDENT: Rajesh Kumar\n📊 PERFORMANCE: 58/100 (58%)\n\n✅ Strengths:\n• Good conceptual understanding of basic principles\n• Participates actively in class discussions\n• Submits assignments on time\n\n⚠️ Areas for Improvement:\n• Problem-solving speed needs work\n• Requires more practice with numerical questions\n• Time management in exams needs attention\n\n💡 Recommendations:\n• Practice 5-10 problems daily\n• Join extra study sessions after school\n• Discuss doubts with teacher during office hours\n\n🎯 Target: 70% in next exam',
      };
    }
    if (ctx.includes('parent')) {
      return {
        text: "📩 Parent Communication Template Generated:\n\n---\nSubject: Monthly Progress Update - Rajesh Kumar\n\nDear Mr. & Mrs. Kumar,\n\nI hope this message finds you well. I'm writing to update you on Rajesh's academic progress this month.\n\n📊 Current Performance:\n• Math: 58% (Down 5% from last month)\n• Science: 62% (Up 3%)\n• English: 65% (Stable)\n• Overall Average: 61%\n\n✅ Positive Points:\n• Attendance: 94% (Excellent)\n• Class participation: Good\n• Assignment submission: On time\n\n⚠️ Areas of Concern:\n• Math problem-solving needs improvement\n• Requires more focus during lectures\n\n💡 Recommendations:\n• Extra math tutoring sessions started\n• Daily 30-min study mandate at home\n• Weekly check-in calls scheduled\n\nBest regards,\nMrs. Teaching Assistant\n---",
      };
    }
    if (ctx.includes('student feedback')) {
      return {
        text: "💬 Personalized Student Feedback Messages:\n\nGenerated 45 feedback messages for class 10-A:\n\n✅ Message 1 (Aisha Khan):\n\"Excellent work, Aisha! Your dedication shows in your 94% score. Keep this momentum going!\"\n\n✅ Message 2 (Rohan Singh):\n\"Great effort, Rohan! You've improved from 78% to 91%. Your hard work is paying off!\"\n\n⚠️ Message 3 (Rajesh Kumar):\n\"Rajesh, I can see you're trying. Let's work together to improve your score from 58% to 70%. Visit my office tomorrow?\"\n\n🎓 Feedback Strategy:\n• Positive reinforcement for top performers\n• Constructive feedback for average students\n• Motivational & actionable feedback for struggling students\n\nAll messages ready to send! ✓",
      };
    }
  }

  // Admin-specific responses
  if (role === 'admin') {
    if (q.includes('class') && (q.includes('improvement') || q.includes('performance'))) {
      return {
        text: '📊 Here are the class performance metrics. 10-A Science and 12-A Arts are performing well with 87-88% average. 10-B Commerce needs attention with 76% average. Attendance rates are strong across the board, indicating good student engagement.',
        chart: <ClassPerformanceChart />,
      };
    }

    if (q.includes('fee') || q.includes('collection')) {
      return {
        text: '💰 Fee collection status is excellent at 94.2% this month. Only 5.8% of fees remain pending, totaling Rs. 0.74L. This represents a strong month with minimal defaults. Schools in the "A" district are leading with 97% collection rates.',
        chart: <FeeCollectionChart />,
      };
    }

    if (q.includes('trend') || (q.includes('improvement') && q.includes('performance'))) {
      return {
        text: '📈 Student performance shows a positive trend over the past 6 months, with average scores improving from 72% (Jan) to 85% (Jun). This indicates effective teaching methodologies and increased student focus leading to exams.',
        chart: <StudentPerformanceTrendChart />,
      };
    }

    if (q.includes('attendance')) {
      return {
        text: '✅ Attendance analysis shows strong attendance across all classes. Class 12-A leads with 96% attendance, while Class 10-B has 88%. The institute average stands at 91%, well above the target of 85%.',
        chart: <AttendanceChart />,
      };
    }
  }

  return null;
};

const AIChatDrawer = ({ open, onClose, role = 'admin', context = '', suggestedQuestions = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: context
        ? `I'm ready to help with: ${context}. What would you like me to do?`
        : `Hello! I'm your AI assistant. I'm here to help you with ${
            role === 'admin'
              ? 'institutional insights and analytics'
              : role === 'teacher'
              ? 'teaching strategies and student insights'
              : 'personalized learning support'
          }. What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const drawerWidth = isMobile ? '100%' : '30%';

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    setTimeout(() => {
      const chartResponse = getChartResponse(inputValue, context, role);

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: chartResponse?.text || `Analyzing your query: "${inputValue}"... Based on current data, this would show detailed insights. Connect to backend API for real data.`,
        chart: chartResponse?.chart || null,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1200);
  };

  const handleSuggestedQuestion = (question) => {
    setInputValue(question);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderLeft: '2px solid #e9ecef',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.08)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              background: 'rgba(255,255,255,0.2)',
              width: 40,
              height: 40,
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            <Psychology sx={{ fontSize: 22 }} />
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>AI Assistant</Typography>
            <Typography sx={{ fontSize: 11, opacity: 0.8 }}>Online & Ready</Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            '&:hover': { background: 'rgba(255,255,255,0.1)' },
          }}
        >
          <Close />
        </IconButton>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {messages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                gap: 1,
              }}
            >
              {msg.type === 'bot' && (
                <Avatar
                  sx={{
                    background: '#667eea20',
                    width: 32,
                    height: 32,
                    marginTop: 0.5,
                  }}
                >
                  <Psychology sx={{ fontSize: 18, color: '#667eea' }} />
                </Avatar>
              )}
              <Box sx={{ maxWidth: '85%' }}>
                <Paper
                  sx={{
                    p: 1.5,
                    borderRadius: msg.type === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    background: msg.type === 'user'
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : '#f0f0f0',
                    color: msg.type === 'user' ? 'white' : '#333',
                  }}
                >
                  <Typography sx={{ fontSize: 12, lineHeight: 1.5 }}>
                    {msg.text}
                  </Typography>
                </Paper>
                {msg.chart && (
                  <Box sx={{ mt: 1.5, background: 'white', p: 1, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    {msg.chart}
                  </Box>
                )}
              </Box>
            </Box>
          </motion.div>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Avatar
              sx={{
                background: '#667eea20',
                width: 32,
                height: 32,
              }}
            >
              <Psychology sx={{ fontSize: 18, color: '#667eea' }} />
            </Avatar>
            <CircularProgress size={16} sx={{ color: '#667eea' }} />
          </Box>
        )}
      </Box>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && messages.length === 1 && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ px: 2, pb: 1.5 }}>
            <Typography sx={{ fontSize: 11, color: '#999', fontWeight: 600, mb: 1 }}>
              SUGGESTED QUESTIONS
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {suggestedQuestions.slice(0, 3).map((q, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleSuggestedQuestion(q)}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    color: '#667eea',
                    background: '#667eea10',
                    border: '1px solid #667eea20',
                    borderRadius: 1.5,
                    py: 0.75,
                    px: 1,
                    fontSize: 11,
                    textTransform: 'none',
                    '&:hover': {
                      background: '#667eea20',
                      borderColor: '#667eea40',
                    },
                  }}
                >
                  {q}
                </Button>
              ))}
            </Box>
          </Box>
        </>
      )}

      {/* Input Area */}
      <Box
        sx={{
          borderTop: '2px solid #e9ecef',
          p: 2,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask me anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                background: 'white',
                '&:hover': {
                  '& fieldset': { borderColor: '#667eea' },
                },
              },
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={isLoading}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 2,
              '&:hover': {
                boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
              },
            }}
          >
            <Send sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AIChatDrawer;
