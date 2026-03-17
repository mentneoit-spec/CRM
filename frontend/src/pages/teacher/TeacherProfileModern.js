import React, { useEffect, useState } from 'react';
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
import { useDispatch } from 'react-redux';
import DashboardLayout from '../../components/DashboardLayout';
import { teacherAPI } from '../../services/api';
import { updateUser as updateAuthUser } from '../../redux/slices/authSlice';

const TeacherProfileModern = () => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    qualification: '',
    experience: '',
    specialization: '',
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await teacherAPI.getProfile();
        if (cancelled) return;
        const data = res?.data?.data ?? null;
        setProfile(data);
        setForm({
          name: data?.name || '',
          phone: data?.phone || '',
          qualification: data?.qualification || '',
          experience: data?.experience?.toString?.() || '',
          specialization: data?.specialization || '',
        });
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const onChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const save = async () => {
    setError('');
    setSuccess('');

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      qualification: form.qualification.trim(),
      experience: form.experience,
      specialization: form.specialization.trim(),
    };

    if (!payload.name) {
      setError('Name is required.');
      return;
    }

    setSaving(true);
    try {
      const res = await teacherAPI.updateProfile(payload);
      const updated = res?.data?.data ?? null;
      setProfile(updated || profile);
      setSuccess(res?.data?.message || 'Profile updated successfully.');

      // Keep auth sidebar/header in sync
      dispatch(updateAuthUser({ name: payload.name, phone: payload.phone }));
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const subjectCount = profile?._count?.Subjects ?? null;
  const homeworkCount = profile?._count?.Homeworks ?? null;

  return (
    <DashboardLayout role="teacher">
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          My Profile
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Full name"
                  value={form.name}
                  onChange={onChange('name')}
                  fullWidth
                  disabled={loading || saving}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone"
                  value={form.phone}
                  onChange={onChange('phone')}
                  fullWidth
                  disabled={loading || saving}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Qualification"
                  value={form.qualification}
                  onChange={onChange('qualification')}
                  fullWidth
                  disabled={loading || saving}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Experience (years)"
                  value={form.experience}
                  onChange={onChange('experience')}
                  fullWidth
                  disabled={loading || saving}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Specialization"
                  value={form.specialization}
                  onChange={onChange('specialization')}
                  fullWidth
                  disabled={loading || saving}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                  {subjectCount !== null ? (
                    <Typography variant="body2" color="text.secondary">
                      Subjects: {subjectCount}
                    </Typography>
                  ) : null}
                  {homeworkCount !== null ? (
                    <Typography variant="body2" color="text.secondary">
                      Homeworks: {homeworkCount}
                    </Typography>
                  ) : null}
                </Box>
                <Button
                  variant="contained"
                  onClick={save}
                  disabled={loading || saving}
                  fullWidth
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default TeacherProfileModern;
