import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api';
import { LoginRequest, RegisterRequest, UserResponse } from '../types';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app load, verify token and get user data
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.verify();
        setUser(userData);
      } catch (error) {
        // Token invalid or expired - clear it
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (data: LoginRequest): Promise<void> => {
    const response = await authApi.login(data);

    // Save only token to localStorage
    localStorage.setItem('token', response.token);

    // Store user data in memory (state)
    setUser({
      id: response.userId,
      name: response.name,
      email: response.email,
      enabled: true,
      createdAt: '',
    });
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    const response = await authApi.register(data);

    // Save only token to localStorage
    localStorage.setItem('token', response.token);

    // Store user data in memory (state)
    setUser({
      id: response.userId,
      name: response.name,
      email: response.email,
      enabled: true,
      createdAt: '',
    });
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
