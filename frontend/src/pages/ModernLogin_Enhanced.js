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
  Tabs,
  Tab,
  Stack,
  Alert,
  CircularProgress,
  Link,
  FormControlLabel,
  Checkbox,
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
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../config/api';
import { styled, keyframes } from '@mui/material/styles';

// Keyframe animations
const subtleGlow = keyframes`
  0%, 100% { box-shadow: 0 20px 60px rgba(34, 197, 94, 0.08), inset 0 0 60px rgba(255, 255, 255, 0.5); }
  50% { box-shadow: 0 30px 80px rgba(34, 197, 94, 0.12), inset 0 0 80px rgba(255, 255, 255, 0.7); }
`;

const floatingShape = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(30px, -30px) rotate(90deg); }
  50% { transform: translate(0, -60px) rotate(180deg); }
  75% { transform: translate(-30px, -30px) rotate(270deg); }
`;

const glowPulse = keyframes`
  0%, 100% { opacity: 0.3, filter: blur(40px); }
  50% { opacity: 0.6; filter: blur(60px); }
`;

const subtleFloat = keyframes`
  0%, 100% { transform: translateY(0) translateX(0); }
  33% { transform: translateY(-20px) translateX(10px); }
  66% { transform: translateY(-10px) translateX(-15px); }
