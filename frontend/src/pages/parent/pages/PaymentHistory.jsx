import ParentLayout from "../layout/ParentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { parentAPI } from "../../../services/api";

function PaymentHistory() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const childrenRes = await parentAPI.getChildren();
        const studentId = childrenRes?.data?.data?.[0]?.id;
        if (!studentId) {
          if (!isMounted) return;
          setPayments([]);
          return;
        }

        const paymentsRes = await parentAPI.getChildPayments(studentId, { page: 1, limit: 10 });
        const items = paymentsRes?.data?.data ?? [];

        if (!isMounted) return;
        setPayments(Array.isArray(items) ? items : []);
      } catch (e) {
        if (!isMounted) return;
        setPayments([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    if (loading) return [];
    return (payments || []).slice(0, 5);
  }, [loading, payments]);

  const formatDate = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleString();
  };

  return (
    <ParentLayout title="Payment History">
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              Loading payments…
            </div>
          ) : rows.length ? (
            <div className="space-y-3">
              {rows.map((p) => (
                <div
                  key={p?.id ?? p?.transactionId ?? `${p?.amount ?? ''}-${p?.createdAt ?? ''}`}
                  className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400"
                >
                  {p?.paymentMethod || "Payment"} • ₹{p?.amount ?? "--"} • {p?.status || "--"} • {formatDate(p?.createdAt || p?.paidAt)}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              No payments yet.
            </div>
          )}
        </CardContent>
      </Card>
    </ParentLayout>
  );
}

export default PaymentHistory;
