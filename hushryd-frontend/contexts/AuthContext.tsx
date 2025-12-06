import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  name?: string; // For backward compatibility
  email: string;
  role: 'superadmin' | 'admin' | 'support' | 'manager';
  permissions?: any[];
  isActive?: boolean;
}

// Simple storage utility using localStorage (works on web and can be mocked for native)
const Storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      console.log('Storage.getItem called with key:', key);
      if (typeof localStorage !== 'undefined') {
        const result = localStorage.getItem(key);
        console.log('Storage.getItem result:', result);
        return result;
      }
      console.log('localStorage not available');
      return null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      console.log('Storage.setItem called with key:', key, 'value:', value);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        console.log('Storage.setItem successful');
      } else {
        console.log('localStorage not available for setItem');
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      console.log('Storage.removeItem called with key:', key);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
        console.log('Storage.removeItem successful');
      } else {
        console.log('localStorage not available for removeItem');
      }
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  }
};

interface User {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  mobileNumber: string;
  role?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

interface AuthContextType {
  admin: Admin | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginUser: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  registerUser: (userData: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Admin credentials are now handled by the backend API

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const adminData = await Storage.getItem('admin_session');
      if (adminData) {
        const parsedAdmin = JSON.parse(adminData);
        setAdmin(parsedAdmin);
      }
      
      const userData = await Storage.getItem('user_session');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Login attempt:', { email, password: '***' });
      
      // Call the real API
      const response = await apiService.adminLogin(email, password);
      
      console.log('API response:', response);

      if (response.success && response.data) {
        const adminData = {
          id: response.data.admin.id,
          firstName: response.data.admin.firstName,
          lastName: response.data.admin.lastName,
          name: `${response.data.admin.firstName} ${response.data.admin.lastName}`, // For backward compatibility
          email: response.data.admin.email,
          role: response.data.admin.role,
          permissions: response.data.admin.permissions,
          isActive: response.data.admin.isActive,
        };

        console.log('Admin data to store:', adminData);

        // Save token to storage
        await apiService.saveToken(response.data.token);

        // Store session data
        await Storage.setItem('admin_session', JSON.stringify(adminData));
        setAdmin(adminData);

        console.log('Login successful, admin set:', adminData);
        return { success: true, message: 'Login successful!' };
      } else {
        console.log('Login failed:', response.message);
        return { success: false, message: response.message || 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const loginUser = async (token: string): Promise<void> => {
    try {
      await apiService.saveToken(token);
      
      // Fetch user data using the token
      const userResponse = await apiService.getUserProfile(token);
      if (userResponse.success && userResponse.data) {
        const userData = {
          id: userResponse.data.id,
          firstName: userResponse.data.firstName,
          lastName: userResponse.data.lastName,
          name: userResponse.data.name,
          email: userResponse.data.email,
          mobileNumber: userResponse.data.mobileNumber,
          role: userResponse.data.role,
          emergencyContact: userResponse.data.emergencyContact,
        };
        
        // Store user session data
        await Storage.setItem('user_session', JSON.stringify(userData));
        setUser(userData);
        console.log('User logged in successfully:', userData);
      }
    } catch (error) {
      console.error('Login user error:', error);
    }
  };

  const registerUser = async (userData: any): Promise<any> => {
    try {
      const response = await apiService.registerUser(userData);
      if (response.success) {
        // Auto login after registration
        await loginUser(response.token);
      }
      return response;
    } catch (error) {
      console.error('Register user error:', error);
      return { success: false, message: 'Registration failed' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Remove token from storage
      await apiService.removeToken();
      
      // Remove session data
      await Storage.removeItem('admin_session');
      await Storage.removeItem('user_session');
      setAdmin(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    admin,
    user,
    isAuthenticated: !!admin || !!user,
    isLoading,
    login,
    loginUser,
    logout,
    registerUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
