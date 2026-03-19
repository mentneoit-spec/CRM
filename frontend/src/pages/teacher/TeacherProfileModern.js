import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Avatar,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import DashboardLayout from '../../components/DashboardLayout';
import { teacherAPI, uploadAPI } from '../../services/api';
import { updateUser as updateAuthUser } from '../../redux/slices/authSlice';

const TeacherProfileModern = () => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    qualification: '',
    experience: '',
    specialization: '',
    profileImage: '',
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
          profileImage: data?.profileImage || '',
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
      profileImage: form.profileImage,
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
      dispatch(updateAuthUser({ name: payload.name, phone: payload.phone, profileImage: payload.profileImage }));
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const onSelectPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const res = await uploadAPI.uploadProfile(file);
      const url = res?.data?.data?.url || res?.data?.data?.[0]?.url || res?.data?.url || null;
      if (!url) throw new Error('Upload succeeded but no URL returned');
      setForm((prev) => ({ ...prev, profileImage: url }));
      setSuccess('Profile photo uploaded. Click “Save Changes” to apply.');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
      try { e.target.value = ''; } catch { /* ignore */ }
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
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Avatar src={form.profileImage || undefined} sx={{ width: 72, height: 72 }}>
                    {String(form.name || '?').charAt(0)}
                  </Avatar>
                  <Button variant="outlined" component="label" disabled={loading || saving || uploading}>
                    {uploading ? 'Uploading…' : 'Upload Photo'}
                    <input hidden type="file" accept="image/*" onChange={onSelectPhoto} />
                  </Button>
                  <TextField
                    label="Profile Image URL"
                    value={form.profileImage}
                    onChange={onChange('profileImage')}
                    sx={{ minWidth: { xs: '100%', md: 420 } }}
                    disabled={loading || saving}
                  />
                </Box>
              </Grid>

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
