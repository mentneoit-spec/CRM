import { NavLink } from "react-router-dom";
import { Banknote, BarChart3, FileText, Home, Receipt, RotateCcw, UploadCloud, UserRound, Settings } from "lucide-react";
import { cn } from "../../../lib/utils";

const sidebarItems = [
  { label: "Dashboard", icon: Home, to: "/accounts/dashboard" },
  { label: "All Payments", icon: Banknote, to: "/accounts/payments" },
  { label: "Razorpay Transactions", icon: Receipt, to: "/accounts/razorpay" },
  { label: "Manual Payments", icon: UploadCloud, to: "/accounts/manual" },
  { label: "Refunds", icon: RotateCcw, to: "/accounts/refunds" },
  { label: "Payment Reports", icon: BarChart3, to: "/accounts/reports" },
  { label: "Export CSV", icon: FileText, to: "/accounts/export" },
  { label: "Profile", icon: UserRound, to: "/accounts/profile" },
  { label: "Settings", icon: Settings, to: "/accounts/settings" },
];

function AccountsSidebar() {
  return (
    <aside className="hidden w-64 flex-col gap-5 border-r border-gray-200 bg-white/80 p-6 backdrop-blur dark:border-gray-900 dark:bg-gray-950/70 lg:flex">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Accounts Team</p>
        <h2 className="text-lg font-semibold">Navigation</h2>
      </div>
      <div className="space-y-1">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-600 transition hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-indigo-500/10",
                isActive && "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}

export default AccountsSidebar;
