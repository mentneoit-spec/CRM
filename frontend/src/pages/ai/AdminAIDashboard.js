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
  LinearProgress,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  SmartToy,
  TrendingUp,
  Warning,
  Payment,
  NotificationsActive,
  Lightbulb,
  Schedule,
  BarChart,
  People,
  School,
  AttachMoney,
  WarningAmber,
  CheckCircle,
  Psychology,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import AIChatDrawer from '../../components/ai/AIChatDrawer';
import DashboardLayout from '../../components/DashboardLayout';

const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
  <motion.div
    whileHover={{ translateY: -8 }}
    transition={{ duration: 0.2 }}
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
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 16px ${color}20`,
            }}
          >
            <Icon sx={{ fontSize: 28, color, transition: 'all 0.3s ease' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 12, color: '#999', fontWeight: 600, mb: 0.5 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#333', mb: 0.3 }}>
              {value}
            </Typography>
            {subtext && (
              <Typography sx={{ fontSize: 11, color: '#666', fontWeight: 500 }}>
                {subtext}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

const AdminAIDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <DashboardLayout role="admin">
      <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', py: 4 }}>
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
                  <BarChart sx={{ fontSize: 32, color: '#667eea' }} />
                  <Typography sx={{ fontSize: isMobile ? 26 : 36, fontWeight: 800, color: '#1a1a2e' }}>
                    Analytics & Insights
                  </Typography>
                </Box>
                <Typography sx={{ color: '#555', fontSize: 14, fontWeight: 500 }}>
                  Institutional performance, student outcomes & resource optimization
                </Typography>
              </Box>
              <Button
                variant="contained"
                endIcon={<Psychology sx={{ fontSize: 20 }} />}
                onClick={() => setChatOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 700,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: 15,
                  py: 1.5,
                  px: 4,
                  boxShadow: '0 12px 32px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    boxShadow: '0 16px 48px rgba(102, 126, 234, 0.4)',
                  },
                }}
              >
                Ask AI
              </Button>
            </Box>
          </motion.div>

          {/* Key Metrics */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={People}
                label="Total Students"
                value="2,845"
                subtext="+12% this month"
                color="#667eea"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={TrendingUp}
                label="Avg Performance"
                value="84.5%"
                subtext="+3.2% improvement"
                color="#43e97b"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={WarningAmber}
                label="At-Risk Students"
                value="142"
                subtext="-8 from last month"
                color="#ff4757"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={AttachMoney}
                label="Fee Collection"
                value="94.2%"
                subtext="Rs.12.4L collected"
                color="#fa8231"
              />
            </Grid>
          </Grid>

          {/* Main Analytics Sections */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Class Performance */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '2px solid #667eea20',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  }}
                >
                  <CardHeader
                    title="Class Performance Overview"
                    avatar={<BarChart sx={{ fontSize: 28, color: '#667eea' }} />}
                    titleTypographyProps={{ sx: { fontWeight: 700, color: '#333', fontSize: 16 } }}
                    sx={{ pb: 2 }}
                  />
                  <CardContent>
                    {[
                      { class: '10-A Science', avg: 87, trend: '+5%', color: '#667eea' },
                      { class: '11-B Commerce', avg: 76, trend: '+2%', color: '#43e97b' },
                      { class: '12-A Arts', avg: 82, trend: '-1%', color: '#fa8231' },
                      { class: '9-C General', avg: 71, trend: '-3%', color: '#ff4757' },
                    ].map((item, idx) => (
                      <Box key={idx} sx={{ mb: 2.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1,
                          }}
                        >
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
                            {item.class}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: item.color,
                            }}
                          >
                            {item.avg}% {item.trend}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={item.avg}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            background: '#e9ecef',
                            '& .MuiLinearProgress-bar': {
                              background: item.color,
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Risk Detection */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '2px solid #ff475720',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  }}
                >
                  <CardHeader
                    title="Dropout Risk Alerts"
                    avatar={<WarningAmber sx={{ fontSize: 28, color: '#ff4757' }} />}
                    titleTypographyProps={{ sx: { fontWeight: 700, color: '#333', fontSize: 16 } }}
                    sx={{ pb: 2 }}
                  />
                  <CardContent>
                    {[
                      { name: 'Rahul Kumar', class: '10-A', risk: 'High', actions: ['Call Parents', 'Counseling'] },
                      { name: 'Priya Singh', class: '9-C', risk: 'Medium', actions: ['Extra Classes'] },
                      { name: 'Arjun Patel', class: '11-B', risk: 'High', actions: ['Mentor assigned'] },
                    ].map((item, idx) => (
                      <Paper key={idx} sx={{ p: 1.5, background: '#f8f9fa', mb: 1.5, border: '1px solid #e9ecef', borderRadius: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#333' }}>
                              {item.name}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: '#666', mt: 0.3 }}>
                              Class {item.class}
                            </Typography>
                          </Box>
                          <Chip
                            label={item.risk}
                            size="small"
                            sx={{
                              background: item.risk === 'High' ? '#ff475730' : '#fa823130',
                              color: item.risk === 'High' ? '#ff4757' : '#fa8231',
                              fontWeight: 700,
                              fontSize: 11,
                            }}
                          />
                        </Box>
                      </Paper>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          {/* Fee & Attendance */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '2px solid #43e97b20',
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  }}
                >
                  <CardHeader
                    title="Fee Collection Status"
                    avatar={<AttachMoney sx={{ fontSize: 28, color: '#43e97b' }} />}
                    titleTypographyProps={{ sx: { fontWeight: 700, color: '#333', fontSize: 16 } }}
                    sx={{ pb: 2 }}
                  />
                  <CardContent>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Collected</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#43e97b' }}>94.2%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={94.2} sx={{
                        height: 8,
                        borderRadius: 4,
                        background: '#e9ecef',
                        '& .MuiLinearProgress-bar': { background: '#43e97b', borderRadius: 4 },
                      }} />
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Paper sx={{ p: 2, background: '#43e97b15', borderRadius: 1.5 }}>
                        <Typography sx={{ fontSize: 11, color: '#666', mb: 0.5 }}>Collected</Typography>
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#43e97b' }}>Rs.12.4L</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, background: '#ff475715', borderRadius: 1.5 }}>
                        <Typography sx={{ fontSize: 11, color: '#666', mb: 0.5 }}>Pending</Typography>
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#ff4757' }}>Rs.0.74L</Typography>
                      </Paper>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '2px solid #667eea20',
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  }}
                >
                  <CardHeader
                    title="Attendance Analysis"
                    avatar={<CheckCircle sx={{ fontSize: 28, color: '#667eea' }} />}
                    titleTypographyProps={{ sx: { fontWeight: 700, color: '#333', fontSize: 16 } }}
                    sx={{ pb: 2 }}
                  />
                  <CardContent>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Overall</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#667eea' }}>88.6%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={88.6} sx={{
                        height: 8,
                        borderRadius: 4,
                        background: '#e9ecef',
                        '& .MuiLinearProgress-bar': { background: '#667eea', borderRadius: 4 },
                      }} />
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Paper sx={{ p: 2, background: '#667eea15', borderRadius: 1.5 }}>
                        <Typography sx={{ fontSize: 11, color: '#666', mb: 0.5 }}>Present</Typography>
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#667eea' }}>2,524</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, background: '#fa823115', borderRadius: 1.5 }}>
                        <Typography sx={{ fontSize: 11, color: '#666', mb: 0.5 }}>Absent</Typography>
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#fa8231' }}>321</Typography>
                      </Paper>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Right-Side Chat Drawer */}
      <AIChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        role="admin"
        suggestedQuestions={[
          'Which classes need improvement?',
          'Show me fee default alerts',
          'Generate attendance report',
          'Analyze student performance trends',
          'What are the dropout risk factors?',
          'Fee collection strategy recommendations',
        ]}
      />
    </DashboardLayout>
  );
};

export default AdminAIDashboard;
