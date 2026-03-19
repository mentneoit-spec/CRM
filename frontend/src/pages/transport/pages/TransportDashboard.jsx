import { motion } from "framer-motion";
import { ClipboardList, Map, Receipt, Route, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import RouteCard from "../components/RouteCard";
import BusCard from "../components/BusCard";
import TransportLayout from "../layout/TransportLayout";
import { transportAPI } from "../../../config/api";

const quickActions = [
  { label: "Manage Routes", icon: Map, route: "/transport/routes" },
  { label: "Assign Bus", icon: Route, route: "/transport/assign-bus" },
  { label: "Bus Attendance", icon: Users, route: "/transport/attendance" },
  { label: "Update Transport Fees", icon: Receipt, route: "/transport/fees" },
  { label: "Transport Reports", icon: ClipboardList, route: "/transport/reports" },
];

function TransportDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({
    totalRoutes: 0,
    totalBuses: 0,
    totalStudents: 0,
    averageCapacityUsage: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        const response = await transportAPI.getDashboard();
        if (!cancelled && response?.success) {
          setDashboard(response.data || {});
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load transport dashboard");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(() => {
    return {
      totalRoutes: dashboard?.totalRoutes ?? 0,
      totalBuses: dashboard?.totalBuses ?? 0,
      studentsUsingTransport: dashboard?.totalStudents ?? 0,
      averageCapacityUsage: dashboard?.averageCapacityUsage ?? 0,
    };
  }, [dashboard]);

  return (
    <TransportLayout title="Transport Dashboard">
      {error ? (
        <Card>
          <CardContent className="py-4 text-sm text-gray-600 dark:text-gray-300">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RouteCard title="Total Routes" value={cards.totalRoutes} subtitle="Active routes" />
        <BusCard title="Total Buses" value={cards.totalBuses} subtitle="Fleet size" />
        <RouteCard title="Students Using Transport" value={cards.studentsUsingTransport} subtitle="Daily riders" />
        <BusCard title="Avg Capacity Usage" value={`${cards.averageCapacityUsage}%`} subtitle="Across routes" />
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Jump into key transport workflows.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => navigate("/transport/routes")}>View All Routes</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickActions.map((action) => (
          <motion.button
            key={action.label}
            type="button"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(action.route)}
            className="flex flex-col items-start gap-3 rounded-xl border border-gray-200 bg-white/90 p-4 text-left shadow-soft dark:border-gray-800 dark:bg-gray-950/70"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              <action.icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{action.label}</p>
          </motion.button>
        ))}
      </div>
    </TransportLayout>
  );
}

export default TransportDashboard;
