import StudentLayout from "../layout/StudentLayout";
import { Card, CardContent } from "../../../components/ui/card";
import { UserRound } from "lucide-react";

function StudentProfile() {
  return (
    <StudentLayout title="Profile">
      <Card className="rounded-3xl">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-white">
            <UserRound className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Student Name</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Class -- | Section --</p>
          </div>
        </CardContent>
      </Card>
    </StudentLayout>
  );
}

export default StudentProfile;
