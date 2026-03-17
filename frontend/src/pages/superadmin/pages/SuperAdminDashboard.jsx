import { ArrowUpRight, PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import DashboardCards from "../components/DashboardCards";
import MonitoringPanel from "../components/MonitoringPanel";
import SecurityPanel from "../components/SecurityPanel";
import SuperAdminLayout from "../layout/SuperAdminLayout";
import { superAdminAPI } from "../../../config/api";

function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        const [analyticsRes, collegesRes, logsRes] = await Promise.all([
          superAdminAPI.getAnalytics(),
          superAdminAPI.getColleges({ page: 1, limit: 50 }),
          superAdminAPI.getAuditLogs({ page: 1, limit: 20 }),
        ]);

        if (cancelled) return;
        if (analyticsRes?.success) setAnalytics(analyticsRes.data || null);
        if (collegesRes?.success) setColleges(collegesRes.data || []);
        if (logsRes?.success) setAuditLogs(logsRes.data || []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load super admin dashboard");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const dashboardStats = useMemo(() => {
    return {
      totalColleges: analytics?.colleges?.total ?? colleges.length ?? 0,
      totalStudents: analytics?.students ?? 0,
      totalRevenue: analytics?.revenue ?? 0,
      activeAdmins: 0,
    };
  }, [analytics, colleges.length]);

  const monitoringProps = useMemo(() => {
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

    const systemStatus = [
      { label: "Audit logs", value: auditLogs.length ? "Available" : "No data" },
    ];

    return {
      activeSessions,
      infrastructureHealth: [],
      platformAnalytics,
      systemStatus,
    };
  }, [analytics, auditLogs.length, colleges]);

  const securityEvents = useMemo(() => {
    const audit = auditLogs.map((log) => {
      const who = log?.user?.name || log?.user?.email || "System";
      const where = log?.college?.name ? ` (${log.college.name})` : "";
      const message = `${log.action} ${log.entityType}${where} by ${who}`;
      const time = log?.createdAt ? new Date(log.createdAt).toLocaleString() : "";

      return {
        id: log.id,
        message,
        time,
      };
    });

    return {
      loginAttempts: [],
      blockedAccounts: [],
      auditLogs: audit,
    };
  }, [auditLogs]);

  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Super Admin Overview</p>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Platform Command Center</h1>
          </div>
          <Button type="button" className="gap-2" onClick={() => navigate("/superadmin/colleges/create")}
          >
            <PlusCircle className="h-4 w-4" />
            Create School
          </Button>
        </div>

        {error ? (
          <Card>
            <CardContent className="py-4 text-sm text-gray-600 dark:text-gray-300">{error}</CardContent>
          </Card>
        ) : null}

        <DashboardCards stats={dashboardStats} onNavigate={navigate} />

        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
            <div>
              <h2 className="text-xl font-semibold">Priority Queue</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approvals and alerts waiting for review.</p>
            </div>
            <Button type="button" variant="outline" className="gap-2" onClick={() => navigate("/superadmin/security")}>
              View Alerts
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Monitoring</h2>
          <MonitoringPanel
            activeSessions={monitoringProps.activeSessions}
            infrastructureHealth={monitoringProps.infrastructureHealth}
            platformAnalytics={monitoringProps.platformAnalytics}
            systemStatus={monitoringProps.systemStatus}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Security</h2>
          <SecurityPanel events={securityEvents} />
        </div>
      </div>
    </SuperAdminLayout>
  );
}

export default SuperAdminDashboard;
