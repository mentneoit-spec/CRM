import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ScrollArea } from "../../../components/ui/scroll-area";
import EmptyState from "./EmptyState";

const panels = [
  {
    key: "loginAttempts",
    title: "Recent Login Attempts",
    description: "Track authentication activity across the platform.",
  },
  {
    key: "blockedAccounts",
    title: "Blocked Accounts",
    description: "Review accounts flagged for suspicious behavior.",
  },
  {
    key: "auditLogs",
    title: "Audit Logs",
    description: "Monitor critical changes made by admins.",
  },
];

function SecurityPanel({ events }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {panels.map((panel) => (
        <Card key={panel.title} className="flex h-full flex-col">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <CardTitle>{panel.title}</CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400">{panel.description}</p>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ScrollArea className="h-48">
              <div className="space-y-3">
                {(events?.[panel.key] ?? []).length === 0 ? (
                  <EmptyState
                    title="No events yet"
                    description="Security events will appear here as soon as data is available."
                  />
                ) : (
                  events[panel.key].map((item) => (
                    <div key={item.id} className="rounded-lg border border-gray-200 bg-white/80 p-3 text-xs dark:border-gray-800 dark:bg-gray-950/60">
                      <p className="text-gray-800 dark:text-gray-200">{item.message}</p>
                      <p className="mt-1 text-gray-500 dark:text-gray-400">{item.time}</p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default SecurityPanel;
