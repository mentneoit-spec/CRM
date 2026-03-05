import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Avatar, Tabs, Tab, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { makeStyles } from '@mui/styles';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3),
  },
  statCard: {
    minWidth: 150,
    marginRight: theme.spacing(2),
    background: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  statsContainer: {
    display: 'flex',
    marginBottom: theme.spacing(4),
  },
  tabPanel: {
    padding: theme.spacing(2),
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  addButton: {
    marginBottom: theme.spacing(2),
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const ModernTeacherDashboard = () => {
  const classes = useStyles();
  const [tabIndex, setTabIndex] = useState(0);

  // sample data
  const [classesList, setClassesList] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '' });

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // fetch sample data effect placeholders
  useEffect(() => {
    // fetch classes, students etc from API
    setClassesList(["Class 1A", "Class 2B", "Class 3C"]);
  }, []);

  const handleClassSelect = (e) => {
    setSelectedClass(e.target.value);
    // fetch students for class
    setStudents([
      { id: 1, name: 'Alice', attendance: 92 },
      { id: 2, name: 'Bob', attendance: 85 },
    ]);
  };

  const openNewAssignment = () => setOpenAssignmentDialog(true);
  const closeNewAssignment = () => setOpenAssignmentDialog(false);
  const saveAssignment = () => {
    setAssignments([...assignments, newAssignment]);
    setNewAssignment({ title: '', description: '', dueDate: '' });
    closeNewAssignment();
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Typography variant="h4">Teacher Dashboard</Typography>
        <Avatar alt="Teacher" src="/static/images/avatar/1.jpg" />
      </Box>

      <Box className={classes.statsContainer}>
        <Card className={classes.statCard}>
          <CardContent>
            <Typography variant="h6">Total Classes</Typography>
            <Typography variant="h4">3</Typography>
          </CardContent>
        </Card>
        <Card className={classes.statCard}>
          <CardContent>
            <Typography variant="h6">Students</Typography>
            <Typography variant="h4">45</Typography>
          </CardContent>
        </Card>
        <Card className={classes.statCard}>
          <CardContent>
            <Typography variant="h6">Assignments</Typography>
            <Typography variant="h4">12</Typography>
          </CardContent>
        </Card>
      </Box>

      <Tabs value={tabIndex} onChange={handleTabChange} aria-label="teacher tabs">
        <Tab label="Classes" />
        <Tab label="Attendance" />
        <Tab label="Assignments" />
        <Tab label="Grades" />
      </Tabs>

      <TabPanel value={tabIndex} index={0} className={classes.tabPanel}>
        <Typography variant="h6">My Classes</Typography>
        <Table className={classes.tableContainer}>
          <TableHead>
            <TableRow>
              <TableCell>Class</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Timings</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classesList.map((cls, idx) => (
              <TableRow key={idx}>
                <TableCell>{cls}</TableCell>
                <TableCell>Mathematics</TableCell>
                <TableCell>9:00 AM - 10:00 AM</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabPanel>

      <TabPanel value={tabIndex} index={1} className={classes.tabPanel}>
        <Typography variant="h6">Mark Attendance</Typography>
        <TextField
          select
          label="Select Class"
          value={selectedClass}
          onChange={handleClassSelect}
          fullWidth
        >
          {classesList.map((cls) => (
            <MenuItem key={cls} value={cls}>{cls}</MenuItem>
          ))}
        </TextField>
        {students.length > 0 && (
          <Table className={classes.tableContainer}>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Attendance (%)</TableCell>
                <TableCell>Mark</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((stu) => (
                <TableRow key={stu.id}>
                  <TableCell>{stu.name}</TableCell>
                  <TableCell>{stu.attendance}</TableCell>
                  <TableCell>
                    <Button size="small" variant="contained">Present</Button>
                    <Button size="small" variant="outlined" sx={{ ml: 1 }}>Absent</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TabPanel>

      <TabPanel value={tabIndex} index={2} className={classes.tabPanel}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">Assignments</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openNewAssignment}
          >
            New
          </Button>
        </Box>
        <Table className={classes.tableContainer}>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map((a, idx) => (
              <TableRow key={idx}>
                <TableCell>{a.title}</TableCell>
                <TableCell>{a.dueDate}</TableCell>
                <TableCell>{a.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={openAssignmentDialog} onClose={closeNewAssignment} fullWidth maxWidth="sm">
          <DialogTitle>
            New Assignment
            <IconButton
              aria-label="close"
              onClick={closeNewAssignment}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Title"
              fullWidth
              value={newAssignment.title}
              onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newAssignment.description}
              onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
            />
            <TextField
              margin="dense"
              type="date"
              label="Due Date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newAssignment.dueDate}
              onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeNewAssignment}>Cancel</Button>
            <Button onClick={saveAssignment} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </TabPanel>

      <TabPanel value={tabIndex} index={3} className={classes.tabPanel}>
        <Typography variant="h6">Enter Grades</Typography>
        <TextField
          select
          label="Select Class"
          value={selectedClass}
          onChange={handleClassSelect}
          fullWidth
        >
          {classesList.map((cls) => (
            <MenuItem key={cls} value={cls}>{cls}</MenuItem>
          ))}
        </TextField>
        {students.length > 0 && (
          <Table className={classes.tableContainer}>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Grade</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((stu) => (
                <TableRow key={stu.id}>
                  <TableCell>{stu.name}</TableCell>
                  <TableCell>
                    <TextField select size="small" value={stu.grade || ''} onChange={(e) => {
                      const val = e.target.value;
                      setStudents(prev => prev.map(s => s.id === stu.id ? { ...s, grade: val } : s));
                    }}>
                      <MenuItem value="A">A</MenuItem>
                      <MenuItem value="B">B</MenuItem>
                      <MenuItem value="C">C</MenuItem>
                      <MenuItem value="D">D</MenuItem>
                      <MenuItem value="F">F</MenuItem>
                    </TextField>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TabPanel>

    </Box>
  );
};

export default ModernTeacherDashboard;
