import StudentLayout from "../layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

function AttendancePage() {
  return (
    <StudentLayout title="Attendance">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-44 rounded-2xl border border-dashed border-indigo-200 bg-gradient-to-b from-indigo-50 to-transparent dark:border-indigo-500/20 dark:from-indigo-500/10" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Calendar view will render here.</p>
        </CardContent>
      </Card>
    </StudentLayout>
  );
}

export default AttendancePage;
