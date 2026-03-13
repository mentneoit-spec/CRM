import { Activity, BarChart3, Cloud, Radar } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

function MonitoringPanel({ activeSessions, infrastructureHealth, platformAnalytics, systemStatus }) {
  const panels = [
    {
      title: "Active Sessions",
      icon: Activity,
      badge: `${activeSessions?.length ?? 0} colleges`,
      items: activeSessions?.map((session) => `${session.college} - ${session.users} users`) ?? [],
    },
    {
      title: "Infrastructure Health",
      icon: Cloud,
      badge: infrastructureHealth?.length ? "Live" : "No data",
      items: infrastructureHealth?.map((service) => `${service.service} - ${service.status}`) ?? [],
    },
    {
      title: "Platform Analytics",
      icon: BarChart3,
      badge: platformAnalytics?.length ? "Updated" : "No data",
      items: platformAnalytics?.map((metric) => `${metric.label}: ${metric.value}`) ?? [],
    },
    {
      title: "System Status",
      icon: Radar,
      badge: systemStatus?.length ? "Stable" : "No data",
      items: systemStatus?.map((item) => `${item.label}: ${item.value}`) ?? [],
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {panels.map((panel) => (
        <Card key={panel.title}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                <panel.icon className="h-4 w-4" />
              </div>
              <CardTitle>{panel.title}</CardTitle>
            </div>
            <Badge variant="secondary">{panel.badge}</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-28 rounded-lg border border-dashed border-indigo-200 bg-gradient-to-b from-indigo-50 to-transparent dark:border-indigo-500/20 dark:from-indigo-500/10" />
            <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
              {panel.items.length === 0 ? (
                <p>No activity yet.</p>
              ) : (
                panel.items.map((item) => <p key={item}>{item}</p>)
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default MonitoringPanel;
