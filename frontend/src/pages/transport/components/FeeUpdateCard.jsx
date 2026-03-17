import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

function FeeUpdateCard({ fees, onUpdateFee }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transport Fees</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {fees.map((fee) => (
          <div key={fee.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-800 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{fee.student}</p>
              <p className="text-gray-500 dark:text-gray-400">{fee.route} • {fee.feeDue}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={fee.paymentStatus === "Paid" ? "success" : "warning"}>{fee.paymentStatus}</Badge>
              <Button type="button" variant="outline" onClick={() => onUpdateFee?.(fee)} disabled={!onUpdateFee}>Update Fee</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default FeeUpdateCard;
