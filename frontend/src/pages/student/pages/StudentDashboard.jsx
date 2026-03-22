import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "../../../components/ui/skeleton";
import StudentLayout from "../layout/StudentLayout";
import StudentProfileCard from "../components/StudentProfileCard";
import QuickActions from "../components/QuickActions";
import AttendanceCard from "../components/AttendanceCard";
import HomeworkCard from "../components/HomeworkCard";
import MarksCard from "../components/MarksCard";
import FeesCard from "../components/FeesCard";
import { studentAPI } from "../../../services/api";
import { CheckCircle, Download } from "lucide-react";

function StudentDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [todayAttendanceStatus, setTodayAttendanceStatus] = useState("--");
  const [todayHomework, setTodayHomework] = useState(null);
  const [nextExam, setNextExam] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);

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

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const [profileRes, dashboardRes, attendanceRes, homeworkRes, examsRes] = await Promise.all([
          studentAPI.getProfile(),
          studentAPI.getDashboard(),
          studentAPI.getAttendance({ month, year }),
          studentAPI.getHomework(),
          studentAPI.getExams(),
        ]);

        // Fetch payment history separately
        let paymentHistoryRes;
        try {
          paymentHistoryRes = await studentAPI.getPaymentHistory({ limit: 5 });
        } catch (e) {
          paymentHistoryRes = null;
        }

        if (!isMounted) return;

        const profileData = profileRes?.data?.data ?? null;
        const dashboardData = dashboardRes?.data?.data ?? null;
        setProfile(profileData);
        setDashboard(dashboardData);

        // Set recent payments
        const payments = paymentHistoryRes?.data?.data?.payments ?? [];
        setRecentPayments(payments.slice(0, 5));

        const attendanceList = attendanceRes?.data?.data?.attendance ?? [];
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const todayRecord = attendanceList.find((r) => {
          const recordDate = new Date(r.date);
          const normalized = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate()).getTime();
          return normalized === today;
        });
        setTodayAttendanceStatus(todayRecord?.status ? String(todayRecord.status).toUpperCase() : "--");

        const homeworkList = homeworkRes?.data?.data?.homework ?? [];
        const todaysHomework = homeworkList.filter((h) => {
          const due = new Date(h.dueDate);
          return due.getFullYear() === now.getFullYear() && due.getMonth() === now.getMonth() && due.getDate() === now.getDate();
        });
        setTodayHomework(todaysHomework.length ? todaysHomework[0] : null);

        const exams = examsRes?.data?.data ?? [];
        const upcoming = exams
          .filter((e) => e?.examDate)
          .map((e) => ({ ...e, _date: new Date(e.examDate) }))
          .filter((e) => !Number.isNaN(e._date.getTime()) && e._date.getTime() >= now.getTime())
          .sort((a, b) => a._date.getTime() - b._date.getTime());
        setNextExam(upcoming.length ? upcoming[0] : null);
      } catch (e) {
        if (!isMounted) return;
        setProfile(null);
        setDashboard(null);
        setTodayAttendanceStatus("--");
        setTodayHomework(null);
        setNextExam(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const feesDue = dashboard?.stats?.fees?.totalDue;

  const homeworkCardText = useMemo(() => {
    if (!todayHomework) return { title: "No tasks assigned yet", subtitle: "Check back later" };
    return {
      title: todayHomework.title ?? "Homework assigned",
      subtitle: "Due today",
    };
  }, [todayHomework]);

  const nextExamText = useMemo(() => {
    if (!nextExam) return { label: "Subject --", dateText: "Date -- / --" };
    const date = nextExam.examDate ? new Date(nextExam.examDate) : null;
    const dateText = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : "Date -- / --";
    return {
      label: nextExam.examName ?? "Upcoming Test",
      dateText,
    };
  }, [nextExam]);

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
          <StudentProfileCard student={profile} onProfile={() => navigate("/student/profile")} />
          
          {/* Comprehensive Student Details */}
          {profile && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Student Details</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Student ID</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{profile?.studentId || "--"}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Class</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {profile?.customClassName || profile?.sclass?.sclassName || "--"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Section</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {profile?.customSectionName || profile?.section?.sectionName || "--"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Roll Number</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{profile?.rollNum || "--"}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 break-all">{profile?.email || "--"}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{profile?.phone || "--"}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "--"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{profile?.gender || "--"}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Board</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{profile?.board || "--"}</p>
                </div>
                {profile?.group && (
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Group</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{profile.group}</p>
                  </div>
                )}
                {profile?.integratedCourse && (
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Integrated Course</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{profile.integratedCourse}</p>
                  </div>
                )}
                {profile?.parentName && (
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Parent/Guardian</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{profile.parentName}</p>
                  </div>
                )}
                {profile?.parentPhone && (
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Parent Phone</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{profile.parentPhone}</p>
                  </div>
                )}
                {profile?.address && (
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900 sm:col-span-2 lg:col-span-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{profile.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <QuickActions onSelect={handleQuickAction} />
          <div className="grid gap-4 md:grid-cols-2">
            <HomeworkCard title={homeworkCardText.title} subtitle={homeworkCardText.subtitle} />
            <AttendanceCard status={todayAttendanceStatus} />
            <MarksCard label={nextExamText.label} dateText={nextExamText.dateText} />
            <FeesCard totalDue={typeof feesDue === "number" ? feesDue : null} />
          </div>

          {/* Recent Payments Section */}
          {recentPayments.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Payments</h3>
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          ₹{payment.amount?.toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {payment.notes || "Fee Payment"} • {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "Date not available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                        Completed
                      </span>
                      {payment.id && (
                        <button
                          onClick={async () => {
                            try {
                              const receiptRes = await studentAPI.downloadPaymentReceipt(payment.id);
                              const url = window.URL.createObjectURL(new Blob([receiptRes.data]));
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', `receipt-${payment.id}.pdf`);
                              document.body.appendChild(link);
                              link.click();
                              link.parentNode.removeChild(link);
                              window.URL.revokeObjectURL(url);
                            } catch (err) {
                              console.error("Failed to download receipt:", err);
                            }
                          }}
                          className="rounded-lg bg-indigo-100 p-2 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-800"
                          title="Download Receipt"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/student/fees")}
                className="mt-4 w-full rounded-lg border border-indigo-600 px-4 py-2 text-center font-medium text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
              >
                View All Payments
              </button>
            </div>
          )}
        </>
      )}
    </StudentLayout>
  );
}

export default StudentDashboard;
