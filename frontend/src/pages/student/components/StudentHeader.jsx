import { Bell } from "lucide-react";
import { Button } from "../../../components/ui/button";
import ThemeToggle from "./ThemeToggle";

function StudentHeader({ title }) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/70 px-5 py-4 backdrop-blur-xl dark:border-gray-900 dark:bg-gray-950/60">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Student App</p>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default StudentHeader;
