import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authService } from '../services/api';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with true for initial token validation

  // Simplified - just check if token exists for now
  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) {
      // Validate the token with the backend
      validateTokenWithBackend(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateTokenWithBackend = async (token) => {
    try {
      setLoading(true);
      const response = await authService.validateToken(token);
      const userData = response.data;
      
      // Set user state with actual validated data
      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role.toLowerCase(),
        name: userData.name,
        traineeId: userData.traineeId
      });
    } catch (error) {
      console.error('Token validation failed:', error);
      // Remove invalid token
      Cookies.remove('authToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { token, user: userData } = response.data;

      // Store token in cookie
      Cookies.set('authToken', token, { expires: 1 }); // 1 day

      // Set user state
      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role.toLowerCase(),
        name: userData.name,
        traineeId: userData.traineeId // Add trainee_id for interns
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid credentials' 
      };
    }
  };

  const googleLogin = async (idToken) => {
    try {
      const response = await authService.googleLogin(idToken);
      const { token, user: userData } = response.data;

      // Store token in cookie
      Cookies.set('authToken', token, { expires: 1 }); // 1 day

      // Set user state
      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role.toLowerCase(),
        name: userData.name,
        traineeId: userData.traineeId // Add trainee_id for interns
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Google login failed' 
      };
    }
  };

  const logout = () => {
    Cookies.remove('authToken');
    setUser(null);
  };

  // Function to check if user can edit a specific project
  const canEditProject = async (projectId) => {
    console.log('AuthContext canEditProject:', { user, projectId });
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('authToken')}`
        }
      });
      console.log('AuthContext project permission response:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking project permissions:', error);
      return false;
    }
  };

  // Function to check if user can edit a specific team
  const canEditTeam = async (teamId) => {
    console.log('AuthContext canEditTeam:', { user, teamId });
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/teams/${teamId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('authToken')}`
        }
      });
      console.log('AuthContext team permission response:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking team permissions:', error);
      return false;
    }
  };

  const value = {
    user,
    login,
    googleLogin,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isIntern: user?.role === 'intern',
    canEditProject,
    canEditTeam,
    // Deprecated: for backward compatibility during transition
    isTeamLeader: false, // This will always be false now since we removed the global role
    isProjectManager: false, // This will always be false now since we removed the global role
    isInternRole: user?.role === 'intern' // Specific check for intern role only
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
