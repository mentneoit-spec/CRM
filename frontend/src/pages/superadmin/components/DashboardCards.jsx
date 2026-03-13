import { ArrowUpRight, Building2, Coins, Users } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

const cardConfig = [
  {
    key: "totalColleges",
    title: "Total Colleges",
    icon: Building2,
    route: "/superadmin/colleges",
  },
  {
    key: "totalStudents",
    title: "Total Students",
    icon: Users,
    route: "/superadmin/monitoring",
  },
  {
    key: "totalRevenue",
    title: "Total Revenue",
    icon: Coins,
    route: "/superadmin/monitoring",
  },
  {
    key: "activeAdmins",
    title: "Active Admins",
    icon: ArrowUpRight,
    route: "/superadmin/admins",
  },
];

function DashboardCards({ stats, onNavigate }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cardConfig.map((card) => (
        <button
          key={card.key}
          type="button"
          onClick={() => onNavigate?.(card.route)}
          className="text-left"
        >
          <Card className="group">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{card.title}</CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300">
                <card.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                {stats?.[card.key] ?? "--"}
              </div>
              <Badge variant="secondary">Updated today</Badge>
            </CardContent>
          </Card>
        </button>
      ))}
    </div>
  );
}

export default DashboardCards;
