import AttendanceCard from "./AttendanceCard";
import HomeworkCard from "./HomeworkCard";

function TodayStatus({ summary }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Today</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Latest updates for your student.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <AttendanceCard summary={summary} />
        <HomeworkCard />
      </div>
    </div>
  );
}

export default TodayStatus;
