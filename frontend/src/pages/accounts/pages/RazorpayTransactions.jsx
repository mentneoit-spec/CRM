import { useEffect, useMemo, useState } from "react";
import AccountsLayout from "../layout/AccountsLayout";
import TransactionsTable from "../components/TransactionsTable";
import { Button } from "../../../components/ui/button";
import { accountsAPI } from "../../../config/api";

const filters = ["All", "Success", "Pending", "Failed"];

const formatStatus = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "completed") return "Success";
  if (normalized === "pending") return "Pending";
  if (normalized === "failed") return "Failed";
  return status || "-";
};

function RazorpayTransactions() {
  const [filter, setFilter] = useState("All");
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        const response = await accountsAPI.getPayments({ page: 1, limit: 100 });
        if (!cancelled && response?.success) setPayments(response.data || []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load transactions");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    return payments
      .filter((p) => String(p?.paymentMethod || "").toLowerCase() === "razorpay")
      .map((p) => ({
        id: p.id,
        student: p?.student?.name || "-",
        amount: `₹${Number(p.amount ?? 0)}`,
        method: p?.paymentMethod || "-",
        status: formatStatus(p?.status),
        date: p?.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-",
        __raw: p,
      }));
  }, [payments]);

  const filtered = useMemo(() => {
    if (filter === "All") {
      return rows;
    }
    return rows.filter((row) => row.status === filter);
  }, [filter, rows]);

  return (
    <AccountsLayout title="Razorpay Transactions">
      {error ? (
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">{error}</div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Button
            key={item}
            type="button"
            variant={filter === item ? "default" : "outline"}
            onClick={() => setFilter(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      <TransactionsTable rows={filtered} />
    </AccountsLayout>
  );
}

export default RazorpayTransactions;
