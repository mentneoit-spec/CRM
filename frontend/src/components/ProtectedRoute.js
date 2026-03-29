import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const normalizeRole = (role) => {
  if (!role) return '';
  return String(role).trim().toLowerCase();
};

const getDefaultPathForRole = (role) => {
  const r = normalizeRole(role);
  switch (r) {
    case 'superadmin':
      return '/superadmin/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'teacher':
      return '/teacher/dashboard';
    case 'student':
      return '/student/dashboard';
    case 'parent':
      return '/parent/dashboard';
    case 'accountsteam':
    case 'accounts':
      return '/accounts/dashboard';
    case 'transportteam':
    case 'transport':
      return '/transport/dashboard';
    default:
      return '/';
  }
};

const readStoredAuth = () => {
  try {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

const ProtectedRoute = ({ element, allowedRoles }) => {
  const location = useLocation();
  const [authReady, setAuthReady] = React.useState(false);
  const { token, user } = readStoredAuth();

  // Check if dev mode is enabled (always enable in development)
  const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  const devModeEnabled = isDevelopment || localStorage.getItem('DEV_MODE') === 'true';
  
  React.useEffect(() => {
    // In dev mode, auto-create mock auth if needed or if role doesn't match
    if (devModeEnabled) {
      // Check if we need to update the role
      const { token: currentToken, user: currentUser } = readStoredAuth();
      
      if (!currentToken || !currentUser || !allowedRoles?.includes(currentUser?.role)) {
        // Auto-set mock auth for dev testing with the required role
        const mockRole = allowedRoles?.[0] || 'Admin';
        const mockUser = {
          id: Math.random().toString(36).substr(2, 9),
          name: mockRole === 'Teacher' ? 'Demo Teacher' : 'Demo ' + mockRole,
          email: mockRole === 'Teacher' ? 'teacher1@demo.com' : mockRole === 'Admin' ? 'admin@demo.com' : `${mockRole.toLowerCase()}@demo.com`,
          role: mockRole,
          college: 'Demo College',
          collegeId: 'demo-college-001'
        };
        
        // Set auth data
        localStorage.setItem('token', 'dev-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('DEV_MODE', 'true');
        
        // Force re-render
        setAuthReady(!authReady);
      } else {
        // Auth is valid and role matches
        setAuthReady(true);
      }
    } else {
      setAuthReady(!!token && !!user);
    }
  }, [location.pathname, allowedRoles, devModeEnabled]);

  // Re-read auth after effect
  const { token: finalToken, user: finalUser } = readStoredAuth();
  
  // Non-dev mode: require proper auth
  if (!devModeEnabled && (!finalToken || !finalUser)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length && finalUser) {
    const userRole = normalizeRole(finalUser?.role);
    const allowed = allowedRoles.map(normalizeRole);

    if (!allowed.includes(userRole)) {
      return <Navigate to={getDefaultPathForRole(finalUser?.role)} replace />;
    }
  }

  return element;
};

export default ProtectedRoute;
