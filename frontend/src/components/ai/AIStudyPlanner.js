import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Chip,
  Paper,
  Button,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
} from '@mui/material';
import {
  Schedule,
  Book,
  CheckCircle,
  AccessTime,
  Flag,
  TrendingUp,
  Edit,
  Delete,
  Add,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AIStudyPlanner = ({ data }) => {
  const theme = useTheme();
  const [openEditPlan, setOpenEditPlan] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getActivityColor = (priority) => {
    if (priority === 'Critical') return '#ff4757';
    if (priority === 'High') return '#ee5a6f';
    if (priority === 'Medium') return '#fa8231';
    return '#43e97b';
  };

  const TimeSlotCard = ({ schedule }) => (
    <motion.div
      whileHover={{ transform: 'translateX(4px)' }}
      transition={{ duration: 0.2 }}
    >
      <Paper
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: `2px solid ${getActivityColor(schedule.priority)}20`,
          borderRadius: 2,
          mb: 1.5,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 6px 20px ${getActivityColor(schedule.priority)}20`,
            borderColor: `${getActivityColor(schedule.priority)}50`,
          },
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
            <AccessTime sx={{ color: getActivityColor(schedule.priority), fontSize: 24 }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#333', mt: 1 }}>
              {schedule.time}
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
              <Typography sx={{ fontWeight: 700, color: '#333', fontSize: 14 }}>
                {schedule.activity}
              </Typography>
              <Chip
                label={schedule.priority}
                size="small"
                sx={{
                  background: `${getActivityColor(schedule.priority)}20`,
                  color: getActivityColor(schedule.priority),
                  fontWeight: 700,
                  fontSize: 11,
                }}
              />
            </Box>

            {schedule.subject && (
              <Typography sx={{ fontSize: 12, color: '#667eea', fontWeight: 600, mb: 1 }}>
                Subject: {schedule.subject}
              </Typography>
            )}

            {schedule.priority === 'Essential' ? (
              <Chip
                label={`${schedule.time.split('-')[1]} remaining`}
                size="small"
                variant="outlined"
                sx={{ fontSize: 11 }}
              />
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="text" sx={{ fontSize: 11 }}>
                  ✓ Done
                </Button>
                <Button size="small" variant="text" sx={{ fontSize: 11 }}>
                  Edit
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Daily Schedule */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: '2px solid #fa823120', borderRadius: 3 }}>
        <CardHeader
          title="📅 Daily Study Schedule"
          titleTypographyProps={{ sx: { fontWeight: 700, color: '#333' } }}
          action={
            <Button
              size="small"
              startIcon={<Edit sx={{ fontSize: 16 }} />}
              onClick={() => setOpenEditPlan(true)}
              sx={{ fontWeight: 600 }}
            >
              Edit
            </Button>
          }
          sx={{ pb: 2 }}
        />
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontWeight: 600, color: '#333' }}>
                {data?.dailySchedule?.date}
              </Typography>
              <Chip
                label={`${data?.dailySchedule?.totalStudyHours || 0} hours study time`}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 700,
                }}
              />
            </Box>
          </Box>

          <Box>
            {data?.dailySchedule?.schedule?.map((slot, idx) => (
              <TimeSlotCard key={idx} schedule={slot} />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Exam Prep Plan */}
      {data?.examPrepPlan && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: '2px solid #667eea20', borderRadius: 3 }}>
          <CardHeader
            title="🎯 Exam Preparation Plan"
            titleTypographyProps={{ sx: { fontWeight: 700, color: '#333' } }}
            subheaderTypographyProps={{ sx: { color: '#666' } }}
            subheader={`${data.examPrepPlan.daysLeft} days remaining • Target: ${data.examPrepPlan.weeklyTarget}/week`}
            sx={{ pb: 2 }}
          />
          <CardContent>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Paper
                  sx={{
                    p: 2.5,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #43e97b 0%, #38ada9 100%)',
                    color: 'white',
                    borderRadius: 2,
                  }}
                >
                  <Typography sx={{ fontSize: 12, opacity: 0.9, mb: 1 }}>
                    Exam Date
                  </Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                    {data.examPrepPlan.examDate}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper
                  sx={{
                    p: 2.5,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #fa8231 0%, #ee5a6f 100%)',
                    color: 'white',
                    borderRadius: 2,
                  }}
                >
                  <Typography sx={{ fontSize: 12, opacity: 0.9, mb: 1 }}>
                    Daily Study Target
                  </Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                    {data.examPrepPlan.dailyTarget}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography sx={{ fontWeight: 700, color: '#333', mb: 2, fontSize: 14 }}>
              Subjects to Cover:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.examPrepPlan.subjects.map((subject, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      background: subject.priority === 'Critical' ? '#ff475720' : subject.priority === 'High' ? '#ee5a6f20' : '#43e97b20',
                      border: `1px solid ${subject.priority === 'Critical' ? '#ff4757' : subject.priority === 'High' ? '#ee5a6f' : '#43e97b'}50`,
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: '#333' }}>
                          {subject.name}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: '#666', mt: 0.5 }}>
                          {subject.chapters.length} chapters • {subject.chapters.join(', ')}
                        </Typography>
                      </Box>
                      <Chip
                        label={subject.priority}
                        size="small"
                        sx={{
                          background: subject.priority === 'Critical' ? '#ff4757' : subject.priority === 'High' ? '#ee5a6f' : '#43e97b',
                          color: 'white',
                          fontWeight: 700,
                        }}
                      />
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontSize: 12, color: '#666' }}>
                          Study Progress
                        </Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#333' }}>
                          {Math.round((subject.scheduledDays.length / Math.max(7, data.examPrepPlan.daysLeft / 7)) * 100)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.round((subject.scheduledDays.length / Math.max(7, data.examPrepPlan.daysLeft / 7)) * 100)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          background: '#e9ecef',
                          '& .MuiLinearProgress-bar': {
                            background: subject.priority === 'Critical' ? 'linear-gradient(90deg, #ff4757 0%, #ee5a6f 100%)' : 'linear-gradient(90deg, #43e97b 0%, #38ada9 100%)',
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tips & Recommendations */}
      <Card sx={{ background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)', border: '2px solid #667eea30', borderRadius: 3 }}>
        <CardHeader
          title="💡 Study Tips"
          titleTypographyProps={{ sx: { fontWeight: 700, color: '#333' } }}
          sx={{ pb: 2 }}
        />
        <CardContent>
          <List>
            {[
              { icon: '✓', text: 'Take 5-10 minute breaks every 45 minutes of study' },
              { icon: '✓', text: 'Stay hydrated and maintain proper posture' },
              { icon: '✓', text: 'Review yesterday\'s notes before new topics' },
              { icon: '✓', text: 'Practice previous year exam papers' },
              { icon: '✓', text: 'Maintain consistent sleep (7-8 hours)' },
            ].map((tip, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40, fontSize: 20 }}>
                    {tip.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={tip.text}
                    primaryTypographyProps={{ sx: { color: '#333', fontWeight: 500 } }}
                  />
                </ListItem>
              </motion.div>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Edit Plan Dialog */}
      <Dialog open={openEditPlan} onClose={() => setOpenEditPlan(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: 700 }}>
          Edit Study Schedule
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Date"
            type="date"
            defaultValue={selectedDate.toISOString().split('T')[0]}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Daily Study Hours"
            type="number"
            defaultValue="4"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Add Activity"
            placeholder="e.g., Mathematics practice"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEditPlan(false)}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIStudyPlanner;
