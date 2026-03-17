import { useEffect, useMemo, useState } from "react";
import AccountsLayout from "../layout/AccountsLayout";
import ReportsCard from "../components/ReportsCard";
import { accountsAPI } from "../../../config/api";

function PaymentReports() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        const response = await accountsAPI.getPaymentReport();
        if (!cancelled && response?.success) setReport(response.data || null);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load reports");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const reports = useMemo(() => {
    const totalAmount = report?.totalAmount ?? 0;
    const totalTransactions = report?.totalTransactions ?? 0;
    const averagePayment = report?.averagePayment ?? 0;
    const methods = report?.paymentMethodBreakdown || {};
    const methodSummary = Object.keys(methods).length
      ? Object.entries(methods).map(([k, v]) => `${k}: ₹${Number(v)}`).join(" • ")
      : "No breakdown available";

    return [
      { id: "total", title: "Total Revenue", description: `₹${Number(totalAmount)}` },
      { id: "tx", title: "Total Transactions", description: String(totalTransactions) },
      { id: "avg", title: "Average Payment", description: `₹${Number(averagePayment)}` },
      { id: "methods", title: "Payment Methods", description: methodSummary },
      { id: "details", title: "Details", description: "See All Payments for the full list" },
    ];
  }, [report]);

  return (
    <AccountsLayout title="Payment Reports">
      {error ? (
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">{error}</div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <ReportsCard key={report.id} title={report.title} description={report.description} />
        ))}
      </div>
    </AccountsLayout>
  );
}

export default PaymentReports;
