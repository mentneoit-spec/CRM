import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { motion } from "framer-motion";

function HomeworkCard() {
  return (
    <motion.div whileHover={{ y: -3 }}>
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Homework Today</CardTitle>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <ClipboardList className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">No tasks assigned yet</p>
          <p className="mt-2 text-xs uppercase tracking-wide text-indigo-500">Check again later</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default HomeworkCard;
