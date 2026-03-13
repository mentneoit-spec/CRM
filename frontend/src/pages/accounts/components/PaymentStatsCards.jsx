import { BarChart3, Banknote, CreditCard, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

const cardConfig = [
  { key: "totalPayments", title: "Total Payments", icon: Banknote },
  { key: "pendingPayments", title: "Pending Payments", icon: CreditCard },
  { key: "totalRevenue", title: "Total Revenue", icon: BarChart3 },
  { key: "refundRequests", title: "Refund Requests", icon: RotateCcw },
];

function PaymentStatsCards({ stats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cardConfig.map((card) => (
        <Card key={card.key} className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{card.title}</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              <card.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats?.[card.key] ?? "--"}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default PaymentStatsCards;
