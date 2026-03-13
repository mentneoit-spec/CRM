import { useMemo, useState } from "react";
import AccountsLayout from "../layout/AccountsLayout";
import TransactionsTable from "../components/TransactionsTable";
import { transactions } from "../../../mockData/accountsData";
import { Button } from "../../../components/ui/button";

const filters = ["All", "Success", "Pending", "Failed"];

function RazorpayTransactions() {
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    if (filter === "All") {
      return transactions.filter((row) => row.method === "Razorpay");
    }
    return transactions.filter((row) => row.method === "Razorpay" && row.status === filter);
  }, [filter]);

  return (
    <AccountsLayout title="Razorpay Transactions">
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Button
            key={item}
            type="button"
            variant={filter === item ? "default" : "outline"}
            onClick={() => setFilter(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      <TransactionsTable rows={filtered} />
    </AccountsLayout>
  );
}

export default RazorpayTransactions;
