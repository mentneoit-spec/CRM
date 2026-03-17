import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Button,
} from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../config/api';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState({ revenueByMonth: [], admissionsByStatus: [] });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getDashboard();
      const data = res?.data ?? null;
      setReport({
        revenueByMonth: Array.isArray(data?.revenueByMonth) ? data.revenueByMonth : [],
        admissionsByStatus: Array.isArray(data?.admissionsByStatus) ? data.admissionsByStatus : [],
      });
    } catch (e) {
      setError(e?.message || 'Failed to load reports');
      setReport({ revenueByMonth: [], admissionsByStatus: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const COLORS = ['#2e7d32', '#ed6c02', '#d32f2f'];

  return (
    <DashboardLayout role="admin">
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Reports</Typography>
          <Button variant="outlined" onClick={load} disabled={loading}>Refresh</Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Revenue Trend</Typography>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={report.revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#1976d2" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Admissions</Typography>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={report.admissionsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, value }) => `${status}: ${value}`}
                        outerRadius={90}
                        dataKey="value"
                      >
                        {report.admissionsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default AdminReports;
