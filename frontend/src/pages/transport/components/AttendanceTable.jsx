import { Badge } from "../../../components/ui/badge";

function AttendanceTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3">Student Name</th>
            <th className="px-4 py-3">Route</th>
            <th className="px-4 py-3">Bus Number</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700 dark:divide-gray-900 dark:text-gray-200">
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400" colSpan={4}>
                No attendance data available.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">{row.student}</td>
                <td className="px-4 py-4">{row.route}</td>
                <td className="px-4 py-4">{row.busNumber}</td>
                <td className="px-4 py-4">
                  <Badge variant={row.status === "Present" ? "success" : "warning"}>{row.status}</Badge>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceTable;
