import { Badge } from "../../../components/ui/badge";

function TransactionsTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3">Student Name</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Method</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700 dark:divide-gray-900 dark:text-gray-200">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">{row.student}</td>
              <td className="px-4 py-4">{row.amount}</td>
              <td className="px-4 py-4">{row.method}</td>
              <td className="px-4 py-4">
                <Badge variant={row.status === "Success" || row.status === "Recorded" ? "success" : row.status === "Pending" ? "warning" : "danger"}>
                  {row.status}
                </Badge>
              </td>
              <td className="px-4 py-4">{row.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionsTable;
