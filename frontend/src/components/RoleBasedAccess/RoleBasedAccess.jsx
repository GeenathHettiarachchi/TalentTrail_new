import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const RoleBasedAccess = ({ 
  children, 
  adminOnly = false, 
  internOnly = false,
  fallback = null 
}) => {
  const { user, isAdmin, isIntern } = useAuth();

  // If no user is authenticated, don't render anything
  if (!user) {
    return fallback;
  }

  // If admin only and user is not admin, don't render
  if (adminOnly && !isAdmin) {
    return fallback;
  }

  // If intern only and user is not intern, don't render
  if (internOnly && !isIntern) {
    return fallback;
  }

  return children;
};

export default RoleBasedAccess;
