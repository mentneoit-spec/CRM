import * as React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function SuperAdminLayout({ children }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="flex min-h-screen">
        <motion.aside
          animate={{ width: collapsed ? 84 : 280 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="hidden border-r border-gray-200 bg-white/80 shadow-soft backdrop-blur lg:block dark:border-gray-900 dark:bg-gray-950/70"
        >
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
        </motion.aside>
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 px-6 pb-10 pt-6">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminLayout;
