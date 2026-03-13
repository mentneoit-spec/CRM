import AccountsLayout from "../layout/AccountsLayout";
import ReportsCard from "../components/ReportsCard";
import { reports } from "../../../mockData/accountsData";

function PaymentReports() {
  return (
    <AccountsLayout title="Payment Reports">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <ReportsCard key={report.id} title={report.title} description={report.description} />
        ))}
      </div>
    </AccountsLayout>
  );
}

export default PaymentReports;
