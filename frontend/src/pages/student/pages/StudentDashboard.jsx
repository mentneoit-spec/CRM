import { useNavigate } from "react-router-dom";
import { Skeleton } from "../../../components/ui/skeleton";
import StudentLayout from "../layout/StudentLayout";
import StudentProfileCard from "../components/StudentProfileCard";
import QuickActions from "../components/QuickActions";
import AttendanceCard from "../components/AttendanceCard";
import HomeworkCard from "../components/HomeworkCard";
import MarksCard from "../components/MarksCard";
import FeesCard from "../components/FeesCard";

function StudentDashboard() {
  const navigate = useNavigate();
  const isLoading = false;

  const handleQuickAction = (key) => {
    const routes = {
      homework: "/student/homework",
      test: "/student/tests",
      marks: "/student/marks",
      attendance: "/student/attendance",
    };

    if (routes[key]) {
      navigate(routes[key]);
    }
  };

  return (
    <StudentLayout title="Student Dashboard">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-52 rounded-3xl" />
          <div className="grid gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <StudentProfileCard onProfile={() => navigate("/student/profile")} />
          <QuickActions onSelect={handleQuickAction} />
          <div className="grid gap-4 md:grid-cols-2">
            <HomeworkCard />
            <AttendanceCard />
            <MarksCard />
            <FeesCard />
          </div>
        </>
      )}
    </StudentLayout>
  );
}

export default StudentDashboard;
