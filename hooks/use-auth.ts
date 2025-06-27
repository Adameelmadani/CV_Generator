
import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/CV_Generator/api/user/status');
        const data = await response.json();
        
        setAuthState({
          isAuthenticated: data.authenticated,
          isLoading: false,
          user: data.user
        });
      } catch (error) {
        console.error('Authentication check failed:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/CV_Generator/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: data.user
        });
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login request failed' };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/CV_Generator/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: data.user
        });
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Signup failed:', error);
      return { success: false, error: 'Signup request failed' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/CV_Generator/api/auth/logout', {
        method: 'POST'
      });
      
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null
      });
      
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      return { success: false, error: 'Logout request failed' };
    }
  };

  return {
    ...authState,
    login,
    signup,
    logout
  };
}