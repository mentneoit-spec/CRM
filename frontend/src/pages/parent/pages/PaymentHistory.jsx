import ParentLayout from "../layout/ParentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

function PaymentHistory() {
  return (
    <ParentLayout title="Payment History">
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            Payment history will appear here.
          </div>
        </CardContent>
      </Card>
    </ParentLayout>
  );
}

export default PaymentHistory;
