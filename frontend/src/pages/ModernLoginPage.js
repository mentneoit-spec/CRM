import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Link,
  Tab,
  Tabs,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../config/api';

// Styled Components
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
}));

const LoginCard = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  overflow: 'hidden',
  maxWidth: '500px',
  width: '100%',
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(3),
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const LogoIcon = styled(SchoolIcon)(({ theme }) => ({
  fontSize: '48px',
  marginBottom: theme.spacing(1),
}));

const FormSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': {
      borderColor: '#667eea',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#667eea',
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
  borderRadius: '8px',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 20px rgba(102, 126, 234, 0.4)',
  },
  transition: 'all 0.3s ease',
}));

const TabSection = styled(Box)(({ theme }) => ({
  borderBottom: '1px solid #e0e0e0',
  marginBottom: theme.spacing(3),
}));

const FooterText = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(2),
  color: theme.palette.text.secondary,
  fontSize: '14px',
}));

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

// Main Login Component
const ModernLoginPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    studentId: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setFormData({
      email: '',
      password: '',
      studentId: '',
      rememberMe: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = tabValue === 0
        ? { identifier: formData.email, password: formData.password }
        : { identifier: formData.studentId, password: formData.password };

      const response = await authAPI.login(payload);

      if (response?.success && response?.data?.token && response?.data?.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.user.collegeId) {
          localStorage.setItem('collegeId', response.data.user.collegeId);
        }
        setSuccess('Login successful! Redirecting...');
        
        setTimeout(() => {
          const role = response.data.user.role;
          if (role === 'SuperAdmin') navigate('/superadmin/dashboard');
          else if (role === 'Admin') navigate('/admin/dashboard');
          else if (role === 'Teacher') navigate('/teacher/dashboard');
          else if (role === 'Student') navigate('/student/dashboard');
          else if (role === 'Parent') navigate('/parent/dashboard');
          else if (role === 'HRTeam') navigate('/hr/dashboard');
          else if (role === 'TransportTeam') navigate('/transport/dashboard');
          else if (role === 'AccountsTeam') navigate('/accounts/dashboard');
          else navigate('/');
        }, 1500);
      } else {
        setError(response?.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        {/* Header */}
        <HeaderSection>
          <LogoIcon />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Mentneo
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            College Management System
          </Typography>
        </HeaderSection>

        {/* Tabs */}
        <FormSection>
          <TabSection>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                },
                '& .Mui-selected': {
                  color: '#667eea',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#667eea',
                },
              }}
            >
              <Tab label="Admin Login" />
              <Tab label="Student Login" />
            </Tabs>
          </TabSection>

          {/* Admin Login Form */}
          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleLogin}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <StyledTextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                placeholder="admin@example.com"
                disabled={loading}
              />

              <StyledTextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                placeholder="••••••••"
                disabled={loading}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                }
                label="Remember me"
                sx={{ my: 1 }}
              />

              <StyledButton
                fullWidth
                type="submit"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </StyledButton>

              <FooterText>
                Forgot password?{' '}
                <Link
                  href="#"
                  sx={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}
                >
                  Reset here
                </Link>
              </FooterText>
            </form>
          </TabPanel>

          {/* Student Login Form */}
          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleLogin}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <StyledTextField
                fullWidth
                label="Student ID"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                margin="normal"
                placeholder="STU001234"
                disabled={loading}
              />

              <StyledTextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                placeholder="••••••••"
                disabled={loading}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                }
                label="Remember me"
                sx={{ my: 1 }}
              />

              <StyledButton
                fullWidth
                type="submit"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </StyledButton>

              <FooterText>
                Don't have an account?{' '}
                <Link
                  href="/register"
                  sx={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}
                >
                  Register here
                </Link>
              </FooterText>
            </form>
          </TabPanel>
        </FormSection>

        {/* Footer */}
        <Box
          sx={{
            background: '#f5f7fa',
            padding: 2,
            textAlign: 'center',
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="caption" sx={{ color: '#999' }}>
            © 2026 Mentneo. All rights reserved.
          </Typography>
        </Box>
      </LoginCard>
    </LoginContainer>
  );
};

export default ModernLoginPage;
