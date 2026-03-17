import { useEffect, useMemo, useState } from "react";
import TransportLayout from "../layout/TransportLayout";
import ReportCard from "../components/ReportCard";
import { transportAPI } from "../../../config/api";

function TransportReports() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        const response = await transportAPI.getDashboard();
        if (!cancelled && response?.success) setDashboard(response.data || null);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load reports");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const reportCards = useMemo(() => {
    const totalRoutes = dashboard?.totalRoutes ?? 0;
    const totalBuses = dashboard?.totalBuses ?? 0;
    const totalStudents = dashboard?.totalStudents ?? 0;
    const avg = dashboard?.averageCapacityUsage ?? 0;

    return [
      { id: "routes", title: "Routes Summary", description: `Total routes: ${totalRoutes}` },
      { id: "fleet", title: "Fleet Summary", description: `Total buses: ${totalBuses}` },
      { id: "usage", title: "Usage", description: `Students using transport: ${totalStudents}` },
      { id: "capacity", title: "Capacity", description: `Average capacity usage: ${avg}%` },
      { id: "attendance", title: "Attendance", description: "Attendance reporting depends on schema support" },
      { id: "fees", title: "Fees", description: "Route fees can be configured per route" },
    ];
  }, [dashboard]);

  return (
    <TransportLayout title="Transport Reports">
      {error ? (
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">{error}</div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportCards.map((report) => (
          <ReportCard key={report.id} title={report.title} description={report.description} />
        ))}
      </div>
    </TransportLayout>
  );
}

export default TransportReports;
