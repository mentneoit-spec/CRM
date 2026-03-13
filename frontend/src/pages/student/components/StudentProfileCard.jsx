import { motion } from "framer-motion";
import { UserRound } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

function StudentProfileCard({ onProfile }) {
  return (
    <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
      <Card className="mx-auto max-w-md rounded-3xl border border-indigo-100 bg-white/90 shadow-soft dark:border-indigo-500/20 dark:bg-gray-950/70">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-white shadow-soft">
            <UserRound className="h-9 w-9" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Student Name</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Class -- | Section --</p>
          </div>
          <Button type="button" variant="outline" onClick={onProfile} className="w-full">
            View Profile
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default StudentProfileCard;
