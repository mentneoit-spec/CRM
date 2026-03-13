import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeftRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Database,
  FileText,
  Globe,
  KeyRound,
  Layers,
  LayoutDashboard,
  Lock,
  MonitorCheck,
  PlusCircle,
  Power,
  School,
  ShieldAlert,
  Trash2,
  UserMinus,
  UserPlus,
  Pencil,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { cn } from "../../../lib/utils";

const navSections = [
  {
    label: "Dashboard",
    items: [
      { label: "Overview", icon: LayoutDashboard, to: "/superadmin/dashboard" },
    ],
  },
  {
    label: "School / College Control",
    items: [
      { label: "Create School", icon: PlusCircle, to: "/superadmin/colleges/create" },
      { label: "Edit School", icon: Pencil, to: "/superadmin/colleges/edit" },
      { label: "Suspend / Activate", icon: Power, to: "/superadmin/colleges/status" },
      { label: "Soft Delete", icon: Trash2, to: "/superadmin/colleges/delete" },
      { label: "Assign Plan", icon: BadgeCheck, to: "/superadmin/colleges/plan" },
      { label: "Storage Limits", icon: Database, to: "/superadmin/colleges/storage" },
      { label: "Custom Domain", icon: Globe, to: "/superadmin/colleges/domain" },
      { label: "White Label", icon: Layers, to: "/superadmin/colleges/white-label" },
    ],
  },
  {
    label: "Admin Management",
    items: [
      { label: "Create Admin", icon: UserPlus, to: "/superadmin/admins" },
      { label: "Reset Password", icon: KeyRound, to: "/superadmin/admins" },
      { label: "Remove Admin", icon: UserMinus, to: "/superadmin/admins" },
      { label: "Transfer Ownership", icon: ArrowLeftRight, to: "/superadmin/admins" },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { label: "View Colleges", icon: School, to: "/superadmin/colleges" },
      { label: "Platform Analytics", icon: BarChart3, to: "/superadmin/monitoring" },
      { label: "Active Sessions", icon: Activity, to: "/superadmin/monitoring" },
      { label: "Infrastructure Health", icon: MonitorCheck, to: "/superadmin/monitoring" },
    ],
  },
  {
    label: "Security",
    items: [
      { label: "Audit Logs", icon: FileText, to: "/superadmin/security" },
      { label: "Suspicious Accounts", icon: ShieldAlert, to: "/superadmin/security" },
      { label: "Login Attempts", icon: Lock, to: "/superadmin/security" },
    ],
  },
];

function Sidebar({ collapsed, onToggle }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between px-4 pt-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-soft">
            <Bell className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Mentneo</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
            </div>
          )}
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onToggle} aria-label="Toggle sidebar">
          <motion.span
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-gray-500"
          >
            <ChevronIcon />
          </motion.span>
        </Button>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto px-2 pb-6">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6">
            {!collapsed && (
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarItem key={item.label} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SidebarItem({ item, collapsed }) {
  const content = (
    <span className="flex items-center gap-3">
      <item.icon className="h-4 w-4" />
      {!collapsed && <span className="text-sm">{item.label}</span>}
    </span>
  );

  if (item.to) {
    return (
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          cn(
            "flex items-center rounded-lg px-3 py-2 text-gray-600 transition hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-indigo-500/10",
            isActive && "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200"
          )
        }
      >
        {content}
      </NavLink>
    );
  }

  return (
    <button
      type="button"
      className="flex w-full items-center rounded-lg px-3 py-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-900"
      aria-disabled="true"
    >
      {content}
    </button>
  );
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default Sidebar;
