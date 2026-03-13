import StudentLayout from "../layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

function FeesPage() {
  return (
    <StudentLayout title="Fees">
      <Card>
        <CardHeader>
          <CardTitle>Fee Dues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding fees will appear here.</p>
          <Button type="button" className="w-full">
            Pay Fees
          </Button>
        </CardContent>
      </Card>
    </StudentLayout>
  );
}

export default FeesPage;
