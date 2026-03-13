import TransportLayout from "../layout/TransportLayout";
import ReportCard from "../components/ReportCard";
import { reportCards } from "../../../mockData/transportData";

function TransportReports() {
  return (
    <TransportLayout title="Transport Reports">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportCards.map((report) => (
          <ReportCard key={report.id} title={report.title} description={report.description} />
        ))}
      </div>
    </TransportLayout>
  );
}

export default TransportReports;
