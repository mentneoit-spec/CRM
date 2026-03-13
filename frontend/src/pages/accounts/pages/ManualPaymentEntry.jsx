import AccountsLayout from "../layout/AccountsLayout";
import ManualPaymentForm from "../components/ManualPaymentForm";

function ManualPaymentEntry() {
  return (
    <AccountsLayout title="Manual Payment Entry">
      <ManualPaymentForm />
    </AccountsLayout>
  );
}

export default ManualPaymentEntry;
