import React, { useState } from 'react';
import { Box, Toolbar, AppBar, IconButton, Avatar, Menu, MenuItem, Stack, Typography, Badge } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminSidebar, drawerWidth } from '../components/AdminSidebar';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
          ml: sidebarOpen ? `${drawerWidth}px` : 0,
          transition: 'all 0.3s ease',
          backgroundColor: '#ffffff',
          color: '#333',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 100
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flex: 1 }} />

          {/* Quick Actions */}
          <Stack direction="row" spacing={2} sx={{ mr: 3 }}>
            <IconButton color="inherit" sx={{ position: 'relative' }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit">
              <SettingsIcon />
            </IconButton>
          </Stack>

          {/* User Menu */}
          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar sx={{ width: 38, height: 38, backgroundColor: '#2196F3', cursor: 'pointer' }}>
              AD
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1
                }
              }
            }}
          >
            <MenuItem disabled sx={{ pb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Admin User
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>Profile Settings</MenuItem>
            <MenuItem onClick={handleMenuClose}>Change Password</MenuItem>
            <MenuItem onClick={handleMenuClose}>Activity Log</MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: '#F44336' }}>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          ml: sidebarOpen ? `${drawerWidth}px` : 0,
          transition: 'all 0.3s ease',
          backgroundColor: '#f8f9fa',
          minHeight: '100vh'
        }}
      >
        <Toolbar /> {/* For spacing below AppBar */}
        <Box sx={{ p: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
