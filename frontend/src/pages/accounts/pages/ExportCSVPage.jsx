import AccountsLayout from "../layout/AccountsLayout";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { transactions } from "../../../mockData/accountsData";

function ExportCSVPage() {
  const handleExport = () => {
    const header = "Student,Amount,Method,Status,Date";
    const rows = transactions.map((item) => `${item.student},${item.amount},${item.method},${item.status},${item.date}`).join("\n");
    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "payments.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AccountsLayout title="Export CSV">
      <Card>
        <CardHeader>
          <CardTitle>Export Payments CSV</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Download mock payment data as CSV.</p>
          <Button type="button" onClick={handleExport}>Export Payments CSV</Button>
        </CardContent>
      </Card>
    </AccountsLayout>
  );
}

export default ExportCSVPage;
