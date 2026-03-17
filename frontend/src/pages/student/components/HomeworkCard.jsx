import { ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

function HomeworkCard({ title, subtitle }) {
  const line1 = title ?? "No tasks assigned yet";
  const line2 = subtitle ?? "Check back later";

  return (
    <motion.div whileHover={{ y: -3 }}>
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Today's Homework</CardTitle>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <ClipboardList className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">{line1}</p>
          <p className="mt-2 text-xs uppercase tracking-wide text-indigo-500">{line2}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default HomeworkCard;
