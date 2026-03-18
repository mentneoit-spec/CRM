import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  MenuItem,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School,
  ArrowBack,
  CheckCircle,
  Phone,
  Email,
  Lock,
  Person,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../config/api';

const ModernSignupEnhanced = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [resolvedCollegeId, setResolvedCollegeId] = useState(() => localStorage.getItem('collegeId') || '');
  const [showCollegeIdField, setShowCollegeIdField] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Student',
    dateOfBirth: '',
    gender: '',
    otp: '',
    admissionNumber: '', // For students
    employeeId: '', // For teachers
  });

  const requiresCollege = formData.role !== 'SuperAdmin';
  const activeCollegeId = resolvedCollegeId || localStorage.getItem('collegeId') || '';

  // Tenant auto-detection (custom domain -> collegeId)
  useEffect(() => {
    let isMounted = true;
    const tryDetectTenant = async () => {
      try {
        if (resolvedCollegeId) return;
        if (!authAPI.getTenant) return;
        const resp = await authAPI.getTenant();
        const tenantCollegeId = resp?.data?.collegeId;
        if (tenantCollegeId && isMounted) {
          localStorage.setItem('collegeId', tenantCollegeId);
          setResolvedCollegeId(tenantCollegeId);
        }
      } catch {
        // ignore (tenant detection is best-effort)
      }
    };
    tryDetectTenant();
    return () => {
      isMounted = false;
    };
  }, [resolvedCollegeId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleCollegeIdChange = (e) => {
    const value = (e.target.value || '').trim();
    setResolvedCollegeId(value);
    if (value) localStorage.setItem('collegeId', value);
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.gender) {
      setError('Please select your gender');
      return false;
    }
    if (!agreedToTerms) {
      setError('Please agree to terms and conditions');
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (requiresCollege && !activeCollegeId) {
      setShowCollegeIdField(true);
      setError('College not identified. Please enter your College ID or use your college domain.');
      return;
    }

    if (!otpVerified) {
      setError('Please verify the OTP sent to your email before creating your account.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const signupData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        admissionNumber: formData.role === 'Student' ? formData.admissionNumber : undefined,
        employeeId: formData.role === 'Teacher' ? formData.employeeId : undefined,
      };
      
      // Add collegeId for non-SuperAdmin users
      if (formData.role !== 'SuperAdmin') {
        signupData.collegeId = activeCollegeId;
      }
      
      const response = await authAPI.register(signupData);

      if (response.success) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      if (err?.requiresCollegeId) {
        setShowCollegeIdField(true);
      }
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }
    if (requiresCollege && !activeCollegeId) {
      setShowCollegeIdField(true);
      setError('Please enter your College ID to request OTP.');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.requestRegistrationOTP({
        email: formData.email,
        ...(requiresCollege && activeCollegeId ? { collegeId: activeCollegeId } : {}),
      });

      if (response.success) {
        setOtpSent(true);
        setSuccess('OTP sent to your email!');
        setError('');
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (err) {
      if (err?.requiresCollegeId) {
        setShowCollegeIdField(true);
      }
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp) {
      setError('Please enter the OTP');
      return;
    }
    if (requiresCollege && !activeCollegeId) {
      setShowCollegeIdField(true);
      setError('Please enter your College ID to verify OTP.');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.verifyRegistrationOTP({
        email: formData.email,
        otp: formData.otp,
        ...(requiresCollege && activeCollegeId ? { collegeId: activeCollegeId } : {}),
      });

      if (response.success) {
        setOtpVerified(true);
        setSuccess('Email verified successfully!');
        // User can now click "Create Account"
      } else {
        setError(response.message || 'Invalid OTP');
      }
    } catch (err) {
      if (err?.requiresCollegeId) {
        setShowCollegeIdField(true);
      }
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              position: 'absolute',
              top: 20,
              left: 20,
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            }}
          >
            <ArrowBack />
          </IconButton>
          <School sx={{ fontSize: 60, color: 'white', mb: 2 }} />
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
            Create Account
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mt: 1 }}>
            Join our school management system
          </Typography>
        </Box>

        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 4,
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError('')}
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert
              severity="success"
              onClose={() => setSuccess('')}
              sx={{ mb: 3 }}
            >
              {success}
            </Alert>
          )}

          {/* Info Alert */}
          <Alert
            icon={<Info sx={{ fontSize: 20 }} />}
            severity="info"
            sx={{ mb: 3 }}
          >
            Fill out all fields below to create your account
          </Alert>

          {/* Role Selection */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>
              I am a
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {['Student', 'Teacher', 'Parent', 'Admin'].map((role) => (
                <Chip
                  key={role}
                  label={role}
                  onClick={() => {
                    setFormData({ ...formData, role, otp: '' });
                    setOtpSent(false);
                    setOtpVerified(false);
                    setError('');
                    setSuccess('');
                  }}
                  color={formData.role === role ? 'primary' : 'default'}
                  variant={formData.role === role ? 'filled' : 'outlined'}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: formData.role === role ? 700 : 500,
                  }}
                />
              ))}
            </Stack>
          </Box>

          <form onSubmit={handleSignup}>
            <Stack spacing={2.5}>
              {requiresCollege && (!activeCollegeId || showCollegeIdField) && (
                <TextField
                  fullWidth
                  label="College ID"
                  value={resolvedCollegeId}
                  onChange={handleCollegeIdChange}
                  placeholder="Paste collegeId here"
                  variant="outlined"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <School sx={{ color: 'text.secondary', mr: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}

              {/* Full Name */}
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                variant="outlined"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'text.secondary', mr: 1 }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Email */}
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                variant="outlined"
                disabled={loading || otpSent || otpVerified}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'text.secondary', mr: 1 }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Phone Number */}
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 XXXXXXXXXX"
                variant="outlined"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: 'text.secondary', mr: 1 }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* OTP Verification */}
              {otpVerified ? (
                <Alert severity="success" icon={<CheckCircle />}>
                  Email verified successfully!
                </Alert>
              ) : !otpSent ? (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleRequestOTP}
                  disabled={loading || !formData.email}
                  sx={{
                    py: 1.5,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Send OTP to Email'}
                </Button>
              ) : (
                <>
                  <Alert severity="success" icon={<CheckCircle />}>
                    OTP sent successfully! Check your email.
                  </Alert>
                  <TextField
                    fullWidth
                    label="Enter OTP"
                    name="otp"
                    type="text"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="123456"
                    variant="outlined"
                    disabled={loading}
                    inputProps={{ maxLength: 6 }}
                  />
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleVerifyOTP}
                    disabled={loading || !formData.otp}
                    sx={{
                      py: 1.5,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
                  </Button>
                </>
              )}

              {/* Gender */}
              <TextField
                fullWidth
                select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                variant="outlined"
                disabled={loading}
              >
                <MenuItem value="">Select Gender</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>

              {/* Date of Birth */}
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                variant="outlined"
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />

              {/* Admission/Employee ID */}
              {formData.role === 'Student' && (
                <TextField
                  fullWidth
                  label="Admission Number (Optional)"
                  name="admissionNumber"
                  value={formData.admissionNumber}
                  onChange={handleChange}
                  placeholder="ADM2024001"
                  variant="outlined"
                  disabled={loading}
                />
              )}

              {formData.role === 'Teacher' && (
                <TextField
                  fullWidth
                  label="Employee ID (Optional)"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="EMP2024001"
                  variant="outlined"
                  disabled={loading}
                />
              )}

              {/* Password */}
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                variant="outlined"
                disabled={loading}
                helperText="Minimum 8 characters"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'text.secondary', mr: 1 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Confirm Password */}
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                variant="outlined"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'text.secondary', mr: 1 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Terms & Conditions */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={loading}
                  style={{ marginTop: '8px' }}
                />
                <Typography variant="body2" color="text.secondary">
                  I agree to the{' '}
                  <Link
                    href="#"
                    underline="hover"
                    sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer' }}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenTerms(true);
                    }}
                  >
                    Terms & Conditions
                  </Link>
                </Typography>
              </Box>

              {/* Sign Up Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  mt: 2,
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>

              {/* Login Link */}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    underline="hover"
                    sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Container>

      {/* Terms Dialog */}
      <Dialog
        open={openTerms}
        onClose={() => setOpenTerms(false)}
        maxWidth="sm"
      >
        <DialogTitle>Terms & Conditions</DialogTitle>
        <DialogContent>
          <Box sx={{ overflowY: 'auto', maxHeight: '300px', mt: 2 }}>
            <Typography variant="body2" paragraph>
              By creating an account, you agree to:
            </Typography>
            <Typography variant="caption" component="div" paragraph>
              • Use honest and accurate information
            </Typography>
            <Typography variant="caption" component="div" paragraph>
              • Not engage in unauthorized access
            </Typography>
            <Typography variant="caption" component="div" paragraph>
              • Comply with all school policies
            </Typography>
            <Typography variant="caption" component="div" paragraph>
              • Keep your password confidential
            </Typography>
            <Typography variant="caption" component="div" paragraph>
              • Use the system responsibly
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTerms(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModernSignupEnhanced;
