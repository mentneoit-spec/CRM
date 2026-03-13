import ParentLayout from "../layout/ParentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

function AttendancePage() {
  return (
    <ParentLayout title="Attendance">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-44 rounded-2xl border border-dashed border-indigo-200 bg-gradient-to-b from-indigo-50 to-transparent dark:border-indigo-500/20 dark:from-indigo-500/10" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Calendar view will render here.</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Percentage</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">--%</p>
          </div>
          <div className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            On track
          </div>
        </CardContent>
      </Card>
    </ParentLayout>
  );
}

export default AttendancePage;
