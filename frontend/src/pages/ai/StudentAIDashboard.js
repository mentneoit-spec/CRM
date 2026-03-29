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
  Tab,
  Tabs,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import {
  SmartToy,
  TrendingUp,
  Book,
  Flag,
  School,
  Lightbulb,
  EmojiEvents,
  BarChart,
  MapOutlined,
  FolderOutlined,
  CheckCircleOutlined,
  Psychology,
  AutoAwesome,
  Close,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import AIChatbot from '../../components/ai/AIChatbot';
import AIPerformanceInsights from '../../components/ai/AIPerformanceInsights';
import AIStudyPlanner from '../../components/ai/AIStudyPlanner';
import StudentLayout from './../../pages/student/layout/StudentLayout';
import {
  studentChatQuestions,
  performanceInsights,
  aiStudyPlanner,
  weakAreaDetection,
  aiNotesGenerator,
  aiGoalTracker,
  personalAIChatbot,
} from '../../data/mockAIData/studentAIData';

const StudentAIDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentTab, setCurrentTab] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const TabContent = ({ value, index, children }) => (
    <Box hidden={value !== index} sx={{ width: '100%' }}>
      {value === index && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </Box>
  );

  const FeatureCard = ({ icon: Icon, title, description, color, onSelect }) => (
    <motion.div
      whileHover={{ transform: 'translateY(-12px)' }}
      transition={{ duration: 0.3 }}
      onClick={() => {
        setSelectedFeature(title);
        setModalOpen(true);
      }}
      style={{ cursor: 'pointer' }}
    >
      <Card
        sx={{
          background: `linear-gradient(135deg, #ffffff 0%, ${color}08 100%)`,
          border: `2px solid ${color}20`,
          borderRadius: 2.5,
          height: '100%',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `0 4px 16px ${color}15`,
          '&:hover': {
            boxShadow: `0 20px 40px ${color}40`,
            borderColor: `${color}40`,
            background: `linear-gradient(135deg, #ffffff 0%, ${color}15 100%)`,
          },
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 2.5,
            }}
          >
            <Box
              sx={{
                background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                borderRadius: '50%',
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 16px ${color}20`,
              }}
            >
              <Icon sx={{ fontSize: 44, color, transition: 'all 0.3s ease' }} />
            </Box>
          </Box>
          <Typography sx={{ fontWeight: 700, color: '#333', mb: 1, fontSize: 16 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Modal content for each feature
  const renderModalContent = () => {
    switch (selectedFeature) {
      case 'Performance Insights':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              📊 {performanceInsights.overallStats.name}'s Performance
            </Typography>
            <Paper sx={{ p: 2, mb: 2, background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)', borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="textSecondary">Current %</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                    {performanceInsights.overallStats.currentPercentage}%
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="textSecondary">Position</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {performanceInsights.overallStats.position}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="textSecondary">Trend</Typography>
                  <Chip label="📈 Improving" color="success" size="small" />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="textSecondary">Roll No</Typography>
                  <Typography variant="h6">{performanceInsights.overallStats.rollNo}</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>Subject-wise Performance:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {performanceInsights.subjectWisePerformance.map((item, idx) => (
                <Paper key={idx} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{item.subject}</Typography>
                    <Typography variant="caption" color="textSecondary">Score: {item.score}%</Typography>
                  </Box>
                  <Chip
                    label={`${item.trend === 'up' ? '📈' : item.trend === 'down' ? '📉' : '➡️'} ${item.lastMonth}%`}
                    size="small"
                    color={item.trend === 'up' ? 'success' : item.trend === 'down' ? 'error' : 'default'}
                  />
                </Paper>
              ))}
            </Box>

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 700 }}>AI Suggestions:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {performanceInsights.personalSuggestions.map((suggestion, idx) => (
                <Paper key={idx} sx={{ p: 2, background: '#43e97b10', borderLeft: '4px solid #43e97b' }}>
                  <Typography sx={{ fontSize: 13 }}>💡 {suggestion}</Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        );

      case 'Study Planner':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              📅 Your Personalized Study Schedule
            </Typography>
            {aiStudyPlanner?.dailySchedule?.map((day, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                <Paper sx={{ p: 2.5, mb: 2, border: '2px solid #667eea20', borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 700, color: '#667eea', mb: 1 }}>
                    {day.day}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {day.schedule.map((slot, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'start' }}>
                        <Box sx={{ background: '#667eea20', px: 1.5, py: 0.5, borderRadius: 1, minWidth: 60 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#667eea' }}>
                            {slot.time}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{slot.subject}</Typography>
                          <Typography variant="caption" color="textSecondary">{slot.topic}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </motion.div>
            ))}

            <Paper sx={{ p: 2, background: '#43e97b10', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#43e97b' }}>
                ✓ Study for 4-5 hours daily with 15-minute breaks
              </Typography>
            </Paper>
          </Box>
        );

      case 'Weak Area Detection':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              🎯 Your Weak Topics
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {weakAreaDetection?.subjectWiseWeakTopics?.map((item, idx) => (
                <Paper key={idx} sx={{ p: 2.5, border: '2px solid #ee5a6f20', borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 700, color: '#333', mb: 1.5 }}>
                    {item.subject}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: '#ee5a6f', fontSize: 12, mb: 1 }}>
                    📌 Weak Topics:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {item.weakTopics.map((topic, i) => (
                      <Chip key={i} label={topic} size="small" sx={{ background: '#ee5a6f20', color: '#ee5a6f' }} />
                    ))}
                  </Box>

                  <Typography sx={{ fontWeight: 600, color: '#43e97b', fontSize: 12, mb: 1 }}>
                    ✓ Strong Topics:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {item.strongTopics.map((topic, i) => (
                      <Chip key={i} label={topic} size="small" sx={{ background: '#43e97b20', color: '#43e97b' }} />
                    ))}
                  </Box>

                  <Paper sx={{ p: 1.5, background: '#667eea10', borderRadius: 1 }}>
                    <Typography sx={{ fontSize: 12, color: '#667eea', fontWeight: 600 }}>
                      💡 {item.recommendedAction}
                    </Typography>
                  </Paper>
                </Paper>
              ))}
            </Box>
          </Box>
        );

      case 'Notes Generator':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              📝 Generated Study Notes
            </Typography>
            {aiNotesGenerator?.noteSamples?.map((note, idx) => (
              <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.1 }}>
                <Card sx={{ mb: 2, border: '2px solid #764ba220', borderRadius: 2 }}>
                  <CardHeader title={note.topic} titleTypographyProps={{ sx: { fontWeight: 700, fontSize: 15 } }} />
                  <CardContent>
                    <Box sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 13, color: '#333' }}>
                      {note.content}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        );

      case 'Goal Tracker':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              🎯 Your Academic Goals
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {aiGoalTracker?.goalBreakdown?.map((goal, idx) => (
                <Paper key={idx} sx={{ p: 2.5, border: '2px solid #667eea20', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography sx={{ fontWeight: 700, color: '#333' }}>{goal.goal}</Typography>
                    <Chip label={`${goal.progress}% Progress`} size="small" sx={{ background: goal.progress > 60 ? '#43e97b20' : '#fa823120', color: goal.progress > 60 ? '#43e97b' : '#fa8231' }} />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ height: 8, background: '#e9ecef', borderRadius: 4, overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${goal.progress}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {goal.actions.map((action, i) => (
                      <Chip key={i} label={action} size="small" sx={{ background: '#667eea20', color: '#667eea' }} />
                    ))}
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        );

      case 'Doubt Resolution':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              💬 Ask Your Questions
            </Typography>
            <Typography sx={{ mb: 2, color: '#666', fontSize: 13 }}>
              Click "Ask Doubt" button at the top to start chatting with the AI. You can ask any question related to your studies!
            </Typography>
            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)', borderRadius: 2, textAlign: 'center' }}>
              <Lightbulb sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
              <Typography sx={{ fontWeight: 700, color: '#667eea' }}>
                Try asking about:
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                {['Concepts', 'Problems', 'Essays', 'Formulas'].map((topic) => (
                  <Chip key={topic} label={topic} sx={{ background: '#667eea20', color: '#667eea' }} />
                ))}
              </Box>
            </Paper>
          </Box>
        );

      default:
        return <Typography>Select a feature to continue</Typography>;
    }
  };

  return (
    <StudentLayout title="AI Assistant">
      <Box sx={{ mt: -3, mb: 4 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: isMobile ? 24 : 32, fontWeight: 700, color: '#333', mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Psychology sx={{ fontSize: 28, color: '#667eea' }} />
                Your AI Learning Companion
              </Typography>
              <Typography sx={{ color: '#666', fontSize: 14 }}>
                Personalized performance insights, study plans & exam prep
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<SmartToy />}
              onClick={() => setChatOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 700,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: 14,
                px: 3,
              }}
            >
              Ask Doubt
            </Button>
          </Box>
        </motion.div>

        {/* Feature Grid - NOW CLICKABLE */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard icon={TrendingUp} title="Performance Insights" description="Track your scores & see improvement trends" color="#667eea" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard icon={Book} title="Study Planner" description="AI-created personalized study schedule" color="#43e97b" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard icon={School} title="Weak Area Detection" description="Identify & focus on difficult topics" color="#fa8231" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard icon={Book} title="Notes Generator" description="Quick revision notes & summaries" color="#764ba2" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard icon={Flag} title="Goal Tracker" description="Set & monitor your academic goals" color="#ee5a6f" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard icon={Lightbulb} title="Doubt Resolution" description="Ask anything & get instant explanations" color="#667eea" />
          </Grid>
        </Grid>

        {/* Modal for Feature Details */}
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            {selectedFeature}
            <IconButton onClick={() => setModalOpen(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {renderModalContent()}
          </DialogContent>
        </Dialog>
      </Box>

      {/* Chatbot Drawer */}
      <AIChatbot open={chatOpen} onClose={() => setChatOpen(false)} title="Ask Your Doubt" suggestedQuestions={studentChatQuestions} role="student" />
    </StudentLayout>
  );
};

export default StudentAIDashboard;
