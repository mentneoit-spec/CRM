import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { useState } from "react";
import { accountsAPI } from "../../../config/api";

function ManualPaymentForm() {
  const [studentId, setStudentId] = useState("");
  const [feeId, setFeeId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!studentId || !feeId || !amount || !paymentMethod) {
      setError("Student ID, Fee ID, Amount and Payment Method are required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await accountsAPI.createManualPayment({
        studentId,
        feeId,
        amount: Number(amount),
        paymentMethod,
        reference: reference || undefined,
        notes: notes || undefined,
      });

      window.alert("Payment recorded successfully");
      setStudentId("");
      setFeeId("");
      setAmount("");
      setPaymentMethod("");
      setReference("");
      setNotes("");
    } catch (e) {
      setError(e?.message || "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Payment Entry</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {error ? (
          <div className="md:col-span-2 text-sm text-gray-600 dark:text-gray-300">{error}</div>
        ) : null}

        <Input placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        <Input placeholder="Fee ID" value={feeId} onChange={(e) => setFeeId(e.target.value)} />
        <Input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Input placeholder="Payment method (Cash / Bank Transfer)" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
        <Input placeholder="Reference (optional)" value={reference} onChange={(e) => setReference(e.target.value)} />
        <Input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="md:col-span-2 flex justify-end">
          <Button type="button" onClick={handleSubmit} disabled={saving}>
            {saving ? "Submitting..." : "Submit Payment"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ManualPaymentForm;
