import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();
  const userString = localStorage.getItem('user');
  
  if (!userString) {
    // Not logged in
    const redirectPath = requiredRole === 'employer' ? '/login/employer' : '/login/seeker';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  try {
    const user = JSON.parse(userString);
    if (!user || !user.token) {
      const redirectPath = requiredRole === 'employer' ? '/login/employer' : '/login/seeker';
      return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
      // Role mismatch
      const redirectPath = requiredRole === 'employer' ? '/login/employer' : '/';
      return <Navigate to={redirectPath} replace />;
    }
  } catch (error) {
    localStorage.removeItem('user');
    const redirectPath = requiredRole === 'employer' ? '/login/employer' : '/login/seeker';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return children;
}
