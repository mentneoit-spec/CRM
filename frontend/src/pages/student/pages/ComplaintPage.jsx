import StudentLayout from "../layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

function ComplaintPage() {
  return (
    <StudentLayout title="Complaints">
      <Card>
        <CardHeader>
          <CardTitle>Submit Complaint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Subject" />
          <textarea
            rows={4}
            className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500"
            placeholder="Describe your issue"
          />
          <Button type="button" className="w-full">
            Submit
          </Button>
        </CardContent>
      </Card>
    </StudentLayout>
  );
}

export default ComplaintPage;
