import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Lock,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../config/api';

const ModernLoginEnhanced = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [openTests, setOpenTests] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    otp: '',
    role: 'Student',
  });

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
        response = await authAPI.login({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
      } else {
        // OTP login
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
        response = await authAPI.verifyOTP({
          phone: formData.phone,
          otp: formData.otp,
          role: formData.role,
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
      const response = await authAPI.requestOTP({
        phone: formData.phone,
        role: formData.role,
      });
      
      if (response.success) {
        setOtpSent(true);
        setSuccess('OTP sent to your phone!');
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

  const useTestCredentials = (role) => {
    const creds = testCredentials[role];
    setFormData({ ...formData, ...creds, role });
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
                    setFormData({ ...formData, role });
                    setOtpSent(false);
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
            <Tab label="📱 Phone & OTP" icon={<Phone />} iconPosition="start" />
          </Tabs>

          <form onSubmit={handleLogin}>
            {/* Email/Password Tab */}
            {tabValue === 0 && (
              <Stack spacing={2}>
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
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXXXXXXX"
                  variant="outlined"
                  disabled={loading || otpSent}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: 'text.secondary', mr: 1 }} />
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
                    disabled={loading || !formData.phone}
                    startIcon={<Send />}
                    sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Request OTP'}
                  </Button>
                )}

                {otpSent && (
                  <>
                    <Alert severity="success" icon={<CheckCircle />}>
                      OTP sent successfully! Check your phone.
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
            >
              Continue with Google (Coming Soon)
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
                      onClick={() => useTestCredentials(role)}
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
