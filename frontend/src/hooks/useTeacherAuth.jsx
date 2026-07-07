import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { teacherAuthService } from '@/services/teacherAuthService';
import { useToast } from '@/hooks/useToast';

export const TeacherAuthContext = createContext(null);

export function TeacherAuthProvider({ children }) {
  const [teacherUser, setTeacherUser] = useState(null);
  const [teacherToken, setTeacherToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Load token and user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('xebia-teacher-token');
    const storedUser = localStorage.getItem('xebia-teacher-user');
    
    if (storedToken && storedUser) {
      setTeacherToken(storedToken);
      try {
        setTeacherUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('xebia-teacher-user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await teacherAuthService.login(email, password);
      const { accessToken, refreshToken, user } = data;
      
      localStorage.setItem('xebia-teacher-token', accessToken);
      localStorage.setItem('xebia-teacher-refresh-token', refreshToken);
      localStorage.setItem('xebia-teacher-user', JSON.stringify(user));
      
      setTeacherToken(accessToken);
      setTeacherUser(user);
      
      showToast('Successfully logged in to Teacher Portal!', 'success');
      return user;
    } catch (error) {
      showToast(error.message || 'Invalid Email or Password.', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const register = useCallback(async (fullName, email, password) => {
    setLoading(true);
    try {
      const result = await teacherAuthService.register(fullName, email, password);
      showToast('Teacher account created successfully. Please sign in.', 'success');
      return result;
    } catch (error) {
      showToast(error.message || 'Registration failed.', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const logout = useCallback(() => {
    localStorage.removeItem('xebia-teacher-token');
    localStorage.removeItem('xebia-teacher-refresh-token');
    localStorage.removeItem('xebia-teacher-user');
    
    setTeacherToken(null);
    setTeacherUser(null);
    
    showToast('Logged out from Teacher Portal successfully', 'info');
  }, [showToast]);

  const value = useMemo(() => ({
    user: teacherUser,
    token: teacherToken,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!teacherToken,
  }), [teacherUser, teacherToken, loading, login, register, logout]);

  return (
    <TeacherAuthContext.Provider value={value}>
      {children}
    </TeacherAuthContext.Provider>
  );
}

export function useTeacherAuth() {
  const context = useContext(TeacherAuthContext);
  if (!context) {
    throw new Error('useTeacherAuth must be used within a TeacherAuthProvider');
  }
  return context;
}
