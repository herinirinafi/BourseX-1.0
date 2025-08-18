import { API_BASE_URL } from '../../config/api';

class AdminService {
  private baseURL = `${API_BASE_URL}/admin`;

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Dashboard Stats
  async getDashboardStats() {
    return this.request('/dashboard-stats/');
  }

  // User Management
  async getUsers(page = 1, search = '', filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      search,
      ...filters,
    });
    return this.request(`/users/?${params}`);
  }

  async getUserStats() {
    return this.request('/users/stats/');
  }

  async addUserXP(userId: number, amount: number) {
    return this.request(`/users/${userId}/add_xp/`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async adjustUserBalance(userId: number, amount: number, operation: 'add' | 'subtract' | 'set') {
    return this.request(`/users/${userId}/adjust_balance/`, {
      method: 'POST',
      body: JSON.stringify({ amount, operation }),
    });
  }

  async bulkUserOperations(operation: string, userIds: number[], amount?: number) {
    return this.request('/bulk-operations/', {
      method: 'POST',
      body: JSON.stringify({ operation, user_ids: userIds, amount }),
    });
  }

  // Stock Management
  async getStocks(page = 1, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      search,
    });
    return this.request(`/stocks/?${params}`);
  }

  async bulkUpdatePrices() {
    return this.request('/stocks/bulk_update_prices/', {
      method: 'POST',
    });
  }

  async setStockPrice(stockId: number, price: number) {
    return this.request(`/stocks/${stockId}/set_price/`, {
      method: 'POST',
      body: JSON.stringify({ price }),
    });
  }

  async createStock(stockData: any) {
    return this.request('/stocks/', {
      method: 'POST',
      body: JSON.stringify(stockData),
    });
  }

  async updateStock(stockId: number, stockData: any) {
    return this.request(`/stocks/${stockId}/`, {
      method: 'PUT',
      body: JSON.stringify(stockData),
    });
  }

  async deleteStock(stockId: number) {
    return this.request(`/stocks/${stockId}/`, {
      method: 'DELETE',
    });
  }

  // Transaction Management
  async getTransactions(page = 1, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      ...filters,
    });
    return this.request(`/transactions/?${params}`);
  }

  async getTransactionStats() {
    return this.request('/transactions/stats/');
  }

  // Mission Management
  async getMissions(page = 1, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      search,
    });
    return this.request(`/missions/?${params}`);
  }

  async createMission(missionData: any) {
    return this.request('/missions/', {
      method: 'POST',
      body: JSON.stringify(missionData),
    });
  }

  async updateMission(missionId: number, missionData: any) {
    return this.request(`/missions/${missionId}/`, {
      method: 'PUT',
      body: JSON.stringify(missionData),
    });
  }

  async deleteMission(missionId: number) {
    return this.request(`/missions/${missionId}/`, {
      method: 'DELETE',
    });
  }

  async assignMissionToUsers(missionId: number, userIds: number[]) {
    return this.request(`/missions/${missionId}/assign_to_users/`, {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds }),
    });
  }

  async createDailyMissions() {
    return this.request('/missions/create_daily_missions/', {
      method: 'POST',
    });
  }

  // Badge Management
  async getBadges(page = 1, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      search,
    });
    return this.request(`/badges/?${params}`);
  }

  async createBadge(badgeData: any) {
    return this.request('/badges/', {
      method: 'POST',
      body: JSON.stringify(badgeData),
    });
  }

  async updateBadge(badgeId: number, badgeData: any) {
    return this.request(`/badges/${badgeId}/`, {
      method: 'PUT',
      body: JSON.stringify(badgeData),
    });
  }

  async deleteBadge(badgeId: number) {
    return this.request(`/badges/${badgeId}/`, {
      method: 'DELETE',
    });
  }

  async awardBadgeToUsers(badgeId: number, userIds: number[]) {
    return this.request(`/badges/${badgeId}/award_to_users/`, {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds }),
    });
  }
}

export const adminService = new AdminService();
