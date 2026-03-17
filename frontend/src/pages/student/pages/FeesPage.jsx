import StudentLayout from "../layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { studentAPI } from "../../../services/api";

function FeesPage() {
  const [loading, setLoading] = useState(true);
  const [feesSummary, setFeesSummary] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await studentAPI.getFees();
        const data = res?.data?.data;
        if (!isMounted) return;
        setFeesSummary(data?.summary ?? null);
      } catch (e) {
        if (!isMounted) return;
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
  const pendingCount = feesSummary?.feeCounts?.pending?.length ?? 0;
  const overdueCount = feesSummary?.feeCounts?.overdue?.length ?? 0;

  const feeText = useMemo(() => {
    if (loading) return "Loading fee dues…";
    if (!feesSummary) return "No fee dues found.";
    const pendingText = Number.isFinite(totalPending) ? `₹${totalPending}` : "--";
    return `Outstanding: ${pendingText} • Pending ${pendingCount} • Overdue ${overdueCount}`;
  }, [feesSummary, loading, overdueCount, pendingCount, totalPending]);

  return (
    <StudentLayout title="Fees">
      <Card>
        <CardHeader>
          <CardTitle>Fee Dues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{feeText}</p>
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              window.alert("Online payments are not configured for the Student portal. Please contact the office or use the Parent portal.");
            }}
          >
            Pay Fees
          </Button>
        </CardContent>
      </Card>
    </StudentLayout>
  );
}

export default FeesPage;
