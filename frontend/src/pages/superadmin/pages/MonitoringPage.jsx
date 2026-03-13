import SuperAdminLayout from "../layout/SuperAdminLayout";
import MonitoringPanel from "../components/MonitoringPanel";
import { activeSessions, infrastructureHealth, platformAnalytics, systemStatus } from "../../../mockData/superAdminData";

function MonitoringPage() {
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Monitoring</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Platform Monitoring</h1>
        </div>
        <MonitoringPanel
          activeSessions={activeSessions}
          infrastructureHealth={infrastructureHealth}
          platformAnalytics={platformAnalytics}
          systemStatus={systemStatus}
        />
      </div>
    </SuperAdminLayout>
  );
}

export default MonitoringPage;
