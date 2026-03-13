import { ArrowUpRight, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import DashboardCards from "../components/DashboardCards";
import MonitoringPanel from "../components/MonitoringPanel";
import SecurityPanel from "../components/SecurityPanel";
import SuperAdminLayout from "../layout/SuperAdminLayout";
import {
  dashboardStats,
  activeSessions,
  infrastructureHealth,
  platformAnalytics,
  systemStatus,
  securityEvents,
} from "../../../mockData/superAdminData";

function SuperAdminDashboard() {
  const navigate = useNavigate();

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
            activeSessions={activeSessions}
            infrastructureHealth={infrastructureHealth}
            platformAnalytics={platformAnalytics}
            systemStatus={systemStatus}
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
