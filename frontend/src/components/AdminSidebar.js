import React, { useState } from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Divider, Typography, Collapse, Avatar, Chip, Card, CardContent
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  AttachMoney as AttachMoneyIcon,
  Assignment as AssignmentIcon,
  DirectionsBus as BusIcon,
  Notifications as NotificationsIcon,
  BarChart as ChartIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess, ExpandMore,
  Class as ClassIcon,
  Gavel as GavelIcon,
  Book as BookIcon,
  EventNote as EventNoteIcon,
  CheckCircle as CheckCircleIcon,
  Groups as GroupsIcon,
  CloudUpload,
  Psychology as AIIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const menuStructure = [
  {
    label: 'Dashboard',
    icon: DashboardIcon,
    path: '/admin/dashboard',
    badge: null
  },
  {
    label: 'AI Assistant',
    icon: AIIcon,
    path: '/admin/ai',
    badge: 'NEW'
  },
  {
    label: 'Academic',
    icon: BookIcon,
    subItems: [
      { label: 'Classes & Sections', path: '/admin/classes', icon: ClassIcon },
      { label: 'Subjects', path: '/admin/subjects', icon: BookIcon },
      { label: 'Teachers', path: '/admin/teachers', icon: SchoolIcon },
      { label: 'Students', path: '/admin/students', icon: PeopleIcon },
      { label: 'Import Students CSV', path: '/admin/import-students', icon: CloudUpload }
    ]
  },
  {
    label: 'Academics',
    icon: AssignmentIcon,
    subItems: [
      { label: 'Attendance', path: '/admin/attendance', icon: CheckCircleIcon },
      { label: 'Homework', path: '/admin/homework', icon: BookIcon },
      { label: 'Exams', path: '/admin/exams', icon: EventNoteIcon },
      { label: 'Results', path: '/admin/results', icon: ChartIcon },
      { label: 'Send Marks Email', path: '/admin/send-marks-email', icon: NotificationsIcon }
    ]
  },
  {
    label: 'Admissions',
    icon: GavelIcon,
    path: '/admin/admissions',
    badge: { count: 5, color: '#F44336' }
  },
  {
    label: 'Finance',
    icon: AttachMoneyIcon,
    subItems: [
      { label: 'Fee Management', path: '/admin/fee-management', icon: AttachMoneyIcon },
      { label: 'Fees Structure', path: '/admin/fees', icon: AttachMoneyIcon },
      { label: 'Payments', path: '/admin/payments', icon: AttachMoneyIcon },
      { label: 'Receipts', path: '/admin/receipts', icon: BookIcon }
    ]
  },
  {
    label: 'Transport',
    icon: BusIcon,
    subItems: [
      { label: 'Routes', path: '/admin/routes', icon: BusIcon },
      { label: 'Buses', path: '/admin/buses', icon: BusIcon },
      { label: 'Drivers', path: '/admin/drivers', icon: PeopleIcon }
    ]
  },
  {
    label: 'Communication',
    icon: NotificationsIcon,
    subItems: [
      { label: 'Notices', path: '/admin/notices', icon: NotificationsIcon },
      { label: 'Complaints', path: '/admin/complaints', icon: GavelIcon },
      { label: 'Messages', path: '/admin/messages', icon: NotificationsIcon }
    ]
  },
  {
    label: 'Organization',
    icon: GroupsIcon,
    subItems: [
      { label: 'Admission Team', path: '/admin/admission-team', icon: GroupsIcon },
      { label: 'Accounts Team', path: '/admin/accounts-team', icon: GroupsIcon },
      { label: 'Transport Team', path: '/admin/transport-team', icon: GroupsIcon }
    ]
  },
  {
    label: 'Reports',
    icon: ChartIcon,
    subItems: [
      { label: 'Student Reports', path: '/admin/reports/students', icon: ChartIcon },
      { label: 'Finance Reports', path: '/admin/reports/finance', icon: ChartIcon },
      { label: 'Attendance Reports', path: '/admin/reports/attendance', icon: ChartIcon },
      { label: 'Academic Reports', path: '/admin/reports/academic', icon: ChartIcon }
    ]
  },
  {
    label: 'Settings',
    icon: SettingsIcon,
    subItems: [
      { label: 'College Settings', path: '/admin/settings/college', icon: SettingsIcon },
      { label: 'Academic Year', path: '/admin/settings/academic-year', icon: SettingsIcon },
      { label: 'Users', path: '/admin/settings/users', icon: PeopleIcon },
      { label: 'Roles & Permissions', path: '/admin/settings/roles', icon: SettingsIcon }
    ]
  }
];

const AdminSidebar = ({ open = true, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const handleToggleExpand = (label) => {
    setExpandedItems(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const isActive = (path) => location.pathname === path;
  const isParentActive = (subItems) =>
    subItems?.some(item => location.pathname === item.path);

  const MenuItemComponent = ({ item, level = 0 }) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems[item.label];
    const active = item.path ? isActive(item.path) : isParentActive(item.subItems);

    return (
      <Box key={item.label}>
        <ListItem
          disablePadding
          sx={{
            pl: level * 2,
            '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.08)' }
          }}
        >
          <ListItemButton
            onClick={() => {
              if (hasSubItems) {
                handleToggleExpand(item.label);
              } else if (item.path) {
                handleNavigate(item.path);
              }
            }}
            sx={{
              backgroundColor: active ? 'rgba(33, 150, 243, 0.15)' : 'transparent',
              borderLeft: active ? '3px solid #2196F3' : '3px solid transparent',
              color: active ? '#2196F3' : 'inherit',
              '& .MuiListItemIcon-root': {
                color: active ? '#2196F3' : 'inherit'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <item.icon />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: active ? 600 : 500
              }}
            />
            {item.badge && (
              <Chip
                label={typeof item.badge === 'string' ? item.badge : item.badge.count}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.75rem',
                  backgroundColor: typeof item.badge === 'string' ? '#FF6B6B' : item.badge.color,
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}
            {hasSubItems && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>

        {hasSubItems && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems.map(subItem => (
                <MenuItemComponent
                  key={subItem.label}
                  item={subItem}
                  level={level + 1}
                />
              ))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#fafafa'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Avatar sx={{ width: 40, height: 40, backgroundColor: '#2196F3' }}>
            AD
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Admin Panel
            </Typography>
            <Typography variant="caption" color="textSecondary">
              ERP System
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Menu Items */}
      <List sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {menuStructure.map(item => (
          <MenuItemComponent key={item.label} item={item} />
        ))}
      </List>

      {/* Footer */}
      <Divider />
      <ListItem disablePadding>
        <ListItemButton
          sx={{
            color: '#666',
            '&:hover': { backgroundColor: '#ffebee' }
          }}
        >
          <ListItemIcon sx={{ color: '#F44336' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: '0.95rem' }}
          />
        </ListItemButton>
      </ListItem>
    </Box>
  );

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
      }}
    >
      {content}
    </Drawer>
  );
};

export { AdminSidebar, drawerWidth };
export default AdminSidebar;
