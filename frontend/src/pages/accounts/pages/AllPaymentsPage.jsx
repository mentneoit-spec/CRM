import { useEffect, useMemo, useState } from "react";
import AccountsLayout from "../layout/AccountsLayout";
import TransactionsTable from "../components/TransactionsTable";
import { accountsAPI } from "../../../config/api";

const formatStatus = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "completed") return "Success";
  if (normalized === "pending") return "Pending";
  if (normalized === "refunded") return "Refunded";
  if (normalized === "failed") return "Failed";
  return status || "-";
};

function AllPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        const response = await accountsAPI.getPayments({ page: 1, limit: 50 });
        if (!cancelled && response?.success) setPayments(response.data || []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load payments");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    return payments.map((p) => ({
      id: p.id,
      student: p?.student?.name || "-",
      amount: `₹${Number(p.amount ?? 0)}`,
      method: p?.paymentMethod || "-",
      status: formatStatus(p?.status),
      date: p?.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-",
      __raw: p,
    }));
  }, [payments]);

  return (
    <AccountsLayout title="All Payments">
      {error ? (
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">{error}</div>
      ) : null}
      <TransactionsTable rows={rows} />
    </AccountsLayout>
  );
}

export default AllPaymentsPage;
