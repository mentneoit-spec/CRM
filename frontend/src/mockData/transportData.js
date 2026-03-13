export const transportStats = {
  totalRoutes: 6,
  totalBuses: 12,
  studentsUsingTransport: 420,
  pendingTransportFees: "₹38,500",
};

export const routes = [
  {
    id: 1,
    routeName: "Route A",
    busNumber: "TS09AB1234",
    driver: "Ramesh",
    stops: "12",
    status: "Active",
  },
  {
    id: 2,
    routeName: "Route B",
    busNumber: "TS09CD5678",
    driver: "Sita",
    stops: "9",
    status: "Active",
  },
  {
    id: 3,
    routeName: "Route C",
    busNumber: "TS09EF9012",
    driver: "Arun",
    stops: "14",
    status: "Maintenance",
  },
];

export const busAttendance = [
  {
    id: 1,
    student: "Rahul",
    route: "Route A",
    busNumber: "TS09AB1234",
    status: "Present",
  },
  {
    id: 2,
    student: "Meera",
    route: "Route B",
    busNumber: "TS09CD5678",
    status: "Absent",
  },
];

export const transportFees = [
  {
    id: 1,
    student: "Rahul",
    route: "Route A",
    feeDue: "₹1500",
    paymentStatus: "Pending",
  },
  {
    id: 2,
    student: "Meera",
    route: "Route B",
    feeDue: "₹0",
    paymentStatus: "Paid",
  },
];

export const reportCards = [
  {
    id: 1,
    title: "Monthly Transport Report",
    description: "Summary of ridership, fees, and route performance.",
  },
  {
    id: 2,
    title: "Route Usage Report",
    description: "Insights on route demand and capacity.",
  },
  {
    id: 3,
    title: "Bus Attendance Summary",
    description: "Daily attendance trends across buses.",
  },
];