`;

// Modern TextField Component with Green Theme
const ModernTextField = styled(TextField)(({ theme }) => ({
  '& .MuiFormLabel-root': {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: '4px',
    transform: 'translate(14px, -9px) scale(0.75)',
    transformOrigin: 'left top',
    
    '&.Mui-focused': {
      color: '#10b981',
    },
  },
  
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    backgroundColor: '#ffffff',
    border: '2px solid #e5e7eb',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontSize: '0.95rem',
    
    '&:hover': {
      backgroundColor: '#ffffff',
      borderColor: '#10b981',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
    },
    
    '&.Mui-focused': {
      borderColor: '#10b981',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1), 0 4px 16px rgba(16, 185, 129, 0.15)',
    },
    
    '& fieldset': {
      border: 'none',
    },
  },
  
  '& .MuiOutlinedInput-input': {
    padding: '16px 16px',
    fontSize: '0.95rem',
    fontWeight: 500,
    color: '#1f2937',
    
    '&::placeholder': {
      color: 'rgba(0, 0, 0, 0.4)',
      opacity: 1,
    },
  },
  
  '& .MuiInputBase-input:disabled': {
    backgroundColor: '#f3f4f6',
    color: 'rgba(0, 0, 0, 0.6)',
  },
}));

// Premium Green Button
const GreenButton = styled(Button)(({ theme }) => ({
  borderRadius: '10px',
  padding: '13px 28px',
  fontSize: '0.95rem',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  '&.MuiButton-contained': {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
    
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 32px rgba(16, 185, 129, 0.35)',
      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    },
    
    '&:active': {
      transform: 'translateY(0)',
    },
  },
  
  '&.MuiButton-outlined': {
    borderRadius: '10px',
    border: '1.5px solid rgba(34, 197, 94, 0.4)',
    color: '#1f2937',
    fontWeight: 600,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(5px)',
    
    '&:hover': {
      backgroundColor: 'rgba(34, 197, 94, 0.12)',
      borderColor: '#22c55e',
      boxShadow: '0 8px 20px rgba(34, 197, 94, 0.2)',
      transform: 'translateY(-1px)',
    },
  },
}));

// Decorative Right Section Component
const DecorationCircle = styled(Box)(({ Top, Left, size, opacity }) => ({
  position: 'absolute',
  top: Top,
  left: Left,
  width: size,
  height: size,
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, ' + opacity + ')',
  filter: 'blur(2px)',
}));

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

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '40% 60%' },
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
      }}
    >
      {/* LEFT SIDE - LOGIN FORM */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 4,
          py: 3,
          position: 'relative',
          zIndex: 5,
          backgroundColor: '#fafbfc',
        }}
      >
        {/* Back Button */}
        <IconButton
          onClick={() => navigate('/')}
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            color: '#10b981',
            bgcolor: 'rgba(16, 185, 129, 0.1)',
            
            '&:hover': {
              bgcolor: 'rgba(16, 185, 129, 0.15)',
            },
          }}
        >
          <ArrowBack fontSize="small" />
        </IconButton>

        {/* Form Card */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '420px',
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
              }}
            >
              <School sx={{ fontSize: 32, color: 'white' }} />
            </Box>
          </Box>

          {/* Welcome Text */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                mb: 1,
                letterSpacing: -0.7,
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                fontSize: '0.95rem',
              }}
            >
              Sign in to your education account
            </Typography>
          </Box>

          {/* Alerts */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError('')}
              sx={{
                mb: 2,
                borderRadius: '10px',
                fontSize: '0.85rem',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.15)',
              }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              severity="success"
              onClose={() => setSuccess('')}
              sx={{
                mb: 2,
                borderRadius: '10px',
                fontSize: '0.85rem',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                color: '#047857',
                border: '1px solid rgba(16, 185, 129, 0.15)',
              }}
            >
              {success}
            </Alert>
          )}

          {/* Tabs */}
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
            variant="fullWidth"
            sx={{
              mb: 3,
              minHeight: '48px',
              '& .MuiTabs-indicator': {
                backgroundColor: '#10b981',
                height: '3px',
              },
              '& .MuiButtonBase-root': {
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#94a3b8',
                minHeight: '48px',
                
                '&.Mui-selected': {
                  color: '#10b981',
                },
              },
            }}
          >
            <Tab label="Email & Password" />
            <Tab label="Email & OTP" />
          </Tabs>

          <form onSubmit={handleLogin}>
            {/* EMAIL/PASSWORD TAB */}
            {tabValue === 0 && (
              <Stack spacing={2}>
                {requiresCollege && !activeCollegeId && showCollegeIdField && (
                  <ModernTextField
                    fullWidth
                    label="College ID"
                    value={resolvedCollegeId}
                    onChange={handleCollegeIdChange}
                    placeholder="Enter college ID"
                    size="small"
                    disabled={loading}
                  />
                )}

                <ModernTextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  size="small"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#10b981', fontSize: 18, mr: 0.8 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <ModernTextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  size="small"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#10b981', fontSize: 18, mr: 0.8 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          disabled={loading}
                          sx={{
                            color: '#10b981',
                          }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {formData.role === 'SuperAdmin' && (superAdmin2FARequired || formData.twoFAToken) && (
                  <ModernTextField
                    fullWidth
                    label="2FA Code"
                    name="twoFAToken"
                    value={formData.twoFAToken}
                    onChange={handleChange}
                    placeholder="123456"
                    size="small"
                    disabled={loading}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
                  />
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading}
                        size="small"
                        sx={{
                          color: '#cbd5e1',
                          '&.Mui-checked': { color: '#10b981' },
                        }}
                      />
                    }
                    label={<Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>Remember me</Typography>}
                  />
                  <Link
                    href="/forgot-password"
                    sx={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#10b981',
                      textDecoration: 'none',
                      
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <GreenButton
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    py: 1.3,
                    fontSize: '0.95rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
                </GreenButton>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Google fontSize="small" />}
                  disabled={loading}
                  onClick={handleGoogleLogin}
                  sx={{
                    py: 1.3,
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    color: '#1f2937',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      borderColor: '#cbd5e1',
                    },
                  }}
                >
                  Continue with Google
                </Button>
              </Stack>
            )}

            {/* EMAIL & OTP TAB */}
            {tabValue === 1 && (
              <Stack spacing={2}>
                {requiresCollege && !activeCollegeId && (
                  <ModernTextField
                    fullWidth
                    label="College ID"
                    value={resolvedCollegeId}
                    onChange={handleCollegeIdChange}
                    placeholder="Enter college ID"
                    size="small"
                    disabled={loading}
                  />
                )}

                <ModernTextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  size="small"
                  disabled={loading || otpSent}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#10b981', fontSize: 18, mr: 0.8 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {!otpSent && (
                  <GreenButton
                    fullWidth
                    variant="outlined"
                    onClick={handleRequestOTP}
                    disabled={loading || !formData.email}
                    startIcon={<Send fontSize="small" />}
                    sx={{
                      py: 1.3,
                      fontSize: '0.95rem',
                    }}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Send OTP'}
                  </GreenButton>
                )}

                {otpSent && (
                  <>
                    <Alert
                      icon={<CheckCircle fontSize="small" />}
                      sx={{
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        color: '#047857',
                        border: '1px solid rgba(16, 185, 129, 0.15)',
                      }}
                    >
                      OTP sent to your email
                    </Alert>

                    <ModernTextField
                      fullWidth
                      label="OTP Code"
                      name="otp"
                      type="text"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="000000"
                      size="small"
                      disabled={loading}
                      inputProps={{ maxLength: 6 }}
                    />

                    <GreenButton
                      fullWidth
                      variant="contained"
                      type="submit"
                      disabled={loading || !formData.otp}
                      sx={{
                        py: 1.3,
                        fontSize: '0.95rem',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                      }}
                    >
                      {loading ? <CircularProgress size={20} color="inherit" /> : 'Verify & Sign In'}
                    </GreenButton>

                    <GreenButton
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        setOtpSent(false);
                        setFormData({ ...formData, otp: '' });
                      }}
                      disabled={loading}
                      sx={{
                        py: 1.3,
                        fontSize: '0.95rem',
                      }}
                    >
                      Resend OTP
                    </GreenButton>
                  </>
                )}
              </Stack>
            )}
          </form>
        </Box>
      </Box>

      {/* RIGHT SIDE - PREMIUM GRADIENT BACKGROUND */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #e0f7f4 0%, #b3f4db 25%, #86f0d4 50%, #5aedd0 75%, #10b981 100%)',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        {/* Animated Blob 1 */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            right: '10%',
            width: '400px',
            height: '400px',
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.1))',
            filter: 'blur(40px)',
            animation: `${floatingShape} 20s ease-in-out infinite`,
            zIndex: 0,
          }}
        />

        {/* Animated Blob 2 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: '350px',
            height: '350px',
            borderRadius: '50% 40% 30% 70% / 60% 50% 40% 30%',
            background: 'radial-gradient(circle at 70% 70%, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.05))',
            filter: 'blur(50px)',
            animation: `${subtleFloat} 18s ease-in-out infinite`,
            animationDelay: '1s',
            zIndex: 0,
          }}
        />

        {/* Glow Effect */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animation: `${glowPulse} 6s ease-in-out infinite`,
            zIndex: 0,
          }}
        />

        {/* Curved Divider - Left */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '100px',
            background: 'linear-gradient(90deg, rgba(250, 251, 252, 0.6) 0%, transparent 100%)',
            zIndex: 2,
          }}
        />

        {/* Animation / Illustration Card */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <iframe
            src="https://lottie.host/embed/ea6d80a9-aefe-4389-b3e0-567893f02b21/vGY7W5y6do.lottie"
            style={{
              width: '100%',
              height: '100%',
              maxWidth: '450px',
              maxHeight: '450px',
              border: 'none',
            }}
            title="Login Animation"
          />
        </Box>

        {/* Test Lottie Animation - Lower Right */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            zIndex: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {/* Lottie Animation Element */}
          <Box
            component="div"
            dangerouslySetInnerHTML={{
              __html: '<dotlottie-wc src="https://lottie.host/3c9d5b19-9f88-48f1-9195-8db82ff6f121/QLx38Pl7LC.lottie" style="width: 150px; height: 150px;" autoplay loop></dotlottie-wc>'
            }}
          />
          
          {/* Test Message */}
          <Typography
            variant="body2"
            sx={{
              color: '#1f2937',
              fontWeight: 600,
              fontSize: '0.85rem',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              px: 2,
              py: 1,
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              whiteSpace: 'nowrap',
            }}
          >
            Are you logged in?
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ModernLoginEnhanced;
