import { CalendarCheck, ClipboardList, FileText, Wallet } from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  { label: "Attendance", icon: CalendarCheck, key: "attendance" },
  { label: "Homework", icon: ClipboardList, key: "homework" },
  { label: "Exam Results", icon: FileText, key: "exams" },
  { label: "Fees", icon: Wallet, key: "fees" },
];

function QuickActions({ onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map((action) => (
        <motion.button
          key={action.key}
          type="button"
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(action.key)}
          className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white/90 px-4 py-5 text-sm font-medium text-gray-700 shadow-soft dark:border-gray-800 dark:bg-gray-950/70 dark:text-gray-200"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <action.icon className="h-5 w-5" />
          </div>
          {action.label}
        </motion.button>
      ))}
    </div>
  );
}

export default QuickActions;
