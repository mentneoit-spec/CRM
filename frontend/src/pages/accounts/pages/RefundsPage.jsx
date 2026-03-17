import { useEffect, useMemo, useState } from "react";
import AccountsLayout from "../layout/AccountsLayout";
import RefundForm from "../components/RefundForm";
import { accountsAPI } from "../../../config/api";

function RefundsPage() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const response = await accountsAPI.getPayments({ status: "completed", page: 1, limit: 50 });
      if (response?.success) setPayments(response.data || []);
    } catch (e) {
      setError(e?.message || "Failed to load payments");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const refunds = useMemo(() => {
    return payments.map((p) => ({
      id: p.id,
      student: p?.student?.name || "-",
      method: p?.paymentMethod || "-",
      amount: `₹${Number(p.amount ?? 0)}`,
      status: "Pending",
      __raw: p,
    }));
  }, [payments]);

  const handleProcessRefund = async (refundItem) => {
    const payment = refundItem?.__raw;
    if (!payment?.id) return;

    const reason = window.prompt("Refund reason", "Customer request");
    if (reason === null) return;

    try {
      setError("");
      await accountsAPI.processRefund(payment.id, reason);
      window.alert("Refund initiated");
      await load();
    } catch (e) {
      setError(e?.message || "Failed to process refund");
    }
  };

  return (
    <AccountsLayout title="Refunds">
      {error ? (
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">{error}</div>
      ) : null}
      <RefundForm refunds={refunds} onProcessRefund={handleProcessRefund} />
    </AccountsLayout>
  );
}

export default RefundsPage;
