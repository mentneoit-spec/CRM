import StudentLayout from "../layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { studentAPI } from "../../../services/api";

function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const res = await studentAPI.getAttendance({ month, year });
        const data = res?.data?.data;

        if (!isMounted) return;
        setSummary(data?.summary ?? null);
      } catch (e) {
        if (!isMounted) return;
        setSummary(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const summaryText = useMemo(() => {
    if (loading) return "Loading attendance…";
    if (!summary) return "No attendance records found for this month.";

    const total = summary?.total ?? 0;
    const present = summary?.present ?? 0;
    const absent = summary?.absent ?? Math.max(0, total - present);
    const percentage = summary?.percentage;
    const pctText = Number.isFinite(percentage) ? `${percentage}%` : "--";

    return `This month: Present ${present}/${total} • Absent ${absent} • ${pctText}`;
  }, [loading, summary]);

  return (
    <StudentLayout title="Attendance">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-44 rounded-2xl border border-dashed border-indigo-200 bg-gradient-to-b from-indigo-50 to-transparent dark:border-indigo-500/20 dark:from-indigo-500/10" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{summaryText}</p>
        </CardContent>
      </Card>
    </StudentLayout>
  );
}

export default AttendancePage;
