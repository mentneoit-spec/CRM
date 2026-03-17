import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

function RefundForm({ refunds, onProcessRefund }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Refund Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {refunds.map((refund) => (
          <div key={refund.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-800 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{refund.student}</p>
              <p className="text-gray-500 dark:text-gray-400">{refund.method} • {refund.amount}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={refund.status === "Processed" ? "success" : "warning"}>{refund.status}</Badge>
              <Button type="button" variant="outline" onClick={() => onProcessRefund?.(refund)} disabled={!onProcessRefund}>Process Refund</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default RefundForm;
