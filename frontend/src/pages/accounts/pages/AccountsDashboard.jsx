import { motion } from "framer-motion";
import { Banknote, FileText, Receipt, RotateCcw, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import PaymentStatsCards from "../components/PaymentStatsCards";
import AccountsLayout from "../layout/AccountsLayout";
import { paymentStats } from "../../../mockData/accountsData";

const quickActions = [
  { label: "View All Payments", icon: Banknote, route: "/accounts/payments" },
  { label: "Razorpay Transactions", icon: Receipt, route: "/accounts/razorpay" },
  { label: "Manual Payment Entry", icon: UploadCloud, route: "/accounts/manual" },
  { label: "Process Refunds", icon: RotateCcw, route: "/accounts/refunds" },
  { label: "Generate Payment Reports", icon: FileText, route: "/accounts/reports" },
  { label: "Export CSV", icon: FileText, route: "/accounts/export" },
];

function AccountsDashboard() {
  const navigate = useNavigate();

  return (
    <AccountsLayout title="Accounts Dashboard">
      <PaymentStatsCards stats={paymentStats} />

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Access core finance workflows quickly.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => navigate("/accounts/payments")}>View All Payments</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickActions.map((action) => (
          <motion.button
            key={action.label}
            type="button"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(action.route)}
            className="flex flex-col items-start gap-3 rounded-xl border border-gray-200 bg-white/90 p-4 text-left shadow-soft dark:border-gray-800 dark:bg-gray-950/70"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              <action.icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{action.label}</p>
          </motion.button>
        ))}
      </div>
    </AccountsLayout>
  );
}

export default AccountsDashboard;
