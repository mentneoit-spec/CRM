import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, Paper, Stack } from '@mui/material';

const DevTestPage = () => {
  const navigate = useNavigate();

  const enableDevMode = (role) => {
    localStorage.setItem('DEV_MODE', 'true');
    localStorage.setItem('token', 'dev-token-123');
    const mockUser = {
      id: '123',
      name: role === 'Admin' ? 'Admin User' : 'Teacher User',
      email: role === 'Admin' ? 'admin@demo.com' : 'teacher1@demo.com',
      role: role,
      college: 'Demo College'
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Navigate to the appropriate page
    if (role === 'Admin') {
      navigate('/admin/ai');
    } else if (role === 'Teacher') {
      navigate('/teacher/ai');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            🚀 Access AI Dashboards
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
            Select a role to enable dev mode and access the AI pages
          </Typography>

          <Stack spacing={2} sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => enableDevMode('Admin')}
              sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              ⚙️ Access Admin AI Dashboard
            </Button>

            <Button 
              variant="contained" 
              color="success" 
              size="large"
              onClick={() => enableDevMode('Teacher')}
              sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              👨‍🏫 Access Teacher AI Dashboard
            </Button>
          </Stack>

          <Typography variant="caption" sx={{ mt: 4, display: 'block', color: '#999' }}>
            Dev mode: Automatically logs you in for testing
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default DevTestPage;
