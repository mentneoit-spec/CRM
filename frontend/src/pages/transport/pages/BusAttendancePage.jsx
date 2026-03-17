import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { transportAPI } from "../../../config/api";
import AttendanceTable from "../components/AttendanceTable";
import TransportLayout from "../layout/TransportLayout";

function BusAttendancePage() {
  const [buses, setBuses] = useState([]);
  const [busId, setBusId] = useState("");
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setMessage("");
        const response = await transportAPI.getBuses();
        if (cancelled) return;

        const list = response?.success ? (response.data || []) : [];
        setBuses(list);
        setBusId(list?.[0]?.id || "");
      } catch (e) {
        if (!cancelled) setMessage(e?.message || "Failed to load buses");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!busId) {
        setRows([]);
        return;
      }

      try {
        setMessage("");
        const report = await transportAPI.getBusAttendanceReport(busId);
        if (cancelled) return;

        if (report?.success && Array.isArray(report?.data)) {
          setRows(report.data);
        } else {
          setRows([]);
        }
      } catch (e) {
        if (!cancelled) {
          setMessage(e?.message || "Attendance reporting is not available");
          setRows([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [busId]);

  return (
    <TransportLayout title="Bus Attendance">
      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">Bus</div>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
            >
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.busNumber}
                </option>
              ))}
            </select>
          </div>

          {message ? (
            <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">{message}</div>
          ) : null}

          <AttendanceTable rows={rows} />
        </CardContent>
      </Card>
    </TransportLayout>
  );
}

export default BusAttendancePage;
