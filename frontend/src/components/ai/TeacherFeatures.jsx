import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ============ LESSON PLAN GENERATOR ============
export const LessonPlanGenerator = ({ open, onClose }) => {
  const [lessonData, setLessonData] = React.useState({
    topic: '',
    class: '',
    duration: '45',
    objectives: '',
  });

  const handleGenerateLessonPlan = () => {
    // Sample generated lesson plan
    alert(`Generating Lesson Plan for: ${lessonData.topic} (${lessonData.duration} mins)`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#1565c0' }}>
        ✍️ Generate Lesson Plan
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TextField
          label="Topic"
          fullWidth
          value={lessonData.topic}
          onChange={(e) => setLessonData({ ...lessonData, topic: e.target.value })}
          placeholder="e.g., Photosynthesis, Algebra Basics"
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Class</InputLabel>
          <Select value={lessonData.class} label="Class" onChange={(e) => setLessonData({ ...lessonData, class: e.target.value })}>
            <MenuItem value="10">Class 10</MenuItem>
            <MenuItem value="12">Class 12</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Duration (minutes)"
          type="number"
          fullWidth
          value={lessonData.duration}
          onChange={(e) => setLessonData({ ...lessonData, duration: e.target.value })}
          margin="normal"
        />
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            📋 Generated Lesson Plan Preview:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Topic:</strong> {lessonData.topic || 'Your Topic'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Duration:</strong> {lessonData.duration} minutes
          </Typography>
          <Typography variant="body2">
            <strong>Activities:</strong> Introduction (5m) → Teaching (15m) → Practice (20m) → Review (5m)
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleGenerateLessonPlan} variant="contained" sx={{ bgcolor: '#1565c0' }}>
          Generate Plan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============ EXAM QUESTION GENERATOR ============
export const ExamQuestionGenerator = ({ open, onClose }) => {
  const [questionData, setQuestionData] = React.useState({
    subject: '',
    totalQuestions: '50',
    difficulty: 'mixed',
    examType: 'semester',
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#43a047' }}>
        📝 Generate Exam Questions
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={questionData.subject}
                label="Subject"
                onChange={(e) => setQuestionData({ ...questionData, subject: e.target.value })}
              >
                <MenuItem value="math">Mathematics</MenuItem>
                <MenuItem value="science">Science</MenuItem>
                <MenuItem value="english">English</MenuItem>
                <MenuItem value="history">History</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Total Questions"
              type="number"
              fullWidth
              value={questionData.totalQuestions}
              onChange={(e) => setQuestionData({ ...questionData, totalQuestions: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Difficulty Mix</InputLabel>
              <Select
                value={questionData.difficulty}
                label="Difficulty Mix"
                onChange={(e) => setQuestionData({ ...questionData, difficulty: e.target.value })}
              >
                <MenuItem value="easy">Easy (30% Medium, 70% Hard)</MenuItem>
                <MenuItem value="mixed">Mixed (40% Easy, 40% Medium, 20% Hard)</MenuItem>
                <MenuItem value="hard">Challenging (20% Easy, 30% Medium, 50% Hard)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#43a047' }}>
            ✅ Question Paper Ready to Generate:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary={`Subject: ${questionData.subject.toUpperCase()}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`Total Questions: ${questionData.totalQuestions}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`Difficulty: ${questionData.difficulty}`} />
            </ListItem>
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => alert('Question paper generated!')} variant="contained" sx={{ bgcolor: '#43a047' }}>
          Generate & Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============ WEAK STUDENTS IDENTIFIER ============
export const WeakStudentsIdentifier = ({ open, onClose }) => {
  const weakStudents = [
    { id: 1, name: 'Rajesh Kumar', class: '10-A', avg: 42, weakSubjects: 'Math, Physics', priority: 'High' },
    { id: 2, name: 'Priya Singh', class: '10-B', avg: 48, weakSubjects: 'English, Math', priority: 'High' },
    { id: 3, name: 'Arjun Patel', class: '10-A', avg: 58, weakSubjects: 'Science', priority: 'Medium' },
    { id: 4, name: 'Sneha Reddy', class: '10-B', avg: 62, weakSubjects: 'Math', priority: 'Medium' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#e53935' }}>
        ⚠️ Identify Weak Students
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#ffebee' }}>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Average
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Weak Subjects</TableCell>
                <TableCell sx={{ fontWeight: 700 }}><Chip label="Priority" size="small" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {weakStudents.map((student) => (
                <TableRow key={student.id} sx={{ '&:hover': { bgcolor: '#fff3e0' } }}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${student.avg}%`}
                      color={student.avg < 50 ? 'error' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{student.weakSubjects}</TableCell>
                  <TableCell>
                    <Chip
                      label={student.priority}
                      color={student.priority === 'High' ? 'error' : 'warning'}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3, p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            💡 Recommended Actions:
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            • Schedule 1:1 tutoring for HIGH priority students
            <br />• Conduct extra practice sessions for MEDIUM priority students
            <br />• Create personalized study plans
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={() => alert('Actions scheduled!')} variant="contained" sx={{ bgcolor: '#e53935' }}>
          Schedule Interventions
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============ MARKS ANALYSIS ============
export const MarksAnalysisViewer = ({ open, onClose }) => {
  const performanceData = [
    { month: 'Jan', avg: 72 },
    { month: 'Feb', avg: 75 },
    { month: 'Mar', avg: 78 },
    { month: 'Apr', avg: 82 },
    { month: 'May', avg: 84 },
    { month: 'Jun', avg: 85 },
  ];

  const topStudents = [
    { name: 'Aisha Khan', score: 94 },
    { name: 'Rohan Singh', score: 91 },
    { name: 'Priya Sharma', score: 89 },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#fb8c00' }}>
        📊 Marks Analysis
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Performance Trend:
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="avg" fill="#fb8c00" />
              </BarChart>
            </ResponsiveContainer>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ bgcolor: '#fff3e0', border: '2px solid #fb8c00' }}>
              <CardContent>
                <Typography sx={{ fontWeight: 700, color: '#fb8c00', mb: 1 }}>
                  📈 Class Overview
                </Typography>
                <Typography variant="body2">Current Avg: <strong>85%</strong></Typography>
                <Typography variant="body2">Improvement: <strong>+13% from Jan</strong></Typography>
                <Typography variant="body2">Pass Rate: <strong>96%</strong></Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ bgcolor: '#e3f2fd', border: '2px solid #1565c0' }}>
              <CardContent>
                <Typography sx={{ fontWeight: 700, color: '#1565c0', mb: 1 }}>
                  🏆 Top Performers
                </Typography>
                {topStudents.map((student, idx) => (
                  <Typography key={idx} variant="body2">
                    {idx + 1}. {student.name} - {student.score}%
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" sx={{ bgcolor: '#fb8c00' }}>
          Export Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============ PARENT COMMUNICATION ============
export const ParentCommunicationComposer = ({ open, onClose }) => {
  const [message, setMessage] = React.useState(
    'Subject: Monthly Progress Update\n\nDear Parent,\n\nI hope this message finds you well...'
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#8e24aa' }}>
        📩 Parent Communication
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TextField
          label="Select Recipient"
          select
          fullWidth
          defaultValue="all"
          margin="normal"
        >
          <MenuItem value="all">All Parents</MenuItem>
          <MenuItem value="class10a">Class 10-A Parents</MenuItem>
          <MenuItem value="weak">Parents of Weak Students</MenuItem>
        </TextField>

        <TextField
          label="Message"
          multiline
          rows={8}
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          margin="normal"
        />

        <Box sx={{ mt: 2, p: 2, bgcolor: '#f3e5f5', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            📨 Preview: {message.split('\n')[0]}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => alert('Message scheduled for sending!')} variant="contained" sx={{ bgcolor: '#8e24aa' }}>
          Send to Parents
        </Button>
      </DialogActions>
    </Dialog>
  );
};
