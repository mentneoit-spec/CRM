import { transportFees } from "../../../mockData/transportData";
import FeeUpdateCard from "../components/FeeUpdateCard";
import TransportLayout from "../layout/TransportLayout";

function BusFeesPage() {
  return (
    <TransportLayout title="Transport Fees">
      <FeeUpdateCard fees={transportFees} />
    </TransportLayout>
  );
}

export default BusFeesPage;
