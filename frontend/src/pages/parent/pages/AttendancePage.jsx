import ParentLayout from "../layout/ParentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { parentAPI } from "../../../services/api";

function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [percentage, setPercentage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const childrenRes = await parentAPI.getChildren();
        const studentId = childrenRes?.data?.data?.[0]?.id;
        if (!studentId) {
          if (!isMounted) return;
          setPercentage(null);
          return;
        }

        const attendanceRes = await parentAPI.getChildAttendance(studentId, { month, year });
        const pct = attendanceRes?.data?.data?.summary?.percentage;

        if (!isMounted) return;
        setPercentage(Number.isFinite(pct) ? pct : null);
      } catch (e) {
        if (!isMounted) return;
        setPercentage(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const statusText = useMemo(() => {
    if (loading) return "Loading";
    if (!Number.isFinite(percentage)) return "--";
    return `${percentage}%`;
  }, [loading, percentage]);

  const onTrack = useMemo(() => {
    if (!Number.isFinite(percentage)) return true;
    return percentage >= 75;
  }, [percentage]);

  return (
    <ParentLayout title="Attendance">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-44 rounded-2xl border border-dashed border-indigo-200 bg-gradient-to-b from-indigo-50 to-transparent dark:border-indigo-500/20 dark:from-indigo-500/10" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{loading ? "Loading attendance…" : "Attendance summary updated from records."}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Percentage</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{statusText}</p>
          </div>
          <div className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            {onTrack ? "On track" : "Needs attention"}
          </div>
        </CardContent>
      </Card>
    </ParentLayout>
  );
}

export default AttendancePage;
