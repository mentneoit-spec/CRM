import StudentLayout from "../layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

function MarksPage() {
  return (
    <StudentLayout title="Marks">
      <Card>
        <CardHeader>
          <CardTitle>Marks Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-gray-200 bg-white/80 p-4 text-sm dark:border-gray-800 dark:bg-gray-950/60">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 dark:text-gray-100">Exam Name --</p>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">Grade --</span>
              </div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Marks: -- / --</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </StudentLayout>
  );
}

export default MarksPage;
