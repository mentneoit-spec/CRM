import React, { useMemo, useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Divider,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  School,
  Assessment,
  Payment,
  Notifications,
  Settings,
  Logout,
  Person,
  Assignment,
  Event,
  DirectionsBus,
  Announcement,
  Receipt,
  Psychology as AIIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const DashboardLayout = ({ children, role = 'student' }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const authUser = useSelector((state) => state?.auth?.user);

  const avatarSrc = useMemo(() => {
    const raw = authUser?.profileImage;
    if (!raw) return '';
    const value = String(raw).trim();
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;

    // In local dev, backend serves uploads on :5000.
    if (value.startsWith('/uploads') && typeof window !== 'undefined') {
      const hostname = window.location?.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `http://localhost:5001${value}`;
      }
    }

    return value;
  }, [authUser?.profileImage]);

  const avatarFallback = useMemo(() => {
    const name = String(authUser?.name || '').trim();
    return (name ? name.charAt(0) : 'U').toUpperCase();
  }, [authUser?.name]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('collegeId');
    navigate('/login');
  };

  const getProfilePath = () => {
    switch (role) {
      case 'admin':
        return '/admin/profile';
      case 'student':
        return '/student/profile';
      case 'parent':
        return '/parent/profile';
      case 'teacher':
        return '/teacher/profile';
      case 'superadmin':
        return '/superadmin/profile';
      default:
        return '/';
    }
  };

  const getSettingsPath = () => {
    switch (role) {
      case 'admin':
        return '/admin/settings';
      case 'superadmin':
        return '/superadmin/settings';
      case 'teacher':
        return '/teacher/settings';
      case 'student':
        return '/student/settings';
      case 'parent':
        return '/parent/settings';
      default:
        return '/';
    }
  };

  // Role-based menu items
  const menuItems = {
    superadmin: [
      { text: 'Dashboard', icon: <Dashboard />, path: '/superadmin/dashboard' },
      { text: 'Colleges', icon: <School />, path: '/superadmin/colleges' },
      { text: 'Admins', icon: <People />, path: '/superadmin/admins' },
      { text: 'Analytics', icon: <Assessment />, path: '/superadmin/analytics' },
      { text: 'Domains', icon: <Settings />, path: '/superadmin/domains' },
      { text: 'Subscriptions', icon: <Payment />, path: '/superadmin/subscriptions' },
      { text: 'Audit Logs', icon: <Assessment />, path: '/superadmin/audit-logs' },
      { text: 'Settings', icon: <Settings />, path: '/superadmin/settings' },
    ],
    student: [
      { text: 'Dashboard', icon: <Dashboard />, path: '/student/dashboard' },
      { text: 'AI Assistant', icon: <AIIcon />, path: '/student/ai', badge: 'NEW' },
      { text: 'My Courses', icon: <School />, path: '/student/courses' },
      { text: 'Attendance', icon: <Event />, path: '/student/attendance' },
      { text: 'Assignments', icon: <Assignment />, path: '/student/assignments' },
      { text: 'Exams & Results', icon: <Assessment />, path: '/student/results' },
      { text: 'Fees', icon: <Payment />, path: '/student/fees' },
      { text: 'Transport', icon: <DirectionsBus />, path: '/student/transport' },
      { text: 'Notices', icon: <Announcement />, path: '/student/notices' },
    ],
    teacher: [
      { text: 'Dashboard', icon: <Dashboard />, path: '/teacher/dashboard' },
      { text: 'AI Assistant', icon: <AIIcon />, path: '/teacher/ai', badge: 'NEW' },
      { text: 'My Classes', icon: <School />, path: '/teacher/classes' },
      { text: 'Students', icon: <People />, path: '/teacher/students' },
      { text: 'Attendance', icon: <Event />, path: '/teacher/attendance' },
      { text: 'Assignments', icon: <Assignment />, path: '/teacher/assignments' },
      { text: 'Marks', icon: <Assessment />, path: '/teacher/marks' },
      { text: 'Exams', icon: <Assessment />, path: '/teacher/exams' },
      { text: 'Reports', icon: <Assessment />, path: '/teacher/reports' },
    ],
    parent: [
      { text: 'Dashboard', icon: <Dashboard />, path: '/parent/dashboard' },
      { text: 'AI Assistant', icon: <AIIcon />, path: '/parent/ai', badge: 'NEW' },
      { text: 'My Children', icon: <People />, path: '/parent/children' },
      { text: 'Attendance', icon: <Event />, path: '/parent/attendance' },
      { text: 'Academic Progress', icon: <Assessment />, path: '/parent/progress' },
      { text: 'Fee Payments', icon: <Payment />, path: '/parent/payments' },
      { text: 'Notices', icon: <Announcement />, path: '/parent/notices' },
    ],
    admin: [
      { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
      { text: 'AI Assistant', icon: <AIIcon />, path: '/admin/ai', badge: 'NEW' },
      { text: 'Analytics', icon: <Assessment />, path: '/admin/analytics' },
      { text: 'HR Management', icon: <People />, path: '/admin/hr-management', badge: 'NEW' },
      { text: 'Students', icon: <People />, path: '/admin/students' },
      { text: 'Teachers', icon: <People />, path: '/admin/teachers' },
      { text: 'Teams', icon: <People />, path: '/admin/teams' },
      { text: 'Classes', icon: <School />, path: '/admin/classes' },
      { text: 'Subjects', icon: <Assignment />, path: '/admin/subjects' },
      { text: 'Admissions', icon: <Person />, path: '/admin/admissions' },
      { text: 'Fee Management', icon: <Payment />, path: '/admin/fee-management' },
      { text: 'Fees', icon: <Payment />, path: '/admin/fees' },
      { text: 'Receipts & Payments', icon: <Receipt />, path: '/admin/receipts' },
      { text: 'Transport', icon: <DirectionsBus />, path: '/admin/transport' },
      { text: 'Results', icon: <Assessment />, path: '/admin/results' },
      { text: 'Reports', icon: <Assessment />, path: '/admin/reports' },
      { text: 'Settings', icon: <Settings />, path: '/admin/settings' },
    ],
  };

  const currentMenuItems = menuItems[role] || menuItems.student;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <School sx={{ fontSize: 32, color: 'primary.main', mr: 1.5 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            College ERP
          </Typography>
          <Chip
            label={role === 'superadmin' ? 'Super Admin' : role.charAt(0).toUpperCase() + role.slice(1)}
            size="small"
            color="primary"
            sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
          />
        </Box>
      </Box>

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
        {currentMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                  },
                  py: 1.5,
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'white' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : '#FF6B6B',
                      color: isActive ? 'white' : 'white',
                      fontWeight: 'bold',
                      ml: 1
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User Profile */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'grey.50',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'grey.100' },
          }}
          onClick={handleProfileMenuOpen}
        >
          <Avatar src={avatarSrc || undefined} sx={{ bgcolor: 'primary.main', mr: 1.5 }}>
            {avatarFallback}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {authUser?.name || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {authUser?.email || ''}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 600 }}>
            {currentMenuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>

          <IconButton sx={{ mr: 1 }}>
            <Badge badgeContent={4} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <IconButton onClick={handleProfileMenuOpen}>
            <Avatar src={avatarSrc || undefined} sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
              {avatarFallback}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { navigate(getProfilePath()); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          My Profile
        </MenuItem>
        <MenuItem onClick={() => { navigate(getSettingsPath()); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DashboardLayout;
