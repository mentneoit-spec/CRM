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
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp,
  Warning,
  CheckCircle,
  Info,
  MoreVert,
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';

const AIAnalyticsDashboard = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedDept, setSelectedDept] = useState(null);

  const StatCard = ({ icon: Icon, label, value, trend, color = '#667eea' }) => (
    <motion.div
      whileHover={{ transform: 'translateY(-4px)' }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: `2px solid ${color}20`,
          borderRadius: 3,
          height: '100%',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: `${color}20`, width: 56, height: 56 }}>
              <Icon sx={{ color, fontSize: 28 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                {label}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                  {value}
                </Typography>
                {trend && (
                  <Chip
                    label={trend > 0 ? `+${trend}%` : `${trend}%`}
                    size="small"
                    sx={{
                      background: trend > 0 ? '#d0f0c0' : '#ffd6d6',
                      color: trend > 0 ? '#22863a' : '#cb2431',
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Overview Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={TrendingUp}
            label="Student Engagement"
            value={`${data?.overallPerformance?.studentEngagement || 0}%`}
            trend={+5}
            color="#43e97b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={CheckCircle}
            label="Academic Performance"
            value={`${data?.overallPerformance?.academicPerformance || 0}%`}
            trend={+3}
            color="#667eea"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Info}
            label="Attendance Rate"
            value={`${data?.overallPerformance?.attendanceRate || 0}%`}
            trend={+2}
            color="#fa8231"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Warning}
            label="Fee Collection"
            value={`${data?.overallPerformance?.feeCollection || 0}%`}
            trend={+7}
            color="#ee5a6f"
          />
        </Grid>
      </Grid>

      {/* Department Analysis */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: '2px solid #43e97b20', borderRadius: 3 }}>
        <CardHeader
          title="📊 Department-wise Analysis"
          titleTypographyProps={{ sx: { fontWeight: 700, color: '#333' } }}
          sx={{ pb: 1 }}
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: '#43e97b10' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#333' }}>Department</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#333' }}>Students</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#333' }}>Avg %</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#333' }}>Teachers</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#333' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.departmentStats?.map((dept, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#333',
                        cursor: 'pointer',
                        '&:hover': { color: '#667eea' },
                      }}
                      onClick={() => setSelectedDept(dept)}
                    >
                      {dept.department}
                    </TableCell>
                    <TableCell align="center">{dept.students}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 700, color: '#333' }}>
                          {dept.avgPercentage}%
                        </Typography>
                        <Box sx={{ width: 100 }}>
                          <LinearProgress
                            variant="determinate"
                            value={dept.avgPercentage}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              background: '#e9ecef',
                              '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">{dept.teachers}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={dept.avgPercentage > 75 ? '✓ Excellent' : '⚠️ Fair'}
                        size="small"
                        sx={{
                          background: dept.avgPercentage > 75 ? '#d0f0c0' : '#ffd6d6',
                          color: dept.avgPercentage > 75 ? '#22863a' : '#cb2431',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Attendance Trends Chart */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: '2px solid #fa823120', borderRadius: 3 }}>
        <CardHeader
          title="📈 Attendance Trends"
          titleTypographyProps={{ sx: { fontWeight: 700, color: '#333' } }}
          sx={{ pb: 1 }}
        />
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data?.attendanceTrends || []}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#43e97b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#43e97b" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" />
              <RechartsTooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.95)',
                  border: '2px solid #667eea',
                  borderRadius: 8,
                }}
              />
              <Area
                type="monotone"
                dataKey="overall"
                stroke="#43e97b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPresent)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card sx={{ background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)', border: '2px solid #667eea30', borderRadius: 3 }}>
        <CardHeader
          title="💡 AI Insights & Recommendations"
          titleTypographyProps={{ sx: { fontWeight: 700, color: '#333' } }}
          sx={{ pb: 1 }}
        />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { icon: '✓', text: 'Overall attendance is above target (84.2%)', status: 'positive' },
              { icon: '⚠️', text: 'Class 8 needs attendance improvement programs', status: 'warning' },
              { icon: '📊', text: 'Department performance is consistent with stable trends', status: 'positive' },
              { icon: '💡', text: 'Consider peer learning programs in underperforming areas', status: 'info' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Paper
                  sx={{
                    p: 2,
                    background: item.status === 'positive' ? '#d0f0c010' : item.status === 'warning' ? '#ffd6d610' : '#667eea10',
                    border: `1px solid ${item.status === 'positive' ? '#43e97b50' : item.status === 'warning' ? '#ee5a6f50' : '#667eea50'}`,
                    borderRadius: 2,
                    display: 'flex',
                    gap: 2,
                  }}
                >
                  <Typography sx={{ fontSize: 20 }}>{item.icon}</Typography>
                  <Typography sx={{ flex: 1, color: '#333', fontWeight: 500 }}>
                    {item.text}
                  </Typography>
                </Paper>
              </motion.div>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AIAnalyticsDashboard;
