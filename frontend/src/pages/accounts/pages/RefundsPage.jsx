import AccountsLayout from "../layout/AccountsLayout";
import RefundForm from "../components/RefundForm";
import { refunds } from "../../../mockData/accountsData";

function RefundsPage() {
  return (
    <AccountsLayout title="Refunds">
      <RefundForm refunds={refunds} />
    </AccountsLayout>
  );
}

export default RefundsPage;
