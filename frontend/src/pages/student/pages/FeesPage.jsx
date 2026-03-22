import StudentLayout from "../layout/StudentLayout";
import { useEffect, useState } from "react";
import { studentAPI } from "../../../services/api";
import { CreditCard, CheckCircle, AlertTriangle, Clock, X, Loader } from "lucide-react";
import { cn } from "../../../lib/utils";

function FeesPage() {
  const [loading, setLoading] = useState(true);
  const [feesData, setFeesData] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await studentAPI.getFees();
        const data = res?.data?.data;
        if (!isMounted) return;
        setFeesData(data ?? null);
      } catch (e) {
        if (!isMounted) return;
        setFeesData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const summary = feesData?.summary;
  const fees = feesData?.fees || [];

  // Group fees by type
  const feesByType = {};
  fees.forEach((fee) => {
    if (!feesByType[fee.feeType]) {
      feesByType[fee.feeType] = [];
    }
    feesByType[fee.feeType].push(fee);
  });

  const handlePaymentClick = (fee) => {
    setSelectedFee(fee);
    setShowPaymentDialog(true);
  };

  const handleCloseDialog = () => {
    setShowPaymentDialog(false);
    setSelectedFee(null);
    setPaymentAmount("");
    setPaymentError("");
  };

  const handlePaymentSubmit = async () => {
    if (!selectedFee || !paymentAmount) {
      setPaymentError("Please enter amount");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedFee.pendingAmount) {
      setPaymentError(`Amount must be between ₹1 and ₹${selectedFee.pendingAmount}`);
      return;
    }

    setPaymentLoading(true);
    setPaymentError("");

    try {
      // Create payment order
      const paymentRes = await studentAPI.createPayment({
        amount,
        feeType: selectedFee.feeType,
        feeId: selectedFee.id,
      });

      const { razorpayOrderId } = paymentRes.data.data;

      // Open Razorpay checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        order_id: razorpayOrderId,
        amount: amount * 100,
        currency: "INR",
        name: "School Fees Payment",
        description: `Payment for ${selectedFee.feeType}`,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyRes = await studentAPI.verifyPayment({
              razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            const paymentId = verifyRes?.data?.data?.id;

            // Refresh fees data
            const res = await studentAPI.getFees();
            setFeesData(res?.data?.data ?? null);

            // Close dialog
            handleCloseDialog();
            
            // Auto-download receipt
            if (paymentId) {
              try {
                const receiptRes = await studentAPI.downloadPaymentReceipt(paymentId);
                // Create blob URL and trigger download
                const url = window.URL.createObjectURL(new Blob([receiptRes.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `receipt-${paymentId}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
              } catch (err) {
                console.log("Receipt download initiated but may not be available yet");
              }
            }
            
            setSuccessMessage(`Payment of ₹${amount} successful! Receipt downloaded automatically.`);
            setTimeout(() => setSuccessMessage(""), 5000);
          } catch (error) {
            setPaymentError("Payment verification failed. Please contact support.");
            console.error("Payment verification error:", error);
          }
        },
        prefill: {
          name: "Student",
          email: "student@school.com",
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setPaymentError(error?.response?.data?.message || "Failed to create payment");
      console.error("Payment creation error:", error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusColor = (fee) => {
    if (fee.pendingAmount <= 0) return "text-green-600 bg-green-50";
    if (new Date() > new Date(fee.dueDate)) return "text-red-600 bg-red-50";
    return "text-yellow-600 bg-yellow-50";
  };

  const getStatusIcon = (fee) => {
    if (fee.pendingAmount <= 0) return <CheckCircle className="h-4 w-4" />;
    if (new Date() > new Date(fee.dueDate)) return <AlertTriangle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const getStatusLabel = (fee) => {
    if (fee.pendingAmount <= 0) return "Paid";
    if (new Date() > new Date(fee.dueDate)) return "Overdue";
    return "Pending";
  };

  if (loading) {
    return (
      <StudentLayout title="Fees">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600"></div>
        </div>
      </StudentLayout>
    );
  }

  if (!feesData || fees.length === 0) {
    return (
      <StudentLayout title="Fees">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-900 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            No fees found. Please contact the administration.
          </p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Fees">
      <div className="space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
            <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 text-white shadow-lg">
            <p className="text-sm font-medium opacity-90">Total Fees</p>
            <p className="mt-2 text-2xl font-bold">₹{summary?.totalFee?.toLocaleString() || 0}</p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-700 p-6 text-white shadow-lg">
            <p className="text-sm font-medium opacity-90">Pending Amount</p>
            <p className="mt-2 text-2xl font-bold">₹{summary?.totalPending?.toLocaleString() || 0}</p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 p-6 text-white shadow-lg">
            <p className="text-sm font-medium opacity-90">Amount Paid</p>
            <p className="mt-2 text-2xl font-bold">₹{summary?.totalPaid?.toLocaleString() || 0}</p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-700 p-6 text-white shadow-lg">
            <p className="text-sm font-medium opacity-90">Payment Progress</p>
            <p className="mt-2 text-2xl font-bold">
              {summary?.totalFee > 0 ? Math.round((summary?.totalPaid / summary?.totalFee) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Fees by Category */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Fees by Category</h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {Object.entries(feesByType).map(([feeType, typeFees]) => {
              const totalAmount = typeFees.reduce((sum, f) => sum + f.amount, 0);
              const totalPaid = typeFees.reduce((sum, f) => sum + f.paidAmount, 0);
              const totalPending = totalAmount - totalPaid;
              const progressPercent = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

              return (
                <div
                  key={feeType}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-800 dark:bg-gray-900"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 text-white">
                    <h3 className="text-lg font-bold">{feeType}</h3>
                    <p className="text-sm opacity-90">{typeFees.length} fee{typeFees.length !== 1 ? "s" : ""}</p>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="mb-2 flex justify-between">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Payment Progress</span>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Amount Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total Amount</p>
                        <p className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">₹{totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
                        <p className={cn("mt-1 text-lg font-bold", totalPending > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400")}>
                          ₹{totalPending.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Individual Fees */}
                    <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                      {typeFees.map((fee) => {
                        const paidAmount = fee.paidAmount || fee.Payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
                        const pendingAmount = fee.pendingAmount || (fee.amount - paidAmount);
                        
                        return (
                          <div
                            key={fee.id}
                            className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 dark:text-white">₹{fee.amount.toLocaleString()}</span>
                                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium", getStatusColor({...fee, pendingAmount}))}>
                                  {getStatusIcon({...fee, pendingAmount})}
                                  {getStatusLabel({...fee, pendingAmount})}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Due: {new Date(fee.dueDate).toLocaleDateString()}
                              </p>
                              {pendingAmount > 0 && (
                                <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">
                                  Remaining: ₹{pendingAmount.toLocaleString()}
                                </p>
                              )}
                              {paidAmount > 0 && (
                                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                  Paid: ₹{paidAmount.toLocaleString()}
                                </p>
                              )}
                            </div>
                            {pendingAmount > 0 && (
                              <button
                                onClick={() => handlePaymentClick({...fee, pendingAmount})}
                                className="ml-3 inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                              >
                                <CreditCard className="h-4 w-4" />
                                Pay
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Pay All Button */}
                    {totalPending > 0 && (
                      <button
                        onClick={() => {
                          alert(
                            `Pay ₹${totalPending.toLocaleString()} for ${feeType}?\n\nOnline payments are not configured for the Student portal. Please contact the office or use the Parent portal.`
                          );
                        }}
                        className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 font-semibold text-white hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600"
                      >
                        <CreditCard className="mr-2 inline h-4 w-4" />
                        Pay ₹{totalPending.toLocaleString()}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Dialog */}
        {showPaymentDialog && selectedFee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white shadow-xl dark:bg-gray-900">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pay Fee</h2>
                <button
                  onClick={handleCloseDialog}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4 p-6">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Fee Type</p>
                  <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{selectedFee.feeType}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Pending Amount</p>
                  <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">₹{selectedFee.pendingAmount.toLocaleString()}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Due Date</p>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedFee.dueDate).toLocaleDateString()}
                  </p>
                </div>

                {/* Payment Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount to Pay (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedFee.pendingAmount}
                    value={paymentAmount}
                    onChange={(e) => {
                      setPaymentAmount(e.target.value);
                      setPaymentError("");
                    }}
                    placeholder={`Max: ₹${selectedFee.pendingAmount}`}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                  />
                </div>

                {/* Error Message */}
                {paymentError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-900/20">
                    <p className="text-sm text-red-800 dark:text-red-200">{paymentError}</p>
                  </div>
                )}

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    You will be redirected to Razorpay to complete the payment securely.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                <button
                  onClick={handleCloseDialog}
                  disabled={paymentLoading}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={paymentLoading || !paymentAmount}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  {paymentLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pay Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default FeesPage;
