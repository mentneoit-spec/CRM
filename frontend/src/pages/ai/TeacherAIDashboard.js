import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Psychology,
  School,
  Edit,
  TrendingUp,
  People,
  CheckCircle,
  Message,
  MenuBook,
  Assessment,
  WarningAmber,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import AIChatDrawer from '../../components/ai/AIChatDrawer';
import DashboardLayout from '../../components/DashboardLayout';
import {
  LessonPlanGenerator,
  ExamQuestionGenerator,
  WeakStudentsIdentifier,
  MarksAnalysisViewer,
  ParentCommunicationComposer,
} from '../../components/ai/TeacherFeatures';

// Feature card component
const FeatureCard = ({ icon: Icon, title, description, buttons, color }) => (
  <motion.div
    whileHover={{ translateY: -4 }}
    transition={{ duration: 0.2 }}
  >
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
        border: `2px solid ${color}25`,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: `0 8px 24px ${color}15`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 16px 40px ${color}25`,
          borderColor: `${color}40`,
        },
      }}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              background: `linear-gradient(135deg, ${color}30 0%, ${color}15 100%)`,
              borderRadius: '50%',
              p: 1.2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 28, color }} />
          </Box>
        }
        title={
          <Typography sx={{ fontWeight: 700, color: '#1a1a2e', fontSize: 16 }}>
            {title}
          </Typography>
        }
        subheader={
          <Typography sx={{ fontSize: 12, color: '#666', mt: 0.5 }}>
            {description}
          </Typography>
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {buttons.map((btn, idx) => (
            <Button
              key={idx}
              onClick={btn.onClick}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: color,
                color: color,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: 12,
                py: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: `${color}15`,
                  borderColor: color,
                  transform: 'translateX(4px)',
                },
              }}
              endIcon={btn.icon}
            >
              {btn.label}
            </Button>
          ))}
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

const TeacherAIDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState('');
  
  // Feature dialog states
  const [lessonPlanOpen, setLessonPlanOpen] = useState(false);
  const [examGeneratorOpen, setExamGeneratorOpen] = useState(false);
  const [weakStudentsOpen, setWeakStudentsOpen] = useState(false);
  const [marksAnalysisOpen, setMarksAnalysisOpen] = useState(false);
  const [parentCommOpen, setParentCommOpen] = useState(false);

  const handleFeatureClick = (feature, subfeature) => {
    // Open dedicated feature dialog based on what was clicked
    if (feature === 'Teaching Assistant' && subfeature === 'Generate Lesson Plan') {
      setLessonPlanOpen(true);
    } else if (feature === 'Teaching Assistant' && subfeature === 'Topic Explanation') {
      setChatContext(`${feature} - ${subfeature}`);
      setChatOpen(true);
    } else if (feature === 'Question Generator') {
      setExamGeneratorOpen(true);
    } else if (feature === 'Class Insights' && subfeature === 'Identify Weak Students') {
      setWeakStudentsOpen(true);
    } else if (feature === 'Class Insights' && subfeature === 'Subject-wise Analysis') {
      setChatContext(`${feature} - ${subfeature}`);
      setChatOpen(true);
    } else if (feature === 'Auto Evaluation' && subfeature === 'Marks Analysis') {
      setMarksAnalysisOpen(true);
    } else if (feature === 'Auto Evaluation' && subfeature === 'Generate Feedback') {
      setChatContext(`${feature} - ${subfeature}`);
      setChatOpen(true);
    } else if (feature === 'Communication' && subfeature === 'Message to Parents') {
      setParentCommOpen(true);
    } else if (feature === 'Communication' && subfeature === 'Student Feedback') {
      setChatContext(`${feature} - ${subfeature}`);
      setChatOpen(true);
    }
  };

  const teacherChatQuestions = [
    'Generate a lesson plan for today',
    'Explain this physics concept',
    'Create exam questions on this topic',
    'Which students need extra help?',
    'Give me subject-wise analysis',
  ];

  const features = [
    {
      icon: MenuBook,
      title: '🧠 AI Teaching Assistant',
      description: 'Generate lesson plans & topic explanations',
      color: '#1e88e5',
      buttons: [
        {
          label: 'Generate Lesson Plan',
          icon: <Edit sx={{ fontSize: 16 }} />,
          onClick: () => handleFeatureClick('Teaching Assistant', 'Generate Lesson Plan'),
        },
        {
          label: 'Topic Explanation',
          icon: <MenuBook sx={{ fontSize: 16 }} />,
          onClick: () => handleFeatureClick('Teaching Assistant', 'Topic Explanation'),
        },
      ],
    },
    {
      icon: Assessment,
      title: '📝 AI Question Paper Generator',
      description: 'Create exams & assignments automatically',
      color: '#43a047',
      buttons: [
        {
          label: 'Generate Exam Questions',
          icon: <Edit sx={{ fontSize: 16 }} />,
          onClick: () => handleFeatureClick('Question Generator', 'Generate Exam Questions'),
        },
        {
          label: 'Create Assignment',
          icon: <MenuBook sx={{ fontSize: 16 }} />,
          onClick: () => handleFeatureClick('Question Generator', 'Create Assignment'),
        },
      ],
    },
    {
      icon: TrendingUp,
      title: '📊 AI Class Insights',
      description: 'Identify weak students & subject analysis',
      color: '#e53935',
      buttons: [
        {
          label: 'Identify Weak Students',
          icon: <WarningAmber sx={{ fontSize: 16 }} />,
          onClick: () => handleFeatureClick('Class Insights', 'Identify Weak Students'),
        },
        {
          label: 'Subject-wise Analysis',
          icon: <TrendingUp sx={{ fontSize: 16 }} />,
          onClick: () => handleFeatureClick('Class Insights', 'Subject-wise Analysis'),
        },
      ],
    },
    {
      icon: CheckCircle,
      title: '🧾 AI Auto Evaluation',
      description: 'Analyze marks & generate feedback',
      color: '#fb8c00',
      buttons: [
        {
          label: 'Marks Analysis',
          icon: <Assessment sx={{ fontSize: 16 }} />,
          onClick: () => handleFeatureClick('Auto Evaluation', 'Marks Analysis'),
        },
        {
          label: 'Generate Feedback',
          icon: <Message sx={{ fontSize: 16 }} />,
          onClick: () => handleFeatureClick('Auto Evaluation', 'Generate Feedback'),
        },
      ],
    },
    {
      icon: Message,
      title: '📩 AI Communication',
      description: 'Message parents & provide student feedback',
      color: '#8e24aa',
      buttons: [
        {
          label: 'Message to Parents',
          icon: <Message sx={{ fontSize: 16 }} />,
          onClick: () => handleFeatureClick('Communication', 'Message to Parents'),
        },
        {
          label: 'Student Feedback',
          icon: <People sx={{ fontSize: 16 }} />,
          onClick: () => handleFeatureClick('Communication', 'Student Feedback'),
        },
      ],
    },
  ];

  return (
    <DashboardLayout role="teacher">
      <Box
        sx={{
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <School sx={{ fontSize: 40, color: '#1565c0' }} />
                  <Typography sx={{ fontSize: isMobile ? 28 : 42, fontWeight: 800, color: '#0d47a1' }}>
                    Teaching Tools
                  </Typography>
                </Box>
                <Typography sx={{ color: '#1565c0', fontSize: 15, fontWeight: 500 }}>
                  Classroom management, insights & automation powered by AI
                </Typography>
              </Box>
              <Button
                variant="contained"
                endIcon={<Psychology sx={{ fontSize: 20 }} />}
                onClick={() => {
                  setChatContext('');
                  setChatOpen(true);
                }}
                sx={{
                  background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                  color: 'white',
                  fontWeight: 700,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: 15,
                  py: 1.5,
                  px: 4,
                  boxShadow: '0 12px 32px rgba(30, 136, 229, 0.3)',
                  '&:hover': {
                    boxShadow: '0 16px 48px rgba(30, 136, 229, 0.4)',
                  },
                }}
              >
                Ask AI
              </Button>
            </Box>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2.5,
                    background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)',
                    border: '2px solid #bbdefb',
                    borderRadius: 2.5,
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#1565c0' }}>
                    452
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#666', fontWeight: 600 }}>
                    Total Students
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2.5,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f3e5f5 100%)',
                    border: '2px solid #ce93d8',
                    borderRadius: 2.5,
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#8e24aa' }}>
                    2
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#666', fontWeight: 600 }}>
                    Active Classes
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2.5,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f1f8e9 100%)',
                    border: '2px solid #aed581',
                    borderRadius: 2.5,
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#43a047' }}>
                    93.4%
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#666', fontWeight: 600 }}>
                    Attendance
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2.5,
                    background: 'linear-gradient(135deg, #ffffff 0%, #ffe0b2 100%)',
                    border: '2px solid #ffb74d',
                    borderRadius: 2.5,
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: 32, fontWeight: 800, color: '#f57c00' }}>
                    8
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#666', fontWeight: 600 }}>
                    Need Support
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>

          {/* AI Features Grid */}
          <Grid container spacing={3}>
            {features.map((feature, idx) => (
              <Grid item xs={12} sm={6} lg={4} key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + idx * 0.05 }}
                >
                  <FeatureCard {...feature} />
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card
              sx={{
                mt: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f3e5f5 100%)',
                border: '2px solid #ce93d8',
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Psychology sx={{ fontSize: 32, color: '#8e24aa', mt: 0.5 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#1a1a2e', mb: 1 }}>
                      💡 Pro Tips for Teachers
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: '#555', lineHeight: 1.6, mb: 1 }}>
                      <strong>Click any feature above</strong> to activate AI assistance. Each tool is designed to save time and enhance your teaching effectiveness:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontSize: 12, color: '#666' }}>
                        ✨ Teaching Assistant helps create structured lesson plans
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#666' }}>
                        📋 Question Generator creates varied exam papers instantly
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#666' }}>
                        📊 Class Insights identifies struggling students early
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#666' }}>
                        ✅ Auto Evaluation analyzes performance & generates feedback
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#666' }}>
                        💬 Communication tool sends personalized messages to parents
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Box>

      {/* Feature Dialogs */}
      <LessonPlanGenerator open={lessonPlanOpen} onClose={() => setLessonPlanOpen(false)} />
      <ExamQuestionGenerator open={examGeneratorOpen} onClose={() => setExamGeneratorOpen(false)} />
      <WeakStudentsIdentifier open={weakStudentsOpen} onClose={() => setWeakStudentsOpen(false)} />
      <MarksAnalysisViewer open={marksAnalysisOpen} onClose={() => setMarksAnalysisOpen(false)} />
      <ParentCommunicationComposer open={parentCommOpen} onClose={() => setParentCommOpen(false)} />

      {/* AI Chat Drawer */}
      <AIChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        role="teacher"
        context={chatContext}
        suggestedQuestions={teacherChatQuestions}
      />
    </DashboardLayout>
  );
};

export default TeacherAIDashboard;
