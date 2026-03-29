import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "../../../components/ui/skeleton";
import StudentLayout from "../layout/StudentLayout";
import StudentProfileCard from "../components/StudentProfileCard";
import QuickActions from "../components/QuickActions";
import AttendanceCard from "../components/AttendanceCard";
import HomeworkCard from "../components/HomeworkCard";
import MarksCard from "../components/MarksCard";
import FeesCard from "../components/FeesCard";
import AttendanceCalendar from "../../../components/AttendanceCalendar";
import { studentAPI } from "../../../services/api";
import { CheckCircle, Download } from "lucide-react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp,
  AutoAwesome,
  MenuBook,
  EmojiEvents,
  Close,
  Lightbulb,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  performanceInsights,
  aiStudyPlanner,
  weakAreaDetection,
  aiNotesGenerator,
  aiGoalTracker,
} from "../../../data/mockAIData/studentAIData";

function StudentDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [todayAttendanceStatus, setTodayAttendanceStatus] = useState("--");
  const [todayHomework, setTodayHomework] = useState(null);
  const [nextExam, setNextExam] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedAIFeature, setSelectedAIFeature] = useState(null);
  const [aiModalOpen, setAIModalOpen] = useState(false);

  const handleQuickAction = (key) => {
    const routes = {
      homework: "/student/homework",
      test: "/student/tests",
      marks: "/student/marks",
      attendance: "/student/attendance",
    };

    if (routes[key]) {
      navigate(routes[key]);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        // Load critical data first (profile, dashboard, attendance)
        const [profileRes, dashboardRes, attendanceRes] = await Promise.all([
          studentAPI.getProfile(),
          studentAPI.getDashboard(),
          studentAPI.getAttendance({ month, year }),
        ]);

        if (!isMounted) return;

        const profileData = profileRes?.data?.data ?? null;
        const dashboardData = dashboardRes?.data?.data ?? null;
        setProfile(profileData);
        setDashboard(dashboardData);

        const attendanceList = attendanceRes?.data?.data?.attendance ?? [];
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const todayRecord = attendanceList.find((r) => {
          const recordDate = new Date(r.date);
          const normalized = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate()).getTime();
          return normalized === today;
        });
        setTodayAttendanceStatus(todayRecord?.status ? String(todayRecord.status).toUpperCase() : "--");
        setAttendanceHistory(attendanceList);

        // Load secondary data in background (homework, exams, payments)
        Promise.all([
          studentAPI.getHomework().catch(() => ({ data: { data: { homework: [] } } })),
          studentAPI.getExams().catch(() => ({ data: { data: [] } })),
          studentAPI.getPaymentHistory({ limit: 5 }).catch(() => ({ data: { data: { payments: [] } } })),
        ]).then(([homeworkRes, examsRes, paymentHistoryRes]) => {
          if (!isMounted) return;

          const homeworkList = homeworkRes?.data?.data?.homework ?? [];
          const todaysHomework = homeworkList.filter((h) => {
            const due = new Date(h.dueDate);
            return due.getFullYear() === now.getFullYear() && due.getMonth() === now.getMonth() && due.getDate() === now.getDate();
          });
          setTodayHomework(todaysHomework.length ? todaysHomework[0] : null);

          const exams = examsRes?.data?.data ?? [];
          const upcoming = exams
            .filter((e) => e?.examDate)
            .map((e) => ({ ...e, _date: new Date(e.examDate) }))
            .filter((e) => !Number.isNaN(e._date.getTime()) && e._date.getTime() >= now.getTime())
            .sort((a, b) => a._date.getTime() - b._date.getTime());
          setNextExam(upcoming.length ? upcoming[0] : null);

          const payments = paymentHistoryRes?.data?.data?.payments ?? [];
          setRecentPayments(payments.slice(0, 5));
        }).catch(() => {
          if (!isMounted) return;
          setTodayHomework(null);
          setNextExam(null);
          setRecentPayments([]);
        });
      } catch (e) {
        if (!isMounted) return;
        setProfile(null);
        setDashboard(null);
        setTodayAttendanceStatus("--");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const feesDue = dashboard?.stats?.fees?.totalDue;

  const renderAIModalContent = () => {
    switch (selectedAIFeature) {
      case "performance":
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              📊 Performance Insights
            </Typography>
            <Paper sx={{ p: 2, mb: 2, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{performanceInsights.overallScore}%</Typography>
              <Typography variant="body2">Overall Score ({performanceInsights.trend})</Typography>
            </Paper>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Subject Performance:</Typography>
            {performanceInsights.subjectScores.map((subject) => (
              <Box key={subject.subject} sx={{ mb: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2">{subject.subject}</Typography>
                  <Chip label={subject.grade} size="small" color="primary" />
                </Box>
                <LinearProgress variant="determinate" value={subject.score} sx={{ height: 8, borderRadius: 1 }} />
              </Box>
            ))}

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 2 }}>
              Class Rank: {performanceInsights.classRank} / {performanceInsights.totalStudents}
            </Typography>
            <LinearProgress variant="determinate" value={(performanceInsights.classRank / performanceInsights.totalStudents) * 100} />
          </Box>
        );

      case "studyplan":
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              📅 Your Study Plan
            </Typography>
            {aiStudyPlanner.dailySchedule.slice(0, 7).map((day) => (
              <Paper key={day.day} sx={{ p: 1.5, mb: 1.5, border: "1px solid #e0e0e0" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  {day.day}
                </Typography>
                {day.sessions.map((session, idx) => (
                  <Box key={idx} sx={{ display: "flex", gap: 1, mb: 0.5 }}>
                    <Chip label={session.time} size="small" variant="outlined" />
                    <Typography variant="body2">{session.subject} - {session.topic}</Typography>
                  </Box>
                ))}
              </Paper>
            ))}
          </Box>
        );

      case "weakareas":
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              🎯 Weak Areas Analysis
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Weak Topics:</Typography>
            {weakAreaDetection.weakTopics.map((topic, idx) => (
              <Alert key={idx} severity="warning" sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {topic.subject} - {topic.topic}
                </Typography>
                <Typography variant="caption">{topic.reason}</Typography>
              </Alert>
            ))}

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 2 }}>Strong Topics:</Typography>
            {weakAreaDetection.strongTopics.map((topic, idx) => (
              <Paper key={idx} sx={{ p: 1.5, mb: 1, background: "rgba(76, 175, 80, 0.1)", border: "1px solid #4caf50" }}>
                <Typography variant="body2">✅ {topic.subject} - {topic.topic}</Typography>
              </Paper>
            ))}

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 2 }}>Recommendations:</Typography>
            {weakAreaDetection.recommendations.map((rec, idx) => (
              <Paper key={idx} sx={{ p: 1, mb: 1, background: "rgba(33, 150, 243, 0.05)" }}>
                <Typography variant="body2">→ {rec}</Typography>
              </Paper>
            ))}
          </Box>
        );

      case "notes":
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              📝 AI Generated Notes
            </Typography>
            {aiNotesGenerator.notes.map((note, idx) => (
              <Paper key={idx} sx={{ p: 2, mb: 2, background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
                <Chip label={note.subject} size="small" color="primary" sx={{ mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  {note.topic}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {note.keyPoints.join("\n")}
                </Typography>
              </Paper>
            ))}
          </Box>
        );

      case "goals":
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              🎯 Goal Tracker
            </Typography>
            {aiGoalTracker.goals.map((goal, idx) => (
              <Paper key={idx} sx={{ p: 2, mb: 1.5, border: "1px solid #e0e0e0" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {goal.goal}
                  </Typography>
                  <Chip label={`${goal.progress}%`} size="small" color={goal.progress === 100 ? "success" : "primary"} />
                </Box>
                <LinearProgress variant="determinate" value={goal.progress} sx={{ mb: 1, height: 8 }} />
                <Typography variant="caption">{goal.actionItems.join(" • ")}</Typography>
              </Paper>
            ))}
          </Box>
        );

      default:
        return null;
    }
  };

  const homeworkCardText = useMemo(() => {
    if (!todayHomework) return { title: "No tasks assigned yet", subtitle: "Check back later" };
    return {
      title: todayHomework.title ?? "Homework assigned",
      subtitle: "Due today",
    };
  }, [todayHomework]);

  const nextExamText = useMemo(() => {
    if (!nextExam) return { label: "Subject --", dateText: "Date -- / --" };
    const date = nextExam.examDate ? new Date(nextExam.examDate) : null;
    const dateText = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : "Date -- / --";
    return {
      label: nextExam.examName ?? "Upcoming Test",
      dateText,
    };
  }, [nextExam]);

  return (
    <StudentLayout title="Student Dashboard">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-52 rounded-3xl" />
          <div className="grid gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <StudentProfileCard student={profile} onProfile={() => navigate("/student/profile")} />
          
          {/* Comprehensive Student Details */}
          {profile && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Student Details</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Student ID</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{profile?.studentId || "--"}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Class</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {profile?.customClassName || profile?.sclass?.sclassName || "--"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Section</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {profile?.customSectionName || profile?.section?.sectionName || "--"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Roll Number</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{profile?.rollNum || "--"}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 break-all">{profile?.email || "--"}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{profile?.phone || "--"}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "--"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{profile?.gender || "--"}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Board</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{profile?.board || "--"}</p>
                </div>
                {profile?.group && (
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Group</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{profile.group}</p>
                  </div>
                )}
                {profile?.integratedCourse && (
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Integrated Course</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{profile.integratedCourse}</p>
                  </div>
                )}
                {profile?.parentName && (
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Parent/Guardian</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{profile.parentName}</p>
                  </div>
                )}
                {profile?.parentPhone && (
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Parent Phone</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{profile.parentPhone}</p>
                  </div>
                )}
                {profile?.address && (
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900 sm:col-span-2 lg:col-span-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{profile.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <QuickActions onSelect={handleQuickAction} />
          <div className="grid gap-4 md:grid-cols-2">
            <HomeworkCard title={homeworkCardText.title} subtitle={homeworkCardText.subtitle} />
            <AttendanceCard status={todayAttendanceStatus} />
            <MarksCard label={nextExamText.label} dateText={nextExamText.dateText} />
            <FeesCard totalDue={typeof feesDue === "number" ? feesDue : null} />
          </div>

          {/* Attendance Calendar */}
          <AttendanceCalendar 
            attendanceData={attendanceHistory}
            month={calendarMonth}
            year={calendarYear}
            onMonthChange={(month, year) => {
              setCalendarMonth(month);
              setCalendarYear(year);
            }}
          />

          {/* Recent Payments Section */}
          {recentPayments.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Payments</h3>
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          ₹{payment.amount?.toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {payment.notes || "Fee Payment"} • {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "Date not available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                        Completed
                      </span>
                      {payment.id && (
                        <button
                          onClick={async () => {
                            try {
                              const receiptRes = await studentAPI.downloadPaymentReceipt(payment.id);
                              const url = window.URL.createObjectURL(new Blob([receiptRes.data]));
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', `receipt-${payment.id}.pdf`);
                              document.body.appendChild(link);
                              link.click();
                              link.parentNode.removeChild(link);
                              window.URL.revokeObjectURL(url);
                            } catch (err) {
                              console.error("Failed to download receipt:", err);
                            }
                          }}
                          className="rounded-lg bg-indigo-100 p-2 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-800"
                          title="Download Receipt"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/student/fees")}
                className="mt-4 w-full rounded-lg border border-indigo-600 px-4 py-2 text-center font-medium text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
              >
                View All Payments
              </button>
            </div>
          )}
          {/* 🚀 AI FEATURES SECTION */}
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              ✨ AI Learning Companion
            </Typography>

            <Grid container spacing={2}>
              {/* Performance AI */}
              <Grid item xs={12} sm={6} md={4}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card
                    onClick={() => {
                      setSelectedAIFeature("performance");
                      setAIModalOpen(true);
                    }}
                    sx={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      cursor: "pointer",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center" }}>
                      <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Performance
                      </Typography>
                      <Typography variant="caption">Your Score & Rank</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Study Plan AI */}
              <Grid item xs={12} sm={6} md={4}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card
                    onClick={() => {
                      setSelectedAIFeature("studyplan");
                      setAIModalOpen(true);
                    }}
                    sx={{
                      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      color: "white",
                      cursor: "pointer",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center" }}>
                      <Lightbulb sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Study Plan
                      </Typography>
                      <Typography variant="caption">Daily Schedule</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Weak Areas AI */}
              <Grid item xs={12} sm={6} md={4}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card
                    onClick={() => {
                      setSelectedAIFeature("weakareas");
                      setAIModalOpen(true);
                    }}
                    sx={{
                      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                      color: "white",
                      cursor: "pointer",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center" }}>
                      <AutoAwesome sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Weak Areas
                      </Typography>
                      <Typography variant="caption">Topics to Focus</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Notes AI */}
              <Grid item xs={12} sm={6} md={4}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card
                    onClick={() => {
                      setSelectedAIFeature("notes");
                      setAIModalOpen(true);
                    }}
                    sx={{
                      background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                      color: "white",
                      cursor: "pointer",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center" }}>
                      <MenuBook sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Notes
                      </Typography>
                      <Typography variant="caption">Quick Revision</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Goals AI */}
              <Grid item xs={12} sm={6} md={4}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card
                    onClick={() => {
                      setSelectedAIFeature("goals");
                      setAIModalOpen(true);
                    }}
                    sx={{
                      background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                      color: "white",
                      cursor: "pointer",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center" }}>
                      <EmojiEvents sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Goals
                      </Typography>
                      <Typography variant="caption">Track Progress</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </Box>

          {/* AI Modal */}
          <Dialog
            open={aiModalOpen}
            onClose={() => setAIModalOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              },
            }}
          >
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: 700,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                fontSize: "1.2rem",
              }}
            >
              Learning Insights
              <IconButton
                onClick={() => setAIModalOpen(false)}
                sx={{ color: "white" }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3, background: "white" }}>
              {renderAIModalContent()}
            </DialogContent>
          </Dialog>
        </>
      )}
    </StudentLayout>
  );
}

export default StudentDashboard;
