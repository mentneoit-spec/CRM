import AccountsLayout from "../layout/AccountsLayout";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useState } from "react";
import { accountsAPI } from "../../../config/api";

function ExportCSVPage() {
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      setError("");

      const blob = await accountsAPI.exportPayments({ format: "csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "payments.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AccountsLayout title="Export CSV">
      <Card>
        <CardHeader>
          <CardTitle>Export Payments CSV</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Download payment data as CSV.</p>
          {error ? (
            <div className="text-sm text-gray-600 dark:text-gray-300">{error}</div>
          ) : null}
          <Button type="button" onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting..." : "Export Payments CSV"}
          </Button>
        </CardContent>
      </Card>
    </AccountsLayout>
  );
}

export default ExportCSVPage;
