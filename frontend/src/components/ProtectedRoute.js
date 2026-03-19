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
  const { token, user } = readStoredAuth();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length) {
    const userRole = normalizeRole(user?.role);
    const allowed = allowedRoles.map(normalizeRole);

    if (!allowed.includes(userRole)) {
      return <Navigate to={getDefaultPathForRole(user?.role)} replace />;
    }
  }

  return element;
};

export default ProtectedRoute;
