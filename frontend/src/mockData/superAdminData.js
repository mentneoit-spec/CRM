export const dashboardStats = {
  totalColleges: 24,
  totalStudents: 12340,
  totalRevenue: "$42,300",
  activeAdmins: 19,
};

export const colleges = [
  {
    id: 1,
    name: "Green Valley School",
    admin: "admin@greenvalley.edu",
    plan: "Premium",
    storage: "3.4 GB",
    status: "Active",
    createdDate: "Mar 01, 2026",
  },
  {
    id: 2,
    name: "Sunrise Academy",
    admin: "admin@sunriseacademy.edu",
    plan: "Standard",
    storage: "1.2 GB",
    status: "Suspended",
    createdDate: "Feb 18, 2026",
  },
  {
    id: 3,
    name: "Riverside Public School",
    admin: "admin@riverside.edu",
    plan: "Enterprise",
    storage: "5.8 GB",
    status: "Active",
    createdDate: "Jan 24, 2026",
  },
];

export const activeSessions = [
  { college: "Green Valley School", users: 120 },
  { college: "Riverside Public School", users: 96 },
  { college: "Sunrise Academy", users: 42 },
];

export const infrastructureHealth = [
  { service: "API Gateway", status: "Healthy" },
  { service: "File Storage", status: "Healthy" },
  { service: "Payments", status: "Degraded" },
];

export const platformAnalytics = [
  { label: "Signups", value: "1,240" },
  { label: "Active Users", value: "8,930" },
  { label: "Avg Session", value: "12m" },
];

export const systemStatus = [
  { label: "Uptime", value: "99.98%" },
  { label: "Latency", value: "124 ms" },
  { label: "Incidents", value: "0" },
];

export const securityEvents = {
  loginAttempts: [
    { id: 1, message: "2FA required for admin@greenvalley.edu", time: "10 min ago" },
    { id: 2, message: "Login verified from new device", time: "1 hr ago" },
  ],
  blockedAccounts: [
    { id: 1, message: "Blocked: student_124 (multiple failed attempts)", time: "2 hr ago" },
  ],
  auditLogs: [
    { id: 1, message: "Plan upgraded for Riverside Public School", time: "Today" },
    { id: 2, message: "Storage limits updated for Green Valley School", time: "Yesterday" },
  ],
};
