import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ParentLayout from "../layout/ParentLayout";
import StudentCard from "../components/StudentCard";
import QuickActions from "../components/QuickActions";
import TodayStatus from "../components/TodayStatus";
import ActionCards from "../components/ActionCards";
import { Skeleton } from "../../../components/ui/skeleton";
import { parentAPI } from "../../../services/api";

function ParentDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [todayAttendanceStatus, setTodayAttendanceStatus] = useState("--");

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
        </>
      )}
    </ParentLayout>
  );
}

export default ParentDashboard;
