import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";

function ManualPaymentForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Payment Entry</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Input placeholder="Student name" />
        <Input placeholder="Amount" />
        <Input placeholder="Payment method (Cash / Bank Transfer)" />
        <Input placeholder="Date" />
        <div className="md:col-span-2 flex justify-end">
          <Button type="button">Submit Payment</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ManualPaymentForm;
