import ParentLayout from "../layout/ParentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

function FeedbackPage() {
  return (
    <ParentLayout title="Feedback">
      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Subject" />
          <textarea
            rows={4}
            className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500"
            placeholder="Share your feedback"
          />
          <Button type="button" className="w-full">
            Submit Feedback
          </Button>
        </CardContent>
      </Card>
    </ParentLayout>
  );
}

export default FeedbackPage;
