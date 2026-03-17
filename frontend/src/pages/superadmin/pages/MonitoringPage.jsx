import { useEffect, useMemo, useState } from "react";
import SuperAdminLayout from "../layout/SuperAdminLayout";
import MonitoringPanel from "../components/MonitoringPanel";
import { superAdminAPI } from "../../../config/api";

function MonitoringPage() {
  const [analytics, setAnalytics] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        const [analyticsRes, collegesRes] = await Promise.all([
          superAdminAPI.getAnalytics(),
          superAdminAPI.getColleges({ page: 1, limit: 50 }),
        ]);

        if (cancelled) return;
        if (analyticsRes?.success) setAnalytics(analyticsRes.data || null);
        if (collegesRes?.success) setColleges(collegesRes.data || []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load monitoring data");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const props = useMemo(() => {
    const activeSessions = colleges.map((c) => ({
      college: c.name,
      users: c?._count?.Users ?? 0,
    }));

    const platformAnalytics = [
      { label: "Total colleges", value: analytics?.colleges?.total ?? 0 },
      { label: "Active colleges", value: analytics?.colleges?.active ?? 0 },
      { label: "Users", value: analytics?.users ?? 0 },
      { label: "Students", value: analytics?.students ?? 0 },
      { label: "Teachers", value: analytics?.teachers ?? 0 },
      { label: "Revenue", value: `₹${Number(analytics?.revenue ?? 0)}` },
    ];

    return {
      activeSessions,
      infrastructureHealth: [],
      platformAnalytics,
      systemStatus: [],
    };
  }, [analytics, colleges]);

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Monitoring</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Platform Monitoring</h1>
        </div>
        {error ? (
          <div className="text-sm text-gray-600 dark:text-gray-300">{error}</div>
        ) : null}
        <MonitoringPanel
          activeSessions={props.activeSessions}
          infrastructureHealth={props.infrastructureHealth}
          platformAnalytics={props.platformAnalytics}
          systemStatus={props.systemStatus}
        />
      </div>
    </SuperAdminLayout>
  );
}

export default MonitoringPage;
