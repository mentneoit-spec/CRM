import { NavLink } from "react-router-dom";
import { CalendarCheck, ClipboardList, Home, UserRound, Wallet, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";

const navItems = [
  { label: "Home", icon: Home, to: "/parent/dashboard" },
  { label: "Attendance", icon: CalendarCheck, to: "/parent/attendance" },
  { label: "Homework", icon: ClipboardList, to: "/parent/homework" },
  { label: "Fees", icon: Wallet, to: "/parent/fees" },
  { label: "Profile", icon: UserRound, to: "/parent/profile" },
  { label: "Settings", icon: Settings, to: "/parent/settings" },
];

function BottomNavigation() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-40 w-[92%] -translate-x-1/2 rounded-2xl border border-gray-200 bg-white/90 shadow-soft backdrop-blur dark:border-gray-800 dark:bg-gray-950/80 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 text-[11px] text-gray-500 transition",
                isActive && "text-indigo-600"
              )
            }
          >
            {({ isActive }) => (
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  isActive ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10" : "text-gray-500"
                )}
              >
                <item.icon className="h-4 w-4" />
              </motion.div>
            )}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNavigation;
