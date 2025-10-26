
'use client';

import { useState, useEffect } from 'react';
import { authService, User } from '../lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(authService.getCurrentUser());
    setIsLoading(false);
  }, []);

  return {
    user,
    isLoading,
    login: authService.login,
    register: authService.register,
    logout: authService.logout,
    isAuthenticated: authService.isAuthenticated,
  };
}