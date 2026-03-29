import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ParentLayout from "../layout/ParentLayout";
import StudentCard from "../components/StudentCard";
import QuickActions from "../components/QuickActions";
import TodayStatus from "../components/TodayStatus";
import ActionCards from "../components/ActionCards";
import { Skeleton } from "../../../components/ui/skeleton";
import { parentAPI } from "../../../services/api";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
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
  Warning,
  Message,
  Psychology,
  SmartToy,
  Close,
  Info,
  CheckCircle,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  childPerformanceAI,
  aiAlerts,
  aiMessageSystem,
  aiSuggestions,
} from "../../../data/mockAIData/parentAIData";

function ParentDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [todayAttendanceStatus, setTodayAttendanceStatus] = useState("--");
  const [selectedAIFeature, setSelectedAIFeature] = useState(null);
  const [aiModalOpen, setAIModalOpen] = useState(false);

  const handleQuickAction = (key) => {
    const routes = {
      attendance: "/parent/attendance",
      homework: "/parent/homework",
      exams: "/parent/exams",
      fees: "/parent/fees",
    };

    if (routes[key]) {
      navigate(routes[key]);
    }
  };

  const handleActionCard = (key) => {
    const routes = {
      payments: "/parent/payment-history",
      feedback: "/parent/feedback",
    };

    if (key === "download") {
      return;
    }

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

        const dashboardRes = await parentAPI.getDashboard();
        const dashboardData = dashboardRes?.data?.data ?? null;

        if (!isMounted) return;
        setDashboard(dashboardData);

        const firstStudent = dashboardData?.students?.[0];
        if (!firstStudent?.id) {
          setTodayAttendanceStatus("--");
        } else {
          const attendanceRes = await parentAPI.getChildAttendance(firstStudent.id, { month, year });
          const attendanceList = attendanceRes?.data?.data?.attendance ?? [];
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          const todayRecord = attendanceList.find((r) => {
            const recordDate = new Date(r.date);
            const normalized = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate()).getTime();
            return normalized === today;
          });
          setTodayAttendanceStatus(todayRecord?.status ? String(todayRecord.status).toUpperCase() : "--");
        }
      } catch (e) {
        if (!isMounted) return;
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

  const summary = useMemo(() => {
    const firstStudent = dashboard?.students?.[0];
    return {
      studentName: firstStudent?.name ?? "Student Name",
      classLabel: firstStudent?.sclass?.sclassName ?? "Class --",
      section: firstStudent?.section?.sectionName ?? "Section --",
      attendanceStatus: todayAttendanceStatus,
      feeDue: typeof dashboard?.totalFeesDue === "number" ? `₹ ${dashboard.totalFeesDue.toLocaleString()}` : "₹ --",
      studentId: firstStudent?.id ?? null,
    };
  }, [dashboard, todayAttendanceStatus]);

  const handleDownloadReport = async () => {
    try {
      if (!summary.studentId) return;
      const res = await parentAPI.downloadReportCard(summary.studentId);
      const payload = res?.data?.data;
      const pdfUrl = payload?.pdfUrl;
      if (pdfUrl) {
        window.open(pdfUrl, "_blank", "noopener,noreferrer");
        return;
      }
      // Fallback: take user to results view
      navigate("/parent/exams");
    } catch (e) {
      navigate("/parent/exams");
    }
  };

  const renderAIModalContent = () => {
    switch (selectedAIFeature) {
      case "performance":
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              📊 Child Performance Report
            </Typography>
            <Paper sx={{ p: 2, mb: 2, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{childPerformanceAI.marksSummary.currentPercentage}%</Typography>
              <Typography variant="body2">Overall Percentage ({childPerformanceAI.marksSummary.trend})</Typography>
            </Paper>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Subject-wise Marks:</Typography>
            {childPerformanceAI.subjectWiseMarks.map((subject) => (
              <Box key={subject.subject} sx={{ mb: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2">{subject.subject}</Typography>
                  <Chip label={subject.grade} size="small" color="primary" />
                </Box>
                <LinearProgress variant="determinate" value={subject.score} sx={{ height: 8, borderRadius: 1 }} />
              </Box>
            ))}

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 2 }}>
              Attendance: {childPerformanceAI.attendanceSummary.attendancePercentage}%
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip icon={<CheckCircle />} label={`${childPerformanceAI.attendanceSummary.daysPresent} Days Present`} />
              <Chip icon={<Warning />} label={`${childPerformanceAI.attendanceSummary.daysAbsent} Days Absent`} />
            </Box>
          </Box>
        );

      case "alerts":
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              ⚠️ AI Alerts & Warnings
            </Typography>
            {aiAlerts.lowMarksAlerts.length > 0 ? (
              aiAlerts.lowMarksAlerts.map((alert, idx) => (
                <Alert key={idx} severity="warning" sx={{ mb: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {alert.alert}
                  </Typography>
                  <Typography variant="caption">{alert.action}</Typography>
                </Alert>
              ))
            ) : (
              <Alert severity="success" sx={{ mb: 1.5 }}>
                No critical alerts. Your child is performing well! 🌟
              </Alert>
            )}

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 2 }}>
              Upcoming Deadlines:
            </Typography>
            {aiAlerts.upcomingDeadlines.map((deadline, idx) => (
              <Paper key={idx} sx={{ p: 1.5, mb: 1, border: "1px solid #e0e0e0" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {deadline.type}: {deadline.subject || deadline.description}
                  </Typography>
                  <Chip label={new Date(deadline.date).toLocaleDateString()} size="small" />
                </Box>
              </Paper>
            ))}
          </Box>
        );

      case "messages":
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              📩 AI Updates & Messages
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Recent Updates:
            </Typography>
            {aiMessageSystem.autoUpdates.map((update, idx) => (
              <Alert key={idx} severity={update.priority} sx={{ mb: 1.5 }}>
                <Typography variant="body2">{update.message}</Typography>
                <Typography variant="caption">{new Date(update.date).toLocaleDateString()}</Typography>
              </Alert>
            ))}

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 2 }}>
              Personalized Alerts:
            </Typography>
            {aiMessageSystem.personalizedAlerts.map((alert, idx) => (
              <Paper key={idx} sx={{ p: 1.5, mb: 1, border: "1px solid #e0e0e0" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Chip label={alert.type} size="small" color="primary" sx={{ mb: 0.5 }} />
                    <Typography variant="body2">{alert.message}</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ whiteSpace: "nowrap" }}>
                    {alert.timestamp}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        );

      case "suggestions":
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              🧠 AI Suggestions for Improvement
            </Typography>

            {["academic", "behavioral", "lifestyle"].map((category) => (
              <Box key={category} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, textTransform: "capitalize" }}>
                  {category === "academic" ? "📚 Academic" : category === "behavioral" ? "😊 Behavioral" : "🏃 Lifestyle"}
                </Typography>
                {aiSuggestions.improvementSuggestions[category].map((suggestion, idx) => (
                  <Paper key={idx} sx={{ p: 1.5, mb: 1, background: "rgba(102, 126, 234, 0.05)", border: "1px solid #667eea" }}>
                    <Typography variant="body2">{suggestion}</Typography>
                  </Paper>
                ))}
              </Box>
            ))}

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 2 }}>
              📋 Action Items:
            </Typography>
            {aiSuggestions.parentAction.map((action, idx) => (
              <Box key={idx} sx={{ display: "flex", gap: 1, mb: 1 }}>
                <CheckCircle sx={{ color: "#667eea", fontSize: 20, mt: 0.5 }} />
                <Typography variant="body2">{action}</Typography>
              </Box>
            ))}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <ParentLayout title="Parent Dashboard">
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
          <StudentCard summary={summary} onProfile={() => navigate("/parent/profile")} />
          <QuickActions onSelect={handleQuickAction} />
          <TodayStatus summary={summary} />
          <ActionCards
            onSelect={(key) => {
              if (key === "download") {
                handleDownloadReport();
                return;
              }
              handleActionCard(key);
            }}
          />

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
              ✨ AI Companion Features
            </Typography>

            <Grid container spacing={2}>
              {/* Performance AI */}
              <Grid item xs={12} sm={6} md={3}>
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
                      <Typography variant="caption">Marks & Attendance</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Alerts AI */}
              <Grid item xs={12} sm={6} md={3}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card
                    onClick={() => {
                      setSelectedAIFeature("alerts");
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
                      <Warning sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Alerts
                      </Typography>
                      <Typography variant="caption">Smart Notifications</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Messages AI */}
              <Grid item xs={12} sm={6} md={3}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card
                    onClick={() => {
                      setSelectedAIFeature("messages");
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
                      <Message sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Messages
                      </Typography>
                      <Typography variant="caption">Updates & Alerts</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Suggestions AI */}
              <Grid item xs={12} sm={6} md={3}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card
                    onClick={() => {
                      setSelectedAIFeature("suggestions");
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
                      <Psychology sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Suggestions
                      </Typography>
                      <Typography variant="caption">Growth Tips</Typography>
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
              AI Feature Details
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
    </ParentLayout>
  );
}

export default ParentDashboard;
