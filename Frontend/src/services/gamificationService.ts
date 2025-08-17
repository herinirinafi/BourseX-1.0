/**
 * Service de gamification pour BourseX
 * Gère toutes les interactions avec les endpoints de gamification
 */
import { API_BASE_URL, ENDPOINTS } from '../config/api';
import { apiClient } from './apiClient';

export interface Badge {
  id: number;
  name: string;
  description: string;
  badge_type: string;
  tier: string;
  icon_url: string;
  xp_bonus: number;
}

export interface UserBadge {
  id: number;
  badge: Badge;
  earned_at: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  reward_xp: number;
  reward_money: number;
  badge?: Badge;
  is_hidden: boolean;
}

export interface UserAchievement {
  id: number;
  achievement: Achievement;
  earned_at: string | null;
  progress: number;
}

export interface DailyStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

export interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  user_profile: {
    level: number;
    badge_count: number;
    trading_score: number;
  };
  leaderboard_type: string;
  score: number;
  rank: number;
  updated_at: string;
}

export interface GamificationSummary {
  user_profile: any;
  badges: UserBadge[];
  achievements: UserAchievement[];
  daily_streak: DailyStreak;
  leaderboard_ranks: Record<string, number>;
  recent_notifications: Notification[];
  progress_to_next_level: number;
  weekly_stats: Record<string, any>;
}

class GamificationService {
  private baseURL = API_BASE_URL;

  private async apiCall(endpoint: string, options: any = {}): Promise<any> {
    try {
      const method = (options.method || 'GET') as 'GET' | 'POST' | 'PATCH' | 'DELETE';
      const body = options.body;
      if (method === 'GET') return await apiClient.get(endpoint, options);
      if (method === 'POST') return await apiClient.post(endpoint, body, options);
      if (method === 'PATCH') return await apiClient.patch(endpoint, body, options);
      if (method === 'DELETE') return await apiClient.delete(endpoint, options);
      return await apiClient.request(endpoint, options);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  /**
   * Récupère le résumé complet de gamification de l'utilisateur
   */
  async getGamificationSummary(): Promise<GamificationSummary> {
  return await this.apiCall(ENDPOINTS.GAMIFICATION_SUMMARY);
  }

  /**
   * Récupère tous les badges disponibles
   */
  async getAllBadges(): Promise<Badge[]> {
  return await this.apiCall(ENDPOINTS.BADGES);
  }

  /**
   * Récupère les badges de l'utilisateur
   */
  async getUserBadges(): Promise<UserBadge[]> {
  return await this.apiCall(ENDPOINTS.USER_BADGES);
  }

  /**
   * Récupère tous les achievements disponibles
   */
  async getAllAchievements(): Promise<Achievement[]> {
  return await this.apiCall(ENDPOINTS.ACHIEVEMENTS);
  }

  /**
   * Récupère les achievements de l'utilisateur
   */
  async getUserAchievements(): Promise<UserAchievement[]> {
  return await this.apiCall(ENDPOINTS.USER_ACHIEVEMENTS);
  }

  /**
   * Récupère le leaderboard par type
   */
  async getLeaderboard(type: string = 'XP'): Promise<LeaderboardEntry[]> {
  return await this.apiCall(`${ENDPOINTS.LEADERBOARD}?type=${type}`);
  }

  /**
   * Récupère tous les leaderboards
   */
  async getAllLeaderboards(): Promise<{
    xp_leaderboard: LeaderboardEntry[];
    profit_leaderboard: LeaderboardEntry[];
    trades_leaderboard: LeaderboardEntry[];
    portfolio_leaderboard: LeaderboardEntry[];
    user_rank_summary: Record<string, number>;
  }> {
    return await this.apiCall(`${ENDPOINTS.LEADERBOARD}all_leaderboards/`);
  }

  /**
   * Récupère le streak quotidien de l'utilisateur
   */
  async getDailyStreak(): Promise<DailyStreak> {
  return await this.apiCall(ENDPOINTS.DAILY_STREAK);
  }

  /**
   * Récupère les notifications de l'utilisateur
   */
  async getNotifications(unread_only: boolean = false): Promise<Notification[]> {
  const url = unread_only ? `${ENDPOINTS.NOTIFICATIONS}?unread=true` : ENDPOINTS.NOTIFICATIONS;
    return await this.apiCall(url);
  }

  /**
   * Marque une notification comme lue
   */
  async markNotificationAsRead(notificationId: number): Promise<void> {
  await this.apiCall(`${ENDPOINTS.NOTIFICATIONS}${notificationId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true })
    });
  }

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllNotificationsAsRead(): Promise<void> {
  await this.apiCall(ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ, {
      method: 'POST'
    });
  }

  /**
   * Récupère le nombre de notifications non lues
   */
  async getUnreadNotificationCount(): Promise<number> {
  const response = await this.apiCall(`${ENDPOINTS.NOTIFICATIONS}unread_count/`);
    return response.count;
  }

  /**
   * Force la mise à jour de la gamification pour l'utilisateur
   */
  async triggerGamificationUpdate(): Promise<{
    badges_awarded: number;
    achievements_awarded: number;
    level_up: boolean;
    new_level: number;
  }> {
    return await this.apiCall(ENDPOINTS.GAMIFICATION_UPDATE, {
      method: 'POST'
    });
  }

  /**
   * Récupère les statistiques de progression de l'utilisateur
   */
  async getProgressStats(): Promise<{
    current_level: number;
    current_xp: number;
    xp_to_next_level: number;
    progress_percentage: number;
    total_badges: number;
    total_achievements: number;
    completion_rate: number;
  }> {
    // Not implemented in backend yet; keep endpoint for future use
    return await this.apiCall('/gamification/progress/');
  }
}

export const gamificationService = new GamificationService();
