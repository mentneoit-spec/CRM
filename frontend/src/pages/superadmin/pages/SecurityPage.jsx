import { useEffect, useMemo, useState } from "react";
import SuperAdminLayout from "../layout/SuperAdminLayout";
import SecurityPanel from "../components/SecurityPanel";
import { superAdminAPI } from "../../../config/api";

function SecurityPage() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        const response = await superAdminAPI.getAuditLogs({ page: 1, limit: 50 });
        if (!cancelled && response?.success) setAuditLogs(response.data || []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load audit logs");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const events = useMemo(() => {
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

    return { loginAttempts: [], blockedAccounts: [], auditLogs: audit };
  }, [auditLogs]);

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Security</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Security Center</h1>
        </div>
        {error ? (
          <div className="text-sm text-gray-600 dark:text-gray-300">{error}</div>
        ) : null}
        <SecurityPanel events={events} />
      </div>
    </SuperAdminLayout>
  );
}

export default SecurityPage;
