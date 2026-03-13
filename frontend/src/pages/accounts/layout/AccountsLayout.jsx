import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import AccountsHeader from "../components/AccountsHeader";
import AccountsSidebar from "../components/AccountsSidebar";

function AccountsLayout({ title, children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="flex min-h-screen">
        <AccountsSidebar />
        <div className="flex flex-1 flex-col">
          <AccountsHeader title={title} />
          <main className="flex-1 px-6 pb-10 pt-6">
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
    </div>
  );
}

export default AccountsLayout;
