import { useNavigate } from "react-router-dom";
import ParentLayout from "../layout/ParentLayout";
import StudentCard from "../components/StudentCard";
import QuickActions from "../components/QuickActions";
import TodayStatus from "../components/TodayStatus";
import ActionCards from "../components/ActionCards";
import { Skeleton } from "../../../components/ui/skeleton";
import { parentSummary } from "../../../mockData/parentData";

function ParentDashboard() {
  const navigate = useNavigate();
  const isLoading = false;

  const handleQuickAction = (key) => {
    const routes = {
      attendance: "/parent/attendance",
      homework: "/parent/homework",
      exams: "/parent/exams",
      fees: "/parent/fees",
    };

    if (routes[key]) {
      navigate(routes[key]);
    }
  };

  const handleActionCard = (key) => {
    const routes = {
      payments: "/parent/payment-history",
      feedback: "/parent/feedback",
    };

    if (key === "download") {
      return;
    }

    if (routes[key]) {
      navigate(routes[key]);
    }
  };

  return (
    <ParentLayout title="Parent Dashboard">
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
          <StudentCard summary={parentSummary} onProfile={() => navigate("/parent/profile")} />
          <QuickActions onSelect={handleQuickAction} />
          <TodayStatus summary={parentSummary} />
          <ActionCards onSelect={handleActionCard} />
        </>
      )}
    </ParentLayout>
  );
}

export default ParentDashboard;
