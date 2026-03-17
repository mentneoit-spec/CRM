import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../config/api';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    theme: '',
    footerText: '',
    logo: '',
    favicon: '',
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      setMessage(null);
      try {
        const res = await adminAPI.getCollege();
        const college = res?.data ?? null;
        if (!mounted) return;

        setForm({
          name: college?.name || '',
          description: college?.description || '',
          email: college?.email || '',
          phone: college?.phone || '',
          address: college?.address || '',
          city: college?.city || '',
          state: college?.state || '',
          country: college?.country || '',
          pincode: college?.pincode || '',
          theme: college?.theme || '',
          footerText: college?.footerText || '',
          logo: college?.logo || '',
          favicon: college?.favicon || '',
        });
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load college settings');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const onSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await adminAPI.updateCollege(form);
      setMessage(res?.message || 'Settings updated');
    } catch (e) {
      setError(e?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>College Settings</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="College Name" fullWidth value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Email" fullWidth value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Phone" fullWidth value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Pincode" fullWidth value={form.pincode} onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Address" fullWidth value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="City" fullWidth value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="State" fullWidth value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Country" fullWidth value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} />
              </Grid>

              <Grid item xs={12}>
                <TextField label="Description" fullWidth multiline minRows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="Theme" fullWidth value={form.theme} onChange={(e) => setForm((p) => ({ ...p, theme: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Footer Text" fullWidth value={form.footerText} onChange={(e) => setForm((p) => ({ ...p, footerText: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Logo URL" fullWidth value={form.logo} onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Favicon URL" fullWidth value={form.favicon} onChange={(e) => setForm((p) => ({ ...p, favicon: e.target.value }))} />
              </Grid>

              <Grid item xs={12}>
                <Button variant="contained" onClick={onSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Settings'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default AdminSettings;
