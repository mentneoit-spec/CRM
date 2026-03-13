import SuperAdminLayout from "../layout/SuperAdminLayout";
import SecurityPanel from "../components/SecurityPanel";
import { securityEvents } from "../../../mockData/superAdminData";

function SecurityPage() {
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Security</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Security Center</h1>
        </div>
        <SecurityPanel events={securityEvents} />
      </div>
    </SuperAdminLayout>
  );
}

export default SecurityPage;
