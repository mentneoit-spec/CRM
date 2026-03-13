import ParentLayout from "../layout/ParentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";

function FeesPage() {
  const navigate = useNavigate();

  return (
    <ParentLayout title="Fees">
      <Card>
        <CardHeader>
          <CardTitle>Pay Fees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Razorpay integration placeholder.</p>
          <Button type="button" className="w-full">
            Pay Fees
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
