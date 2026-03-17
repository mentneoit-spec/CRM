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
import { studentAPI } from "../../../services/api";

function StudentDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [todayAttendanceStatus, setTodayAttendanceStatus] = useState("--");
  const [todayHomework, setTodayHomework] = useState(null);
  const [nextExam, setNextExam] = useState(null);

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

        const [profileRes, dashboardRes, attendanceRes, homeworkRes, examsRes] = await Promise.all([
          studentAPI.getProfile(),
          studentAPI.getDashboard(),
          studentAPI.getAttendance({ month, year }),
          studentAPI.getHomework(),
          studentAPI.getExams(),
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
      } catch (e) {
        if (!isMounted) return;
        setProfile(null);
        setDashboard(null);
        setTodayAttendanceStatus("--");
        setTodayHomework(null);
        setNextExam(null);
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
          <QuickActions onSelect={handleQuickAction} />
          <div className="grid gap-4 md:grid-cols-2">
            <HomeworkCard title={homeworkCardText.title} subtitle={homeworkCardText.subtitle} />
            <AttendanceCard status={todayAttendanceStatus} />
            <MarksCard label={nextExamText.label} dateText={nextExamText.dateText} />
            <FeesCard totalDue={typeof feesDue === "number" ? feesDue : null} />
          </div>
        </>
      )}
    </StudentLayout>
  );
}

export default StudentDashboard;
