import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import TransportLayout from "../layout/TransportLayout";

function AssignBusPage() {
  return (
    <TransportLayout title="Assign Bus">
      <Card>
        <CardHeader>
          <CardTitle>Assign Bus to Route</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Select Route" />
          <Input placeholder="Select Bus" />
          <Input placeholder="Assign Driver" />
          <div className="md:col-span-2 flex justify-end">
            <Button type="button">Assign</Button>
          </div>
        </CardContent>
      </Card>
    </TransportLayout>
  );
}

export default AssignBusPage;
