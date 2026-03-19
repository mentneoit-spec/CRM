import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { transportAPI } from "../../../config/api";
import TransportLayout from "../layout/TransportLayout";

function AssignBusPage() {
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routeId, setRouteId] = useState("");
  const [busId, setBusId] = useState("");
  const [driverName, setDriverName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const load = async () => {
    setError("");
    const [routesResponse, busesResponse] = await Promise.all([
      transportAPI.getRoutes(),
      transportAPI.getBuses(),
    ]);
    if (routesResponse?.success) setRoutes(routesResponse.data || []);
    if (busesResponse?.success) setBuses(busesResponse.data || []);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        setMessage("");
        const [routesResponse, busesResponse] = await Promise.all([
          transportAPI.getRoutes(),
          transportAPI.getBuses(),
        ]);

        if (cancelled) return;
        if (routesResponse?.success) setRoutes(routesResponse.data || []);
        if (busesResponse?.success) setBuses(busesResponse.data || []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load routes/buses");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAssign = async () => {
    if (!routeId || !busId) {
      setError("Please select a route and a bus");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");
      await transportAPI.updateBus(busId, {
        routeId,
        driverName: driverName || undefined,
      });
      setMessage("Bus assignment updated");
    } catch (e) {
      setError(e?.message || "Failed to assign bus");
    } finally {
      setSaving(false);
    }
  };

  const handleImportCsv = async (file) => {
    if (!file) return;
    setImporting(true);
    setError("");
    setMessage("");

    try {
      const response = await transportAPI.bulkImportBuses(file, 'update');
      const result = response?.data;
      const created = result?.created ?? 0;
      const updated = result?.updated ?? 0;
      const skipped = result?.skipped ?? 0;
      const errorCount = Array.isArray(result?.errors) ? result.errors.length : 0;
      setMessage(`Import complete: created ${created}, updated ${updated}, skipped ${skipped}, errors ${errorCount}`);
      await load();
    } catch (e) {
      setError(e?.message || "Failed to import buses CSV");
    } finally {
      setImporting(false);
    }
  };

  return (
    <TransportLayout title="Assign Bus">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Assign Bus to Route</CardTitle>
            <Button type="button" variant="outline" asChild disabled={importing}>
              <label>
                {importing ? "Importing…" : "Import CSV"}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    handleImportCsv(file);
                  }}
                />
              </label>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {error ? (
            <div className="md:col-span-2 text-sm text-gray-600 dark:text-gray-300">{error}</div>
          ) : null}

          {message ? (
            <div className="md:col-span-2 text-sm text-gray-600 dark:text-gray-300">{message}</div>
          ) : null}

          <div className="space-y-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">Select Route</div>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
            >
              <option value="">Choose a route</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.routeName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">Select Bus</div>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
            >
              <option value="">Choose a bus</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.busNumber}
                </option>
              ))}
            </select>
          </div>

          <Input
            placeholder="Assign Driver"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
          />
          <div className="md:col-span-2 flex justify-end">
            <Button type="button" onClick={handleAssign} disabled={saving}>
              {saving ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </TransportLayout>
  );
}

export default AssignBusPage;
