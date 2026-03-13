import StudentLayout from "../layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

function HomeworkPage() {
  return (
    <StudentLayout title="Homework">
      <Card>
        <CardHeader>
          <CardTitle>Homework List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400"
            >
              Subject -- | Due --
            </div>
          ))}
        </CardContent>
      </Card>
    </StudentLayout>
  );
}

export default HomeworkPage;
