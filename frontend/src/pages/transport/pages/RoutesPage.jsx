import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { transportAPI } from "../../../config/api";
import TransportLayout from "../layout/TransportLayout";

function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState("");

  const loadRoutes = async () => {
    try {
      setError("");
      const response = await transportAPI.getRoutes();
      if (response?.success) setRoutes(response.data || []);
    } catch (e) {
      setError(e?.message || "Failed to load routes");
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleEdit = async (route) => {
    const routeName = window.prompt("Route name", route?.routeName || "");
    if (routeName === null) return;

    const startPoint = window.prompt("Start point", route?.startPoint || "");
    if (startPoint === null) return;

    const endPoint = window.prompt("End point", route?.endPoint || "");
    if (endPoint === null) return;

    const fee = window.prompt("Fee", String(route?.fee ?? "0"));
    if (fee === null) return;

    try {
      setError("");
      await transportAPI.updateRoute(route.id, {
        routeName,
        startPoint,
        endPoint,
        fee: Number(fee),
      });
      await loadRoutes();
    } catch (e) {
      setError(e?.message || "Failed to update route");
    }
  };

  const handleDelete = async (route) => {
    const ok = window.confirm(`Delete route "${route?.routeName}"?`);
    if (!ok) return;

    try {
      setError("");
      await transportAPI.deleteRoute(route.id);
      await loadRoutes();
    } catch (e) {
      setError(e?.message || "Failed to delete route");
    }
  };

  return (
    <TransportLayout title="Routes">
      <Card>
        <CardHeader>
          <CardTitle>Manage Routes</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">{error}</div>
          ) : null}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Route Name</th>
                  <th className="px-4 py-3">Bus Number</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Stops</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 dark:divide-gray-900 dark:text-gray-200">
                {routes.map((route) => (
                  <tr key={route.id}>
                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">{route.routeName}</td>
                    <td className="px-4 py-4">{route?.Buses?.[0]?.busNumber || "-"}</td>
                    <td className="px-4 py-4">-</td>
                    <td className="px-4 py-4">{route?.stopsCount ?? "-"}</td>
                    <td className="px-4 py-4">{route?.isActive ? "Active" : "Inactive"}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(route)}>Edit Route</Button>
                        <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(route)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </TransportLayout>
  );
}

export default RoutesPage;
