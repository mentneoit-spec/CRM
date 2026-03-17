import { useEffect, useMemo, useState } from "react";
import { transportAPI } from "../../../config/api";
import FeeUpdateCard from "../components/FeeUpdateCard";
import TransportLayout from "../layout/TransportLayout";

function BusFeesPage() {
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState("");

  const loadRoutes = async () => {
    try {
      setError("");
      const response = await transportAPI.getRoutes();
      if (response?.success) setRoutes(response.data || []);
    } catch (e) {
      setError(e?.message || "Failed to load transport fees");
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const fees = useMemo(() => {
    return routes.map((r) => ({
      id: r.id,
      student: r.routeName,
      route: `${r.startPoint} → ${r.endPoint}`,
      feeDue: `₹${Number(r.fee ?? 0)}`,
      paymentStatus: r.isActive ? "Active" : "Inactive",
      __raw: r,
    }));
  }, [routes]);

  const handleUpdate = async (fee) => {
    const route = fee?.__raw;
    if (!route?.id) return;

    const nextFee = window.prompt("Set route fee", String(route?.fee ?? "0"));
    if (nextFee === null) return;

    try {
      setError("");
      await transportAPI.updateRoute(route.id, { fee: Number(nextFee) });
      await loadRoutes();
    } catch (e) {
      setError(e?.message || "Failed to update fee");
    }
  };

  return (
    <TransportLayout title="Transport Fees">
      {error ? (
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">{error}</div>
      ) : null}
      <FeeUpdateCard fees={fees} onUpdateFee={handleUpdate} />
    </TransportLayout>
  );
}

export default BusFeesPage;
