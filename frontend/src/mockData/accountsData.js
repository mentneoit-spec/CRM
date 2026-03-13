export const paymentStats = {
  totalPayments: 1200,
  pendingPayments: 340,
  totalRevenue: "₹8,40,000",
  refundRequests: 12,
};

export const transactions = [
  {
    id: 1,
    student: "Rahul Sharma",
    amount: "₹2500",
    method: "Razorpay",
    status: "Success",
    date: "Mar 05, 2026",
    transactionId: "RPZ_001",
  },
  {
    id: 2,
    student: "Anita Verma",
    amount: "₹1800",
    method: "Cash",
    status: "Recorded",
    date: "Mar 02, 2026",
    transactionId: "MAN_002",
  },
  {
    id: 3,
    student: "Siddharth Rao",
    amount: "₹3200",
    method: "Razorpay",
    status: "Pending",
    date: "Mar 01, 2026",
    transactionId: "RPZ_003",
  },
];

export const manualPayments = [
  {
    id: 1,
    student: "Anita",
    amount: "₹1800",
    method: "Cash",
    status: "Recorded",
    date: "Mar 02, 2026",
  },
  {
    id: 2,
    student: "Kiran",
    amount: "₹2200",
    method: "Bank Transfer",
    status: "Recorded",
    date: "Mar 04, 2026",
  },
];

export const refunds = [
  {
    id: 1,
    student: "Rahul Sharma",
    amount: "₹2500",
    method: "Razorpay",
    status: "Requested",
  },
  {
    id: 2,
    student: "Meera Iyer",
    amount: "₹1500",
    method: "Bank Transfer",
    status: "Processed",
  },
];

export const reports = [
  {
    id: 1,
    title: "Daily Payment Summary",
    description: "Snapshot of daily collections and settlement status.",
  },
  {
    id: 2,
    title: "Monthly Revenue",
    description: "Month-over-month revenue trend summary.",
  },
  {
    id: 3,
    title: "Refund Report",
    description: "Track refunds and pending requests.",
  },
];
