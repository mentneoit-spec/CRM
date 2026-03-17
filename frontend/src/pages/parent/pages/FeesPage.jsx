import ParentLayout from "../layout/ParentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { parentAPI } from "../../../services/api";

function FeesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState(null);
  const [feesSummary, setFeesSummary] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const childrenRes = await parentAPI.getChildren();
        const first = childrenRes?.data?.data?.[0] ?? null;
        const id = first?.id ?? null;
        if (!id) {
          if (!isMounted) return;
          setStudentId(null);
          setFeesSummary(null);
          return;
        }

        const feesRes = await parentAPI.getChildFees(id);
        const summary = feesRes?.data?.data?.summary ?? null;

        if (!isMounted) return;
        setStudentId(id);
        setFeesSummary(summary);
      } catch (e) {
        if (!isMounted) return;
        setStudentId(null);
        setFeesSummary(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalPending = feesSummary?.totalPending;
  const summaryText = useMemo(() => {
    if (loading) return "Loading fees…";
    if (!feesSummary) return "No fee dues found.";
    const pendingText = Number.isFinite(totalPending) ? `₹${totalPending}` : "--";
    return `Outstanding: ${pendingText}`;
  }, [feesSummary, loading, totalPending]);

  const pay = async () => {
    if (!studentId) {
      window.alert("No student linked to this account.");
      return;
    }
    if (!Number.isFinite(totalPending) || totalPending <= 0) {
      window.alert("No pending fees to pay.");
      return;
    }

    setPaying(true);
    try {
      const res = await parentAPI.createPayment({ studentId, amount: totalPending, feeType: "Fee Payment" });
      const data = res?.data?.data;
      window.alert(`Payment order created. Order ID: ${data?.razorpayOrderId || "--"}`);
    } catch (e) {
      const message = e?.response?.data?.message || "Failed to create payment order.";
      window.alert(message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <ParentLayout title="Fees">
      <Card>
        <CardHeader>
          <CardTitle>Pay Fees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{summaryText}</p>
          <Button type="button" className="w-full" onClick={pay} disabled={loading || paying}>
            {paying ? "Creating Order…" : "Pay Fees"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            No payments yet.
          </div>
          <Button type="button" variant="outline" onClick={() => navigate("/parent/payment-history")}>
            View Payment History
          </Button>
        </CardContent>
      </Card>
    </ParentLayout>
  );
}

export default FeesPage;
