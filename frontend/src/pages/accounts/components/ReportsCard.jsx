import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

function ReportsCard({ title, description }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-28 rounded-lg border border-dashed border-indigo-200 bg-gradient-to-b from-indigo-50 to-transparent dark:border-indigo-500/20 dark:from-indigo-500/10" />
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );
}

export default ReportsCard;
