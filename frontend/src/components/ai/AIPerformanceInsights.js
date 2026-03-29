import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Chip,
  LinearProgress,
  Avatar,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Remove,
  CheckCircle,
  Warning,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts';
import { motion } from 'framer-motion';

const AIPerformanceInsights = ({ data, role = 'student' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedSubject, setSelectedSubject] = useState(null);

  const getSubjectColor = (score) => {
    if (score >= 80) return '#43e97b';
    if (score >= 70) return '#fa8231';
    return '#ee5a6f';
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': '#43e97b',
      'A': '#43e97b',
      'B': '#fa8231',
      'C': '#ee5a6f',
      'D': '#ff4757',
    };
    return colors[grade] || '#667eea';
  };

  const PerformanceCard = ({ subject, data }) => (
    <motion.div
      whileHover={{ transform: 'translateY(-4px)' }}
      transition={{ duration: 0.2 }}
      onClick={() => setSelectedSubject(subject)}
      style={{ cursor: 'pointer' }}
    >
      <Card
        sx={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: `2px solid ${getSubjectColor(data.score)}20`,
          borderRadius: 3,
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 8px 24px ${getSubjectColor(data.score)}30`,
          },
        }}
      >
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontWeight: 700, color: '#333', fontSize: 14 }}>
                {subject}
              </Typography>
              <Chip
                label={data.grade}
                size="small"
                sx={{
                  background: `${getGradeColor(data.grade)}20`,
                  color: getGradeColor(data.grade),
                  fontWeight: 700,
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: 13, color: '#666', fontWeight: 600 }}>
                Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: getSubjectColor(data.score) }}>
                  {data.score}%
                </Typography>
                {data.trend === 'up' && (
                  <TrendingUp sx={{ fontSize: 18, color: '#43e97b' }} />
                )}
                {data.trend === 'down' && (
                  <TrendingDown sx={{ fontSize: 18, color: '#ee5a6f' }} />
                )}
                {data.trend === 'stable' && (
                  <Remove sx={{ fontSize: 18, color: '#fa8231' }} />
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={data.score}
              sx={{
                height: 8,
                borderRadius: 4,
                background: '#e9ecef',
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${getSubjectColor(data.score)} 0%, ${getSubjectColor(data.score)}80 100%)`,
                },
              }}
            />
          </Box>

          {data.lastMonth && (
            <Paper sx={{ p: 1, background: '#f8f9fa', borderRadius: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 11, color: '#666' }}>
                Last Month: <strong>{data.lastMonth}%</strong>
              </Typography>
            </Paper>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Overall Stats */}
      {role === 'student' && data?.overallStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 3,
                textAlign: 'center',
              }}
            >
              <CardContent>
                <Typography sx={{ fontSize: 12, opacity: 0.9, mb: 1 }}>
                  Current Average
                </Typography>
                <Typography sx={{ fontSize: 32, fontWeight: 700, mb: 1 }}>
                  {data.overallStats.currentPercentage}%
                </Typography>
                <Chip
                  label={`${data.overallStats.position}`}
                  size="small"
                  sx={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 700,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38ada9 100%)', color: 'white', borderRadius: 3, textAlign: 'center' }}>
              <CardContent>
                <Typography sx={{ fontSize: 12, opacity: 0.9, mb: 1 }}>
                  Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <ArrowUpward sx={{ fontSize: 24 }} />
                  <Typography sx={{ fontSize: 24, fontWeight: 700 }}>
                    +{data.overallStats.currentPercentage - data.overallStats.previousPercentage}%
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 11, opacity: 0.9 }}>
                  from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #fa8231 0%, #ee5a6f 100%)',
                color: 'white',
                borderRadius: 3,
                textAlign: 'center',
              }}
            >
              <CardContent>
                <Typography sx={{ fontSize: 12, opacity: 0.9, mb: 1 }}>
                  Target
                </Typography>
                <Typography sx={{ fontSize: 32, fontWeight: 700, mb: 1 }}>
                  85%
                </Typography>
                <Typography sx={{ fontSize: 11, opacity: 0.9 }}>
                  {85 - data.overallStats.currentPercentage}% to go
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Subject Performance Grid */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: '2px solid #667eea20', borderRadius: 3 }}>
        <CardHeader
          title={role === 'student' ? '📊 Your Subject Performance' : '📚 Class Subject Analysis'}
          titleTypographyProps={{ sx: { fontWeight: 700, color: '#333' } }}
          sx={{ pb: 2 }}
        />
        <CardContent>
          <Grid container spacing={2}>
            {data?.subjectWisePerformance?.map((subject, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <PerformanceCard subject={subject.subject} data={subject} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      {data?.monthlyTrend && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: '2px solid #43e97b20', borderRadius: 3 }}>
          <CardHeader
            title="📈 Performance Trend"
            titleTypographyProps={{ sx: { fontWeight: 700, color: '#333' } }}
            sx={{ pb: 2 }}
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                <XAxis dataKey="month" stroke="#999" />
                <YAxis stroke="#999" domain={[0, 100]} />
                <RechartsTooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '2px solid #667eea',
                    borderRadius: 8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#667eea"
                  strokeWidth={3}
                  dot={{ fill: '#667eea', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {role === 'student' && data?.personalSuggestions && (
        <Card sx={{ background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)', border: '2px solid #667eea30', borderRadius: 3 }}>
          <CardHeader
            title="💡 Personalized Suggestions"
            titleTypographyProps={{ sx: { fontWeight: 700, color: '#333' } }}
            sx={{ pb: 2 }}
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.personalSuggestions.map((suggestion, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      background: '#ffffff',
                      border: '1px solid #667eea30',
                      borderRadius: 2,
                      display: 'flex',
                      gap: 2,
                    }}
                  >
                    <CheckCircle sx={{ color: '#43e97b', fontSize: 24, flexShrink: 0 }} />
                    <Typography sx={{ color: '#333', fontWeight: 500 }}>
                      {suggestion}
                    </Typography>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AIPerformanceInsights;
