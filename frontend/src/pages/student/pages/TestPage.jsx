import StudentLayout from "../layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

function TestPage() {
  return (
    <StudentLayout title="Write Test">
      <Card>
        <CardHeader>
          <CardTitle>Test Center</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            Test interface placeholder.
          </div>
          <Button type="button" className="w-full">
            Start Test
          </Button>
        </CardContent>
      </Card>
    </StudentLayout>
  );
}

export default TestPage;
