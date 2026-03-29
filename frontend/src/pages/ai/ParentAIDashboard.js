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
  Alert,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import {
  SmartToy,
  TrendingUp,
  Warning,
  Message,
  EmojiEvents,
  AttachMoney,
  Close,
  Psychology,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import AIChatbot from '../../components/ai/AIChatbot';
import {
  parentChatQuestions,
  childPerformanceAI,
  aiAlerts,
  aiMessageSystem,
  aiSuggestions,
  parentChatbot,
} from '../../data/mockAIData/parentAIData';
import DashboardLayout from '../../components/DashboardLayout';

const ParentAIDashboard = () => {
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

  const FeatureCard = ({ icon: Icon, title, description, color }) => (
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
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
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
      case 'Performance Summary':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              📊 {childPerformanceAI.childProfile.name}'s Performance
            </Typography>
            <Paper sx={{ p: 2.5, mb: 3, background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="textSecondary">Class</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {childPerformanceAI.childProfile.class}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="textSecondary">Roll No</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {childPerformanceAI.childProfile.rollNo}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="textSecondary">Average %</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                    {childPerformanceAI.marksSummary.currentPercentage}%
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>📚 Subject-wise Performance:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {childPerformanceAI.subjectWiseMarks.map((subject, idx) => (
                <Paper key={idx} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{subject.subject}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={`Score: ${subject.marks}`} size="small" />
                      <Chip label={`Grade: ${subject.grade}`} size="small" sx={{ background: '#667eea20', color: '#667eea' }} />
                    </Box>
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: subject.trend === 'up' ? '#43e97b' : '#ee5a6f' }}>
                    {subject.trend === 'up' ? '📈' : '📉'} {subject.lastMonth}%
                  </Typography>
                </Paper>
              ))}
            </Box>

            <Paper sx={{ p: 2, mt: 2, background: '#43e97b10', borderLeft: '4px solid #43e97b' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#43e97b' }}>
                ✓ Overall: {childPerformanceAI.attendanceSummary.percentage}% attendance
              </Typography>
            </Paper>
          </Box>
        );

      case 'Smart Alerts':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              ⚠️ Important Alerts for {childPerformanceAI.childProfile.name}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {aiAlerts.alerts.map((alert, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                  <Alert severity={alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'} sx={{ mb: 0 }}>
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{alert.title}</Typography>
                    <Typography sx={{ fontSize: 13 }}>{alert.description}</Typography>
                    {alert.actionRequired && (
                      <Typography sx={{ fontSize: 12, mt: 1, fontWeight: 600 }}>
                        ⚡ Action: {alert.actionRequired}
                      </Typography>
                    )}
                  </Alert>
                </motion.div>
              ))}
            </Box>

            <Paper sx={{ p: 2, mt: 2, background: '#667eea10', borderRadius: 2 }}>
              <Typography sx={{ fontSize: 12, color: '#667eea', fontWeight: 600 }}>
                💡 We analyze attendance, marks, and behavior to alert you early. Take action now!
              </Typography>
            </Paper>
          </Box>
        );

      case 'AI Messages':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              📨 AI-Generated Personalized Messages
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {aiMessageSystem.messages.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.1 }}>
                  <Paper sx={{ p: 2.5, background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)', borderRadius: 2, borderLeft: '4px solid #667eea' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontWeight: 700, color: '#333' }}>{msg.subject}</Typography>
                      <Chip label={msg.date} size="small" variant="outlined" />
                    </Box>
                    <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: '#555' }}>{msg.message}</Typography>
                    {msg.suggestedAction && (
                      <Paper sx={{ p: 1.5, mt: 1.5, background: '#43e97b10', borderRadius: 1 }}>
                        <Typography sx={{ fontSize: 12, color: '#43e97b', fontWeight: 600 }}>
                          ✓ Suggestion: {msg.suggestedAction}
                        </Typography>
                      </Paper>
                    )}
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </Box>
        );

      case 'Suggestions':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              💡 AI Suggestions to Help Your Child
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {aiSuggestions.suggestions.map((suggestion, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                  <Card sx={{ border: `2px solid ${suggestion.category === 'Academic' ? '#667eea' : suggestion.category === 'Behavioral' ? '#fa8231' : '#43e97b'}20`, borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontWeight: 700, color: '#333' }}>
                          {suggestion.category === 'Academic' ? '📚' : suggestion.category === 'Behavioral' ? '🎯' : '⚡'} {suggestion.title}
                        </Typography>
                        <Chip label={suggestion.category} size="small" sx={{ fontWeight: 600 }} />
                      </Box>
                      <Typography sx={{ fontSize: 13, mb: 1.5, lineHeight: 1.6 }}>
                        {suggestion.description}
                      </Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#667eea', mb: 1 }}>
                        💡 How to Help:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        {suggestion.actionItems.map((item, i) => (
                          <Typography key={i} sx={{ fontSize: 12, color: '#555' }}>
                            ✓ {item}
                          </Typography>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Box>
        );

      case 'Parent Chatbot':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              💬 Ask Questions About Your Child
            </Typography>
            <Typography sx={{ mb: 2, color: '#666', fontSize: 13 }}>
              Click the "Ask AI" button at the top to open the chat. Ask anything about:
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {parentChatbot.suggestedTopics.map((topic, idx) => (
                <Grid item xs={6} key={idx}>
                  <Paper sx={{ p: 1.5, textAlign: 'center', background: '#667eea10', borderRadius: 1, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { background: '#667eea20' } }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#667eea' }}>
                      {topic}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>Sample Questions You Can Ask:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {parentChatbot.sampleQuestions.slice(0, 3).map((question, idx) => (
                <Paper key={idx} sx={{ p: 1.5, background: '#f8f9fa', borderLeft: '4px solid #667eea', borderRadius: 1 }}>
                  <Typography sx={{ fontSize: 12, fontStyle: 'italic', color: '#666' }}>
                    ❓ "{question}"
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        );

      case 'Fee Insights':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              💰 Fee & Payment Information
            </Typography>
            <Paper sx={{ p: 2.5, mb: 2, background: 'linear-gradient(135deg, #ee5a6f20 0%, #fa823120 100%)', borderRadius: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>Current Fee Status</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Total Due</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#ee5a6f' }}>₹{childPerformanceAI.feeStatus.totalDue}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Due Date</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{childPerformanceAI.feeStatus.dueDate}</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Typography sx={{ fontWeight: 700, mb: 1 }}>Payment History:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {childPerformanceAI.paymentHistory.map((payment, idx) => (
                <Paper key={idx} sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{payment.description}</Typography>
                    <Typography variant="caption" color="textSecondary">{payment.date}</Typography>
                  </Box>
                  <Chip label={`₹${payment.amount}`} sx={{ background: '#43e97b20', color: '#43e97b', fontWeight: 700 }} />
                </Paper>
              ))}
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              💡 Set up automatic payments to avoid missing deadlines!
            </Alert>
          </Box>
        );

      default:
        return <Typography>Select a feature to view details</Typography>;
    }
  };

  return (
    <DashboardLayout role="parent">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: isMobile ? 24 : 32, fontWeight: 700, color: '#333', mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Psychology sx={{ fontSize: 28, color: '#667eea' }} />
                Your Child's AI Dashboard
              </Typography>
              <Typography sx={{ color: '#666', fontSize: 14 }}>
                Monitor progress, get alerts, and personalized improvement suggestions
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
              Ask AI
            </Button>
          </Box>
        </motion.div>

        {/* Feature Grid - NOW FULLY CLICKABLE */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard icon={TrendingUp} title="Performance Summary" description="Marks & attendance at a glance" color="#667eea" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard icon={Warning} title="Smart Alerts" description="Get notified of concerns early" color="#ff4757" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard icon={Message} title="AI Messages" description="Personalized updates & insights" color="#43e97b" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard icon={EmojiEvents} title="Suggestions" description="How to help your child improve" color="#fa8231" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard icon={SmartToy} title="Parent Chatbot" description="Ask anything about your child" color="#764ba2" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard icon={AttachMoney} title="Fee Insights" description="Payment status & reminders" color="#ee5a6f" />
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
      </Container>

      {/* Chatbot */}
      <AIChatbot open={chatOpen} onClose={() => setChatOpen(false)} title="Parent Assistant" suggestedQuestions={parentChatQuestions} role="parent" />
    </DashboardLayout>
  );
};

export default ParentAIDashboard;
