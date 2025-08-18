import { ENDPOINTS } from '../config/api';
import { apiClient } from './apiClient';

export type JwtLoginResponse = {
  access: string;
  refresh: string;
  user?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
    is_active: boolean;
  };
};

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  userprofile?: {
    level: number;
    xp: number;
    balance: number;
    total_trades: number;
    successful_trades: number;
    trading_score: number;
  };
};

export const authService = {
  async login(username: string, password: string): Promise<JwtLoginResponse> {
    const res = await apiClient.post(ENDPOINTS.LOGIN, { username, password });
    return res as JwtLoginResponse;
  },
  
  async refresh(refresh: string): Promise<{ access: string }> {
    const res = await apiClient.post(ENDPOINTS.REFRESH_TOKEN, { refresh });
    return res as { access: string };
  },
  
  async getUserProfile(): Promise<UserProfile> {
    const res = await apiClient.get('/api/auth/profile/');
    return res as UserProfile;
  },
  
  async getCurrentUser(): Promise<UserProfile> {
    console.log('🔍 Getting current user from:', ENDPOINTS.USER);
    const res = await apiClient.get(ENDPOINTS.USER);
    console.log('👤 Current user response:', res);
    return res as UserProfile;
  },

  // Generic API call method for admin operations
  async apiCall(endpoint: string, options: {
    method?: string;
    body?: string;
    headers?: Record<string, string>;
  } = {}): Promise<any> {
    const { method = 'GET', body, headers = {} } = options;
    
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...(body && { body }),
    };

    if (method === 'GET') {
      return await apiClient.get(endpoint);
    } else if (method === 'POST') {
      return await apiClient.post(endpoint, body ? JSON.parse(body) : {});
    } else if (method === 'PUT') {
      return await apiClient.put(endpoint, body ? JSON.parse(body) : {});
    } else if (method === 'DELETE') {
      return await apiClient.delete(endpoint);
    }
    
    throw new Error(`Unsupported method: ${method}`);
  },
  
  // Decode JWT token to get user info (fallback method)
  decodeToken(token: string): any {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('🔓 Decoded token payload:', payload);
      return payload;
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return null;
    }
  },
  
  // Check if user is admin from token
  isAdminUser(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      const isAdmin = payload?.is_staff || false;
      console.log('🔐 Is admin user?', isAdmin, 'from payload:', payload);
      return isAdmin;
    } catch {
      console.log('❌ Failed to check admin status');
      return false;
    }
  }
};
