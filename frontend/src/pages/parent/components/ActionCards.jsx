import { Download, History, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  {
    label: "Download Report",
    description: "Save the latest progress report.",
    icon: Download,
    key: "download",
  },
  {
    label: "Payment History",
    description: "Review recent fee payments.",
    icon: History,
    key: "payments",
  },
  {
    label: "Submit Feedback",
    description: "Share feedback with the school.",
    icon: MessageCircle,
    key: "feedback",
  },
];

function ActionCards({ onSelect }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {actions.map((action) => (
        <motion.button
          key={action.key}
          type="button"
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(action.key)}
          className="flex w-full flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white/90 p-4 text-left shadow-soft dark:border-gray-800 dark:bg-gray-950/70"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <action.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{action.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

export default ActionCards;
