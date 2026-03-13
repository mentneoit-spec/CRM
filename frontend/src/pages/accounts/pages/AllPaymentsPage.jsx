import AccountsLayout from "../layout/AccountsLayout";
import TransactionsTable from "../components/TransactionsTable";
import { transactions } from "../../../mockData/accountsData";

function AllPaymentsPage() {
  return (
    <AccountsLayout title="All Payments">
      <TransactionsTable rows={transactions} />
    </AccountsLayout>
  );
}

export default AllPaymentsPage;
