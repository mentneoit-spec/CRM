import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Chip,
  Avatar,
  LinearProgress,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Warning,
  TrendingDown,
  AssignmentLate,
  EventNote,
  Call,
  Mail,
  CheckCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AIRiskDetection = ({ data }) => {
  const theme = useTheme();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);

  const getRiskColor = (risk) => {
    if (risk > 80) return '#ff4757';
    if (risk > 60) return '#ee5a6f';
    return '#ffa502';
  };

  const getRiskLabel = (risk) => {
    if (risk > 80) return 'Critical';
    if (risk > 60) return 'High';
    return 'Medium';
  };

  const RiskCard = ({ student }) => (
    <motion.div
      whileHover={{ transform: 'translateY(-4px)' }}
      transition={{ duration: 0.2 }}
      onClick={() => {
        setSelectedStudent(student);
        setOpenDetails(true);
      }}
      style={{ cursor: 'pointer' }}
    >
      <Card
        sx={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: `2px solid ${getRiskColor(student.risk)}30`,
          borderRadius: 3,
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 8px 24px ${getRiskColor(student.risk)}30`,
          },
        }}
      >
        <CardContent>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#333', fontSize: 16 }}>
                {student.name}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#666' }}>
                {student.class}
              </Typography>
            </Box>
            <Chip
              label={getRiskLabel(student.risk)}
              size="small"
              icon={<Warning sx={{ fontSize: 16 }} />}
              sx={{
                background: `${getRiskColor(student.risk)}20`,
                color: getRiskColor(student.risk),
                fontWeight: 700,
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#666' }}>
                Risk Level
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: getRiskColor(student.risk) }}>
                {student.risk}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={student.risk}
              sx={{
                height: 8,
                borderRadius: 4,
                background: '#e9ecef',
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${getRiskColor(student.risk)} 0%, ${getRiskColor(student.risk)}80 100%)`,
                },
              }}
            />
          </Box>

          <Paper sx={{ p: 1.5, background: '#f8f9fa', borderRadius: 2, mb: 2 }}>
            <Typography sx={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
              <strong>Reason:</strong> {student.reason}
            </Typography>
            {student.attendance && (
              <Typography sx={{ fontSize: 12, color: '#ee5a6f', fontWeight: 600, mt: 1 }}>
                Attendance: {student.attendance}%
              </Typography>
            )}
          </Paper>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Mail sx={{ fontSize: 14 }} />}
              sx={{ flex: 1, fontSize: 11, fontWeight: 600 }}
            >
              Notify
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<CheckCircle sx={{ fontSize: 14 }} />}
              sx={{
                flex: 1,
                fontSize: 11,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Action
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Overview Alert */}
      <Alert
        severity="warning"
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #ffe66d20 0%, #ff6b6b20 100%)',
          border: '2px solid #ee5a6f50',
          borderRadius: 3,
          '& .MuiAlert-icon': {
            fontSize: 28,
          },
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, color: '#333', fontSize: 16, mb: 0.5 }}>
            ⚠️ {data?.dropoutRiskStudents?.length || 0} Students at Risk
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#666' }}>
            Immediate intervention recommended for high-risk students. Early action can prevent dropout.
          </Typography>
        </Box>
      </Alert>

      {/* Dropout Risk Students */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: '2px solid #ff475730', borderRadius: 3 }}>
        <CardHeader
          title="🚨 Dropout Risk Students"
          titleTypographyProps={{ sx: { fontWeight: 700, color: '#333' } }}
          subheaderTypographyProps={{ sx: { color: '#666' } }}
          subheader="Students requiring immediate intervention"
          sx={{ pb: 2 }}
        />
        <CardContent>
          <Grid container spacing={2}>
            {data?.dropoutRiskStudents?.map((student, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <RiskCard student={student} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Low Attendance Alerts */}
      <Card sx={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: '2px solid #fa823130', borderRadius: 3 }}>
        <CardHeader
          title="📋 Low Attendance Alerts by Class"
          titleTypographyProps={{ sx: { fontWeight: 700, color: '#333' } }}
          sx={{ pb: 2 }}
        />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data?.lowAttendanceAlerts?.map((alert, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Paper
                  sx={{
                    p: 2,
                    background: 'linear-gradient(135deg, #ffe66d10 0%, #ff6b6b10 100%)',
                    border: '1px solid #fa823150',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: '#333', fontSize: 15 }}>
                        {alert.class}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#666', mt: 0.5 }}>
                        {alert.affectedStudents} students affected
                      </Typography>
                    </Box>
                    <Chip
                      label={`${alert.averageAttendance}% attendance`}
                      size="small"
                      sx={{
                        background: alert.averageAttendance < alert.threshold ? '#ff4757' : '#43e97b',
                        color: 'white',
                        fontWeight: 700,
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: 12, color: '#666' }}>
                        Attendance vs Threshold
                      </Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#333' }}>
                        {alert.threshold - alert.averageAttendance}% below
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={alert.averageAttendance}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        background: '#e9ecef',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #ee5a6f 0%, #ff4757 100%)',
                        },
                      }}
                    />
                  </Box>

                  <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    startIcon={<Mail sx={{ fontSize: 14 }} />}
                    sx={{
                      background: 'linear-gradient(135deg, #ee5a6f 0%, #ff4757 100%)',
                      fontWeight: 600,
                    }}
                  >
                    Send Attendance Notice
                  </Button>
                </Paper>
              </motion.div>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #ff4757 0%, #ee5a6f 100%)', color: 'white', fontWeight: 700 }}>
          {selectedStudent?.name} - Detailed Analysis
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedStudent && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper sx={{ p: 2, background: '#f8f9fa', borderRadius: 2 }}>
                <Typography sx={{ fontSize: 12, color: '#666', mb: 1 }}>Class</Typography>
                <Typography sx={{ fontWeight: 700, color: '#333' }}>{selectedStudent.class}</Typography>
              </Paper>

              <Paper sx={{ p: 2, background: '#f8f9fa', borderRadius: 2 }}>
                <Typography sx={{ fontSize: 12, color: '#666', mb: 1 }}>Risk Level</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontWeight: 700, color: getRiskColor(selectedStudent.risk), fontSize: 18 }}>
                    {selectedStudent.risk}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={selectedStudent.risk}
                    sx={{ flex: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Paper>

              <Paper sx={{ p: 2, background: '#f8f9fa', borderRadius: 2 }}>
                <Typography sx={{ fontSize: 12, color: '#666', mb: 1 }}>Main Concern</Typography>
                <Typography sx={{ fontWeight: 600, color: '#333' }}>{selectedStudent.reason}</Typography>
              </Paper>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <Mail sx={{ color: '#667eea' }} />
                  </ListItemIcon>
                  <ListItemText primary="Send Email" secondary="to parent & student" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Call sx={{ color: '#667eea' }} />
                  </ListItemIcon>
                  <ListItemText primary="Schedule Call" secondary="with parents" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EventNote sx={{ color: '#667eea' }} />
                  </ListItemIcon>
                  <ListItemText primary="Create Action Plan" secondary="intervention steps" />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDetails(false)}>Close</Button>
          <Button
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            Intervene Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIRiskDetection;
