import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'auth_state';

interface AuthState {
  user: User;
  token: string;
  expiresAt?: number;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const authData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (authData) {
        const { user, token, expiresAt }: AuthState = JSON.parse(authData);
        
        // Check if token is expired
        if (expiresAt && Date.now() >= expiresAt) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          return;
        }

        // Set token in axios instance
        if (token) {
          localStorage.setItem('token', token); // Keep this for backward compatibility with api.ts
        }

        setUser(user);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveAuthState = (authResponse: AuthResponse) => {
    const user: User = {
      id: authResponse.id,
      email: authResponse.email,
      name: authResponse.name,
      role: authResponse.role
    };

    // Calculate token expiration (24 hours from now)
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    // Save auth state
    const authState: AuthState = {
      user,
      token: authResponse.token,
      expiresAt
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    localStorage.setItem('token', authResponse.token); // Keep this for backward compatibility with api.ts
    setUser(user);
  };

  const login = async (data: LoginRequest) => {
    try {
      const response = await api.login(data);
      saveAuthState(response);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await api.register(data);
      saveAuthState(response);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('token'); // Remove token for backward compatibility
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 