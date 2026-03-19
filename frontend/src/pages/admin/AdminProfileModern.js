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
  Avatar,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI, uploadAPI } from '../../config/api';
import { updateUser as updateAuthUser } from '../../redux/slices/authSlice';

const AdminProfileModern = () => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    profileImage: '',
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      setMessage(null);
      try {
        const res = await adminAPI.getProfile();
        const user = res?.data?.user || null;
        const admin = res?.data?.admin || null;
        if (!mounted) return;

        setForm({
          name: admin?.name || user?.name || '',
          email: admin?.email || user?.email || '',
          phone: admin?.phone || user?.phone || '',
          designation: admin?.designation || '',
          department: admin?.department || '',
          profileImage: admin?.profileImage || user?.profileImage || '',
        });
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load profile');
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
      const payload = {
        name: form.name,
        phone: form.phone,
        profileImage: form.profileImage,
        designation: form.designation,
        department: form.department,
      };

      const res = await adminAPI.updateProfile(payload);
      setMessage(res?.message || 'Profile updated');

      const updatedUser = res?.data?.user;
      if (updatedUser) {
        dispatch(updateAuthUser(updatedUser));
      } else {
        dispatch(updateAuthUser({ name: payload.name, phone: payload.phone, profileImage: payload.profileImage }));
      }
    } catch (e) {
      setError(e?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const onSelectPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await uploadAPI.uploadProfile(file);
      const url = res?.data?.url || res?.data?.[0]?.url || null;
      if (!url) {
        throw new Error('Upload succeeded but no URL returned');
      }
      setForm((p) => ({ ...p, profileImage: url }));
      setMessage('Profile photo uploaded. Click “Save Profile” to apply.');
    } catch (err) {
      setError(err?.message || 'Failed to upload profile photo');
    } finally {
      setUploading(false);
      // reset input so selecting the same file again still triggers onChange
      try { e.target.value = ''; } catch { /* ignore */ }
    }
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>My Profile</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Avatar
                    src={form.profileImage || undefined}
                    sx={{ width: 72, height: 72 }}
                  >
                    {String(form.name || '?').charAt(0)}
                  </Avatar>

                  <Button variant="outlined" component="label" disabled={saving || uploading}>
                    {uploading ? 'Uploading…' : 'Upload Photo'}
                    <input hidden type="file" accept="image/*" onChange={onSelectPhoto} />
                  </Button>

                  <TextField
                    label="Profile Image URL"
                    value={form.profileImage}
                    onChange={(e) => setForm((p) => ({ ...p, profileImage: e.target.value }))}
                    sx={{ minWidth: { xs: '100%', md: 420 } }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Full Name"
                  fullWidth
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  fullWidth
                  value={form.email}
                  disabled
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone"
                  fullWidth
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Designation"
                  fullWidth
                  value={form.designation}
                  onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Department"
                  fullWidth
                  value={form.department}
                  onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12}>
                <Button variant="contained" onClick={onSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Profile'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default AdminProfileModern;
