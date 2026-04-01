import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';

const SimpleLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('student@school.com');
  const [password, setPassword] = useState('Student@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const normalizeApiBaseUrl = (url) => {
    const getDefaultApiBaseUrl = () => {
      try {
        if (typeof window !== 'undefined' && window.location) {
          const hostname = window.location.hostname;
          const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
          if (isLocal) return 'http://localhost:5001/api';
          return '/api';
        }
      } catch {
        // ignore
      }
      return '/api';
    };

    const fallback = getDefaultApiBaseUrl();
    if (!url) return fallback;

    try {
      if (typeof window !== 'undefined' && window.location) {
        const currentHost = window.location.hostname;
        const currentIsLocal = currentHost === 'localhost' || currentHost === '127.0.0.1';

        const asUrl = new URL(String(url), window.location.href);
        const envHost = asUrl.hostname;
        const envIsLocal = envHost === 'localhost' || envHost === '127.0.0.1';

        if (!currentIsLocal && envIsLocal) {
          return fallback;
        }
      }
    } catch {
      // ignore
    }

    const trimmed = String(url).replace(/\/+$/, '');
    if (trimmed.endsWith('/api')) return trimmed;
    return `${trimmed}/api`;
  };

  const API_BASE_URL = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email });
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          collegeId: '2aad2902-caee-4a50-bcb9-0b75e0c75262',
        }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success && data.data) {
        const { token, user } = data.data;
        
        console.log('Login successful!', { user: user.name, role: user.role });
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('collegeId', user.collegeId);
        
        console.log('Stored in localStorage');
        
        // Redirect based on role
        const roleRoutes = {
          Student: '/student/dashboard',
          Teacher: '/teacher/dashboard',
          Parent: '/parent/dashboard',
          Admin: '/admin/dashboard',
          SuperAdmin: '/superadmin/dashboard',
          HRTeam: '/hr/dashboard',
          TransportTeam: '/transport/dashboard',
          AccountsTeam: '/accounts/dashboard',
        };
        
        const dashboardUrl = roleRoutes[user.role] || '/dashboard';
        console.log('Redirecting to:', dashboardUrl);
        
        navigate(dashboardUrl);
      } else {
        setError(data.message || 'Login failed');
        console.error('Login failed:', data.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Simple Login
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Debug version - check console for logs
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>

          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" display="block">
              <strong>Test Account:</strong>
            </Typography>
            <Typography variant="caption" display="block">
              Email: testsignupfix@example.com
            </Typography>
            <Typography variant="caption" display="block">
              Password: test123
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SimpleLogin;
