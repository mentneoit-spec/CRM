import React, { useEffect, useState } from 'react';
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
  Link,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google,
  Email,
  School,
  ArrowBack,
  CheckCircle,
  Send,
  Lock,
  Info,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../config/api';

const ModernLoginEnhanced = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [openTests, setOpenTests] = useState(false);
  const [resolvedCollegeId, setResolvedCollegeId] = useState(() => localStorage.getItem('collegeId') || '');
  const [superAdmin2FARequired, setSuperAdmin2FARequired] = useState(false);
  const [showCollegeIdField, setShowCollegeIdField] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    otp: '',
    twoFAToken: '',
    role: 'Student',
  });

  const requiresCollege = formData.role !== 'SuperAdmin';
  const activeCollegeId = resolvedCollegeId || localStorage.getItem('collegeId') || '';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    const collegeIdParam = params.get('collegeId');
    const allowedRoles = ['Student', 'Teacher', 'Parent', 'Admin', 'SuperAdmin'];

    if (roleParam && allowedRoles.includes(roleParam)) {
      setFormData((prev) => ({ ...prev, role: roleParam }));
    }

    if (collegeIdParam) {
      localStorage.setItem('collegeId', collegeIdParam);
      setResolvedCollegeId(collegeIdParam);
    }
  }, [location.search]);

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

  // Google OAuth return handling (backend redirects to /login#googleToken=...)
  useEffect(() => {
    const hash = (location.hash || '').replace(/^#/, '');
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const googleToken = params.get('googleToken');
    const googleError = params.get('googleError');

    if (googleError) {
      setError(decodeURIComponent(googleError));
      navigate(location.pathname + location.search, { replace: true });
      return;
    }

    if (!googleToken) return;

    (async () => {
      try {
        setLoading(true);
        localStorage.setItem('token', googleToken);
        const me = await authAPI.getCurrentUser();
        if (me?.success && me?.data) {
          localStorage.setItem('user', JSON.stringify(me.data));
          if (me.data.collegeId) {
            localStorage.setItem('collegeId', me.data.collegeId);
            setResolvedCollegeId(me.data.collegeId);
          }

          const roleRoutes = {
            Student: '/student/dashboard',
            Teacher: '/teacher/dashboard',
            Parent: '/parent/dashboard',
            Admin: '/admin/dashboard',
            SuperAdmin: '/superadmin/dashboard',
          };
          navigate(roleRoutes[me.data.role] || '/dashboard', { replace: true });
        } else {
          setError(me?.message || 'Google login failed');
        }
      } catch (err) {
        setError(err?.message || 'Google login failed');
      } finally {
        setLoading(false);
        navigate(location.pathname + location.search, { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  const testCredentials = {
    Student: { email: 'student@school.com', password: 'Student@123' },
    Teacher: { email: 'teacher@school.com', password: 'Teacher@123' },
    Admin: { email: 'admin@school.com', password: 'Admin@123' },
    Parent: { email: 'parent@school.com', password: 'Parent@123' },
    SuperAdmin: { email: 'superadmin@school.com', password: 'SuperAdmin@123' },
  };

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      
      if (tabValue === 0) {
        // Email/Password login
        if (!formData.email || !formData.password) {
          setError('Please enter both email and password');
          setLoading(false);
          return;
        }
        
        if (formData.role === 'SuperAdmin') {
          response = await authAPI.superAdminLogin({
            email: formData.email,
            password: formData.password,
            twoFAToken: formData.twoFAToken || undefined,
          });
        } else {
          const collegeId = activeCollegeId;
          response = await authAPI.login({
            email: formData.email,
            password: formData.password,
            ...(collegeId ? { collegeId } : {}),
          });
        }
      } else {
        // OTP login
        if (formData.role === 'SuperAdmin') {
          setError('OTP login is not available for Super Admin');
          setLoading(false);
          return;
        }
        if (!formData.email) {
          setError('Please enter your email address');
          setLoading(false);
          return;
        }
        if (!otpSent) {
          setError('Please request OTP first');
          setLoading(false);
          return;
        }
        if (!formData.otp) {
          setError('Please enter the OTP');
          setLoading(false);
          return;
        }
        
        const collegeId = activeCollegeId;
        if (!collegeId) {
          setError('College not identified. Open the login link with ?collegeId=... or use your college domain.');
          setLoading(false);
          return;
        }

        response = await authAPI.verifyOTP({
          email: formData.email,
          otp: formData.otp,
          collegeId,
        });
      }
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        if (user.collegeId) {
          localStorage.setItem('collegeId', user.collegeId);
        }
        
        setSuccess('Login successful! Redirecting...');
        setSuperAdmin2FARequired(false);
        setShowCollegeIdField(false);
        setFormData((prev) => ({ ...prev, twoFAToken: '' }));
        
        const roleRoutes = {
          Student: '/student/dashboard',
          Teacher: '/teacher/dashboard',
          Parent: '/parent/dashboard',
          Admin: '/admin/dashboard',
          SuperAdmin: '/superadmin/dashboard',
        };
        
        setTimeout(() => {
          navigate(roleRoutes[user.role] || '/dashboard');
        }, 1000);
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (formData.role === 'SuperAdmin' && err?.requires2FA) {
        setSuperAdmin2FARequired(true);
        setError(err?.message || '2FA token is required');
      } else if (err?.requiresCollegeId) {
        setShowCollegeIdField(true);
        setError(err?.message || 'College ID is required');
      } else {
        setError(err?.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (formData.role === 'SuperAdmin') {
      setError('OTP login is not available for Super Admin');
      return;
    }
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const collegeId = activeCollegeId;
      if (!collegeId) {
        setShowCollegeIdField(true);
        setError('Please enter your College ID to request OTP.');
        return;
      }

      const response = await authAPI.requestOTP({ email: formData.email, collegeId });
      
      if (response.success) {
        setOtpSent(true);
        setSuccess('OTP sent to your email!');
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

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    if (formData.role === 'SuperAdmin') {
      setError('Google login is not available for Super Admin');
      return;
    }
    const collegeId = activeCollegeId;
    if (!collegeId) {
      setShowCollegeIdField(true);
      setError('Please enter your College ID to continue with Google.');
      return;
    }
    try {
      setLoading(true);
      const resp = await authAPI.getGoogleAuthURL(collegeId);
      if (resp?.success && resp?.authUrl) {
        window.location.assign(resp.authUrl);
        return;
      }
      setError(resp?.message || 'Failed to start Google login');
    } catch (err) {
      setError(err?.message || 'Failed to start Google login');
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = (role) => {
    const creds = testCredentials[role];
    setFormData({ ...formData, ...creds, role, twoFAToken: '' });
    setSuperAdmin2FARequired(false);
    setOpenTests(false);
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
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mt: 1 }}>
            Sign in to your dashboard
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

          {/* Role Selection */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>
              Select Your Role
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {['Student', 'Teacher', 'Parent', 'Admin', 'SuperAdmin'].map((role) => (
                <Chip
                  key={role}
                  label={role === 'SuperAdmin' ? 'Super Admin' : role}
                  onClick={() => {
                    setFormData({ ...formData, role, twoFAToken: '' });
                    setOtpSent(false);
                    setSuperAdmin2FARequired(false);
                    setShowCollegeIdField(false);
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

          {/* Info Banner */}
          <Alert 
            icon={<Info sx={{ fontSize: 20 }} />}
            severity="info"
            sx={{ mb: 3 }}
          >
            For testing: Use test credentials. Click "Test Credentials" button below.
          </Alert>

          {/* Login Method Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => {
              setTabValue(newValue);
              setError('');
              setOtpSent(false);
              setSuperAdmin2FARequired(false);
              setShowCollegeIdField(false);
              setFormData((prev) => ({ ...prev, twoFAToken: '' }));
            }}
            fullWidth
            sx={{
              mb: 3,
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
              },
            }}
          >
            <Tab label="📧 Email & Password" icon={<Email />} iconPosition="start" />
            <Tab label="📧 Email & OTP" icon={<Email />} iconPosition="start" />
          </Tabs>

          <form onSubmit={handleLogin}>
            {/* Email/Password Tab */}
            {tabValue === 0 && (
              <Stack spacing={2}>
                {requiresCollege && !activeCollegeId && showCollegeIdField && (
                  <TextField
                    fullWidth
                    label="College ID"
                    value={resolvedCollegeId}
                    onChange={handleCollegeIdChange}
                    placeholder="Paste collegeId here"
                    variant="outlined"
                    disabled={loading}
                  />
                )}
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@school.com"
                  variant="outlined"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'text.secondary', mr: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                />

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

                {(formData.role === 'SuperAdmin' && (superAdmin2FARequired || formData.twoFAToken)) && (
                  <TextField
                    fullWidth
                    label="2FA Code"
                    name="twoFAToken"
                    value={formData.twoFAToken}
                    onChange={handleChange}
                    placeholder="123456"
                    variant="outlined"
                    disabled={loading}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    helperText="Enter the 6-digit code from your authenticator app"
                  />
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading}
                      />
                    }
                    label="Remember me"
                  />
                  <Link
                    href="/forgot-password"
                    underline="hover"
                    sx={{ cursor: 'pointer', color: 'primary.main' }}
                  >
                    Forgot Password?
                  </Link>
                </Box>

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
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
              </Stack>
            )}

            {/* OTP Tab */}
            {tabValue === 1 && (
              <Stack spacing={2}>
                {requiresCollege && !activeCollegeId && (
                  <TextField
                    fullWidth
                    label="College ID"
                    value={resolvedCollegeId}
                    onChange={handleCollegeIdChange}
                    placeholder="Paste collegeId here"
                    variant="outlined"
                    disabled={loading}
                  />
                )}
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  variant="outlined"
                  disabled={loading || otpSent}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'text.secondary', mr: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {!otpSent && (
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={handleRequestOTP}
                    disabled={loading || !formData.email}
                    startIcon={<Send />}
                    sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Request OTP'}
                  </Button>
                )}

                {otpSent && (
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
                      variant="contained"
                      size="large"
                      type="submit"
                      disabled={loading || !formData.otp}
                      sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Verify & Sign In'}
                    </Button>

                    <Button
                      fullWidth
                      variant="text"
                      onClick={() => {
                        setOtpSent(false);
                        setFormData({ ...formData, otp: '' });
                      }}
                      disabled={loading}
                    >
                      Resend OTP
                    </Button>
                  </>
                )}
              </Stack>
            )}
          </form>

          {/* Divider */}
          <Divider sx={{ my: 3 }} />

          {/* Additional Options */}
          <Stack spacing={2}>
            {/* Google Login */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Google />}
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderColor: '#D3D3D3',
              }}
              onClick={handleGoogleLogin}
            >
              Continue with Google
            </Button>

            {/* Test Credentials */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              disabled={loading}
              onClick={() => setOpenTests(true)}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderColor: '#D3D3D3',
              }}
            >
              🧪 Use Test Credentials
            </Button>
          </Stack>

          {/* Footer Links */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Don't have an account?{' '}
              <Link
                href="/signup"
                underline="hover"
                sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer' }}
              >
                Create Account
              </Link>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Apply for admission?{' '}
              <Link
                href="/admission"
                underline="hover"
                sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer' }}
              >
                Click here
              </Link>
            </Typography>
          </Box>
        </Paper>

        {/* Test Credentials Dialog */}
        <Dialog
          open={openTests}
          onClose={() => setOpenTests(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Test Credentials</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {Object.entries(testCredentials).map(([role, creds]) => (
                <Card key={role} variant="outlined">
                  <CardContent sx={{ pb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      {role}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Email: {creds.email}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Password: {creds.password}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      fullWidth
                      sx={{ mt: 1 }}
                      onClick={() => fillTestCredentials(role)}
                    >
                      Use These Credentials
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenTests(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ModernLoginEnhanced;
