import { Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

function FeesCard({ totalDue }) {
  const amount = typeof totalDue === "number" ? totalDue : null;

  return (
    <motion.div whileHover={{ y: -3 }}>
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fees Due</CardTitle>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Wallet className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">₹ {amount === null ? "--" : amount.toLocaleString()}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default FeesCard;
