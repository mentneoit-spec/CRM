import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Link,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google,
  Phone,
  Email,
  School,
  ArrowBack,
  CheckCircle,
  Send,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../config/api';

const ModernLogin = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [tenantCollegeId, setTenantCollegeId] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    otp: '',
    role: 'student',
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await authAPI.getTenant();
        const collegeId = res?.data?.collegeId || '';
        if (!cancelled) setTenantCollegeId(String(collegeId || '').trim());
      } catch {
        if (!cancelled) setTenantCollegeId('');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const effectiveCollegeId = useMemo(() => {
    try {
      const fromStorage = String(localStorage.getItem('collegeId') || '').trim();
      if (fromStorage) return fromStorage;
    } catch {
      // ignore
    }
    return String(tenantCollegeId || '').trim();
  }, [tenantCollegeId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      
      // Call appropriate API based on tab
      if (tabValue === 0) {
        // Email/Password login
        const loginData = {
          identifier: formData.email,
          password: formData.password,
        };

        // Add collegeId for non-superadmin users when available (tenant or localStorage)
        if (formData.role !== 'superadmin' && effectiveCollegeId) {
          loginData.collegeId = effectiveCollegeId;
        }
        
        response = await authAPI.login(loginData);
      } else {
        // OTP login
        const otpData = {
          phone: formData.phone,
          otp: formData.otp,
        };
        
        // Add collegeId for non-superadmin users when available (tenant or localStorage)
        if (formData.role !== 'superadmin' && effectiveCollegeId) {
          otpData.collegeId = effectiveCollegeId;
        }
        
        response = await authAPI.verifyOTP(otpData);
      }
      
      // Store token and user data
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        if (user.collegeId) {
          localStorage.setItem('collegeId', user.collegeId);
        }
        
        // Navigate based on role (use user.role from response, not formData.role)
        const roleRoutes = {
          Student: '/student/dashboard',
          Teacher: '/teacher/dashboard',
          Parent: '/parent/dashboard',
          Admin: '/admin/dashboard',
          SuperAdmin: '/superadmin/dashboard',
        };
        
        navigate(roleRoutes[user.role] || '/dashboard');
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!formData.phone) {
      setError('Please enter your phone number');
      return;
    }
    setLoading(true);
    try {
      const otpData = {
        phone: formData.phone,
      };
      
      // Add collegeId for non-superadmin users when available (tenant or localStorage)
      if (formData.role !== 'superadmin' && effectiveCollegeId) {
        otpData.collegeId = effectiveCollegeId;
      }
      
      const response = await authAPI.requestOTP(otpData);
      
      if (response.success) {
        setOtpSent(true);
        setError('');
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('OTP error:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google OAuth
    console.log('Google login');
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
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mt: 1 }}>
            Sign in to continue to your dashboard
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
          {/* Role Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Select Your Role
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {['student', 'teacher', 'parent', 'admin', 'superadmin'].map((role) => (
                <Chip
                  key={role}
                  label={role === 'superadmin' ? 'Super Admin' : role.charAt(0).toUpperCase() + role.slice(1)}
                  onClick={() => setFormData({ ...formData, role })}
                  color={formData.role === role ? 'primary' : 'default'}
                  variant={formData.role === role ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </Box>

          {/* Login Method Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab icon={<Email />} label="Email" />
            <Tab icon={<Phone />} label="Phone OTP" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            {/* Email/Password Login */}
            {tabValue === 0 && (
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label={formData.role === 'student' ? 'Email / Student ID' : 'Email Address'}
                  name="email"
                  type="text"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete={formData.role === 'student' ? 'username' : 'email'}
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ textAlign: 'right' }}>
                  <Button size="small" sx={{ textTransform: 'none' }}>
                    Forgot Password?
                  </Button>
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
              </Stack>
            )}

            {/* Phone OTP Login */}
            {tabValue === 1 && (
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+91 9876543210"
                  disabled={otpSent}
                />
                {otpSent && (
                  <TextField
                    fullWidth
                    label="Enter OTP"
                    name="otp"
                    type="text"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                    placeholder="123456"
                    inputProps={{ maxLength: 6 }}
                  />
                )}
                {!otpSent ? (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleRequestOTP}
                    disabled={loading}
                    sx={{ py: 1.5 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Send OTP'}
                  </Button>
                ) : (
                  <Stack spacing={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                      sx={{ py: 1.5 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Verify & Sign In'}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setOtpSent(false)}
                      sx={{ textTransform: 'none' }}
                    >
                      Change Phone Number
                    </Button>
                  </Stack>
                )}
              </Stack>
            )}
          </form>

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* Google Login */}
          <Button
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<Google />}
            onClick={handleGoogleLogin}
            sx={{
              py: 1.5,
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.light',
              },
            }}
          >
            Continue with Google
          </Button>

          {/* Sign Up Link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Button
                size="small"
                onClick={() => navigate('/signup')}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Sign Up
              </Button>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              New student?{' '}
              <Button
                size="small"
                onClick={() => navigate('/admission')}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Apply for Admission
              </Button>
            </Typography>
          </Box>
        </Paper>

        {/* Additional Info */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ModernLogin;
