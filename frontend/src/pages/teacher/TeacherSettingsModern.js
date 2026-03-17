import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import { authAPI } from '../../services/api';

const TeacherSettingsModern = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canSubmit = useMemo(() => {
    return Boolean(oldPassword && newPassword && confirmPassword) && !saving;
  }, [oldPassword, newPassword, confirmPassword, saving]);

  const submit = async () => {
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword) {
      setError('Please enter your old and new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setSaving(true);
    try {
      await authAPI.changePassword({ oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password updated successfully.');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('collegeId');
    window.location.href = '/login';
  };

  return (
    <DashboardLayout role="teacher">
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Settings
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Old password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  fullWidth
                  disabled={saving}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="New password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  disabled={saving}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Confirm new password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12}>
                <Button variant="contained" fullWidth onClick={submit} disabled={!canSubmit}>
                  {saving ? 'Saving…' : 'Change Password'}
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" color="inherit" fullWidth onClick={logout}>
                  Logout
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default TeacherSettingsModern;
