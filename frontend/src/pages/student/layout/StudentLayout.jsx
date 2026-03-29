import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../../lib/utils";
import StudentHeader from "../components/StudentHeader";
import BottomNavigation from "../components/BottomNavigation";
import { CalendarCheck, ClipboardList, FileText, Home, MessageCircle, UserRound, Wallet, Medal, Settings, Sparkles } from "lucide-react";

const sidebarItems = [
  { label: "Dashboard", icon: Home, to: "/student/dashboard" },
  { label: "AI Assistant", icon: Sparkles, to: "/student/ai", badge: "NEW" },
  { label: "Homework", icon: ClipboardList, to: "/student/homework" },
  { label: "Tests", icon: FileText, to: "/student/tests" },
  { label: "Marks", icon: Medal, to: "/student/marks" },
  { label: "Attendance", icon: CalendarCheck, to: "/student/attendance" },
  { label: "Fees", icon: Wallet, to: "/student/fees" },
  { label: "Profile", icon: UserRound, to: "/student/profile" },
  { label: "Settings", icon: Settings, to: "/student/settings" },
  { label: "Complaints", icon: MessageCircle, to: "/student/complaints" },
];

function StudentLayout({ title, children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col gap-5 border-r border-gray-200 bg-white/80 p-6 backdrop-blur dark:border-gray-900 dark:bg-gray-950/70 lg:flex">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Student App</p>
            <h2 className="text-lg font-semibold">Navigation</h2>
          </div>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-gray-600 transition hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-indigo-500/10",
                    isActive && "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200"
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="inline-block rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </aside>
        <div className="flex flex-1 flex-col">
          <StudentHeader title={title} />
          <main className="flex-1 px-5 pb-24 pt-6 lg:px-10 lg:pb-10">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}

export default StudentLayout;
