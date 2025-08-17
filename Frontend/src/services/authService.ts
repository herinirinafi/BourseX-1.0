import { ENDPOINTS } from '../config/api';
import { apiClient } from './apiClient';

export type JwtLoginResponse = {
  access: string;
  refresh: string;
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
};
