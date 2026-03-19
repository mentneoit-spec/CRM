import ParentLayout from "../layout/ParentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { parentAPI } from "../../../services/api";

const formatMoney = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  return n.toLocaleString();
};

function FeesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState(null);
  const [student, setStudent] = useState(null);
  const [duesByYear, setDuesByYear] = useState([]);
  const [feesSummary, setFeesSummary] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const childrenRes = await parentAPI.getChildren();
        const first = childrenRes?.data?.data?.[0] ?? null;
        const id = first?.id ?? null;

        if (!id) {
          if (!isMounted) return;
          setStudentId(null);
          setStudent(null);
          setDuesByYear([]);
          setFeesSummary(null);
          return;
        }

        const feesRes = await parentAPI.getChildFees(id);
        const data = feesRes?.data?.data ?? null;

        if (!isMounted) return;
        setStudentId(id);
        setStudent(data?.student ?? null);
        setDuesByYear(Array.isArray(data?.duesByYear) ? data.duesByYear : []);
        setFeesSummary(data?.summary ?? null);
      } catch (e) {
        if (!isMounted) return;
        setStudentId(null);
        setStudent(null);
        setDuesByYear([]);
        setFeesSummary(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalPending = Number(feesSummary?.totalPending);
  const pendingAmount = Number.isFinite(totalPending) ? totalPending : 0;

  const summaryText = useMemo(() => {
    if (loading) return "Loading fees…";
    if (!feesSummary) return "No fee dues found.";
    return `Outstanding: ₹${formatMoney(pendingAmount)}`;
  }, [feesSummary, loading, pendingAmount]);

  const headerFields = useMemo(() => {
    return [
      {
        label: "Student Roll No",
        value: student?.studentId || "--",
      },
      {
        label: "Student Name",
        value: student?.name || "--",
      },
      {
        label: "Father Name",
        value: student?.parentName || "--",
      },
      {
        label: "College",
        value: student?.college?.name || "--",
      },
      {
        label: "Program",
        value: student?.integratedCourse || "--",
      },
      {
        label: "Branch",
        value: student?.group || "--",
      },
    ];
  }, [student]);

  const pay = async () => {
    if (!studentId) {
      window.alert("No student linked to this account.");
      return;
    }
    if (!Number.isFinite(pendingAmount) || pendingAmount <= 0) {
      window.alert("No pending fees to pay.");
      return;
    }

    setPaying(true);
    try {
      const res = await parentAPI.createPayment({
        studentId,
        amount: pendingAmount,
        feeType: "Fee Payment",
      });
      const data = res?.data?.data;
      window.alert(`Payment order created. Order ID: ${data?.razorpayOrderId || "--"}`);
    } catch (e) {
      const message = e?.response?.data?.message || "Failed to create payment order.";
      window.alert(message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <ParentLayout title="Fees">
      <Card>
        <CardHeader>
          <CardTitle>Student Fee Due</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
            <div className="grid gap-4 sm:grid-cols-2">
              {headerFields.map((field) => (
                <div key={field.label} className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{field.label}</p>
                  <div className="h-10 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-100">
                    {field.value}
                  </div>
                </div>
              ))}

              <div className="sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
                  <span>{summaryText}</span>
                  <Button type="button" onClick={pay} disabled={loading || paying}>
                    {paying ? "Creating Order…" : "Pay Fees"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Image</p>
              <div className="w-full max-w-[220px] rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-950">
                <div className="aspect-[4/5] w-full overflow-hidden rounded-md bg-gray-100 dark:bg-gray-900">
                  {student?.profileImage ? (
                    <img src={student.profileImage} alt="student" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                      No image
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="border-b border-gray-200 bg-indigo-600 px-4 py-2 text-sm font-semibold text-white dark:border-gray-800">
              Dues
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3">SNo</th>
                    <th className="whitespace-nowrap px-4 py-3">AccYear</th>
                    <th className="whitespace-nowrap px-4 py-3">Payable</th>
                    <th className="whitespace-nowrap px-4 py-3">Paid</th>
                    <th className="whitespace-nowrap px-4 py-3">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400" colSpan={5}>
                        Loading…
                      </td>
                    </tr>
                  ) : duesByYear.length === 0 ? (
                    <tr>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400" colSpan={5}>
                        No dues found.
                      </td>
                    </tr>
                  ) : (
                    duesByYear.map((row, idx) => (
                      <tr key={row.accYear || idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3">{row.accYear || "--"}</td>
                        <td className="px-4 py-3">₹ {formatMoney(row.payable)}</td>
                        <td className="px-4 py-3">₹ {formatMoney(row.paid)}</td>
                        <td className="px-4 py-3">₹ {formatMoney(row.due)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            View all past payments and receipts.
          </div>
          <Button type="button" variant="outline" onClick={() => navigate("/parent/payment-history")}>
            View Payment History
          </Button>
        </CardContent>
      </Card>
    </ParentLayout>
  );
}

export default FeesPage;
