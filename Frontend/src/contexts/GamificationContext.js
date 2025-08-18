/**
 * Context Provider pour la gamification intégrée
 * Combine tous les services de gamification en un contexte global
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Platform } from 'react-native';
import { gamificationService } from '../services/gamificationService';
import { pushNotificationService } from '../services/pushNotificationService';
import { gamificationAnalytics } from '../services/gamificationAnalytics';
import { useAuth } from './AuthContext';
import { showToast } from '../services/toast';

// État initial
const initialState = {
  // Données utilisateur
  userProfile: null,
  userBadges: [],
  userAchievements: [],
  dailyStreak: null,
  leaderboardRanks: {},
  
  // Notifications
  notifications: [],
  unreadCount: 0,
  
  // État de l'application
  loading: false,
  error: null,
  
  // Gamification en temps réel
  recentRewards: [],
  currentLevel: 1,
  currentXP: 0,
  
  // Analytics
  sessionMetrics: {
    badgesViewed: 0,
    achievementsViewed: 0,
    leaderboardViews: 0,
    notificationsTapped: 0,
    screensVisited: [],
  }
};

// Actions
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USER_PROFILE: 'SET_USER_PROFILE',
  SET_USER_BADGES: 'SET_USER_BADGES',
  SET_USER_ACHIEVEMENTS: 'SET_USER_ACHIEVEMENTS',
  SET_DAILY_STREAK: 'SET_DAILY_STREAK',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  ADD_RECENT_REWARD: 'ADD_RECENT_REWARD',
  UPDATE_LEVEL: 'UPDATE_LEVEL',
  UPDATE_XP: 'UPDATE_XP',
  INCREMENT_METRIC: 'INCREMENT_METRIC',
  ADD_SCREEN_VISIT: 'ADD_SCREEN_VISIT',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  CLEAR_RECENT_REWARDS: 'CLEAR_RECENT_REWARDS',
};

// Reducer
const gamificationReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.SET_USER_PROFILE:
      return { 
        ...state, 
        userProfile: action.payload,
        currentLevel: action.payload?.level || state.currentLevel,
        currentXP: action.payload?.xp || state.currentXP
      };
    
    case ACTIONS.SET_USER_BADGES:
      return { ...state, userBadges: action.payload };
    
    case ACTIONS.SET_USER_ACHIEVEMENTS:
      return { ...state, userAchievements: action.payload };
    
    case ACTIONS.SET_DAILY_STREAK:
      return { ...state, dailyStreak: action.payload };
    
    case ACTIONS.SET_NOTIFICATIONS:
      return { 
        ...state, 
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.is_read).length
      };
    
    case ACTIONS.SET_UNREAD_COUNT:
      return { ...state, unreadCount: action.payload };
    
    case ACTIONS.ADD_RECENT_REWARD:
      return {
        ...state,
        recentRewards: [action.payload, ...state.recentRewards].slice(0, 5)
      };
    
    case ACTIONS.UPDATE_LEVEL:
      return { ...state, currentLevel: action.payload };
    
    case ACTIONS.UPDATE_XP:
      return { ...state, currentXP: action.payload };
    
    case ACTIONS.INCREMENT_METRIC:
      return {
        ...state,
        sessionMetrics: {
          ...state.sessionMetrics,
          [action.payload]: state.sessionMetrics[action.payload] + 1
        }
      };
    
    case ACTIONS.ADD_SCREEN_VISIT:
      const updatedScreens = [...state.sessionMetrics.screensVisited];
      if (!updatedScreens.includes(action.payload)) {
        updatedScreens.push(action.payload);
      }
      return {
        ...state,
        sessionMetrics: {
          ...state.sessionMetrics,
          screensVisited: updatedScreens
        }
      };
    
    case ACTIONS.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    
    case ACTIONS.CLEAR_RECENT_REWARDS:
      return { ...state, recentRewards: [] };
    
    default:
      return state;
  }
};

// Contexte
const GamificationContext = createContext();

// Provider
export const GamificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gamificationReducer, initialState);
  const { isAuthenticated, logout } = useAuth();

  // Initialisation
  useEffect(() => {
    if (isAuthenticated) {
      initializeGamification();
    } else {
      // When logged out, clear minimal state and avoid network calls
      dispatch({ type: ACTIONS.SET_NOTIFICATIONS, payload: [] });
      dispatch({ type: ACTIONS.SET_USER_BADGES, payload: [] });
      dispatch({ type: ACTIONS.SET_USER_ACHIEVEMENTS, payload: [] });
      dispatch({ type: ACTIONS.SET_USER_PROFILE, payload: null });
      dispatch({ type: ACTIONS.SET_DAILY_STREAK, payload: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const initializeGamification = async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      // Éviter les appels si non authentifié
      if (!isAuthenticated) {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        return;
      }
      
      // Initialiser les services
      if (Platform.OS !== 'web') {
        await pushNotificationService.initialize();
      }
      gamificationAnalytics.trackEvent('gamification_session_started');

      // Vérifier l'autorisation avec un appel léger avant de paralléliser
      try {
        await gamificationService.getGamificationSummary();
      } catch (err) {
        const status = err?.status || err?.response?.status;
        if (status === 401) {
          showToast?.info?.('Session expirée', 'Veuillez vous reconnecter');
          logout?.();
          return; // Stop further calls
        }
        throw err;
      }

      // Charger les données initiales (maintenant que l'auth est validée)
      await Promise.all([
        loadUserProfile(),
        loadUserBadges(),
        loadUserAchievements(),
        loadNotifications(),
        loadDailyStreak(),
      ]);
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la gamification:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Chargement des données
  const loadUserProfile = async () => {
    try {
      const summary = await gamificationService.getGamificationSummary();
      dispatch({ type: ACTIONS.SET_USER_PROFILE, payload: summary.user_profile });
      return summary.user_profile;
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const loadUserBadges = async () => {
    try {
      const badges = await gamificationService.getUserBadges();
      dispatch({ type: ACTIONS.SET_USER_BADGES, payload: badges });
      return badges;
    } catch (error) {
      console.error('Erreur lors du chargement des badges:', error);
    }
  };

  const loadUserAchievements = async () => {
    try {
      const achievements = await gamificationService.getUserAchievements();
      dispatch({ type: ACTIONS.SET_USER_ACHIEVEMENTS, payload: achievements });
      return achievements;
    } catch (error) {
      console.error('Erreur lors du chargement des achievements:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const notifications = await gamificationService.getNotifications();
      dispatch({ type: ACTIONS.SET_NOTIFICATIONS, payload: notifications });
      return notifications;
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  };

  const loadDailyStreak = async () => {
    try {
      const streak = await gamificationService.getDailyStreak();
      dispatch({ type: ACTIONS.SET_DAILY_STREAK, payload: streak });
      return streak;
    } catch (error) {
      console.error('Erreur lors du chargement du streak:', error);
    }
  };

  // Actions de gamification
  const triggerGamificationUpdate = async () => {
    try {
      const result = await gamificationService.triggerGamificationUpdate();
      
      // Traiter les récompenses
      if (result.badges_awarded > 0) {
        await handleBadgesAwarded(result.badges_awarded);
      }
      
      if (result.achievements_awarded > 0) {
        await handleAchievementsAwarded(result.achievements_awarded);
      }
      
      if (result.level_up) {
        await handleLevelUp(result.new_level);
      }
      
      // Recharger les données
      await Promise.all([
        loadUserProfile(),
        loadUserBadges(),
        loadUserAchievements(),
      ]);
      
      return result;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la gamification:', error);
      throw error;
    }
  };

  const handleBadgesAwarded = async (count) => {
    // Recharger les badges pour obtenir les nouveaux
    const newBadges = await loadUserBadges();
    const latestBadges = newBadges.slice(-count);
    
    // Notifications push et analytics
    for (const userBadge of latestBadges) {
      await pushNotificationService.notifyBadgeEarned(userBadge.badge);
      gamificationAnalytics.trackBadgeEarned(userBadge.badge);
      
      dispatch({
        type: ACTIONS.ADD_RECENT_REWARD,
        payload: {
          type: 'badge',
          data: userBadge.badge,
          timestamp: Date.now()
        }
      });
    }
  };

  const handleAchievementsAwarded = async (count) => {
    const newAchievements = await loadUserAchievements();
    const latestAchievements = newAchievements
      .filter(ua => ua.earned_at)
      .slice(-count);
    
    for (const userAchievement of latestAchievements) {
      await pushNotificationService.notifyAchievementUnlocked(userAchievement.achievement);
      gamificationAnalytics.trackAchievementUnlocked(userAchievement.achievement);
      
      dispatch({
        type: ACTIONS.ADD_RECENT_REWARD,
        payload: {
          type: 'achievement',
          data: userAchievement.achievement,
          timestamp: Date.now()
        }
      });
    }
  };

  const handleLevelUp = async (newLevel) => {
    const oldLevel = state.currentLevel;
    
    await pushNotificationService.notifyLevelUp(oldLevel, newLevel);
    gamificationAnalytics.trackLevelUp(oldLevel, newLevel, state.currentXP);
    
    dispatch({ type: ACTIONS.UPDATE_LEVEL, payload: newLevel });
    dispatch({
      type: ACTIONS.ADD_RECENT_REWARD,
      payload: {
        type: 'level_up',
        data: { oldLevel, newLevel },
        timestamp: Date.now()
      }
    });
  };

  // Actions de notifications
  const markNotificationAsRead = async (notificationId) => {
    try {
      await gamificationService.markNotificationAsRead(notificationId);
      dispatch({ type: ACTIONS.MARK_NOTIFICATION_READ, payload: notificationId });
      
      gamificationAnalytics.trackEvent('notification_marked_read', {
        notification_id: notificationId
      });
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await gamificationService.markAllNotificationsAsRead();
      await loadNotifications();
      
      gamificationAnalytics.trackEvent('all_notifications_marked_read');
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  };

  // Actions d'analytics
  const trackScreenView = (screenName) => {
    dispatch({ type: ACTIONS.ADD_SCREEN_VISIT, payload: screenName });
    gamificationAnalytics.trackEvent('screen_view', { screen_name: screenName });
  };

  const trackBadgeView = (badge, isEarned) => {
    dispatch({ type: ACTIONS.INCREMENT_METRIC, payload: 'badgesViewed' });
    gamificationAnalytics.trackBadgeViewed(badge, { is_earned: isEarned });
  };

  const trackAchievementView = (achievement, progress) => {
    dispatch({ type: ACTIONS.INCREMENT_METRIC, payload: 'achievementsViewed' });
    gamificationAnalytics.trackAchievementViewed(achievement, progress);
  };

  const trackLeaderboardView = (leaderboardType, userRank) => {
    dispatch({ type: ACTIONS.INCREMENT_METRIC, payload: 'leaderboardViews' });
    gamificationAnalytics.trackLeaderboardView(leaderboardType, userRank);
  };

  const trackNotificationTap = (notification) => {
    dispatch({ type: ACTIONS.INCREMENT_METRIC, payload: 'notificationsTapped' });
    gamificationAnalytics.trackNotificationTapped(notification);
  };

  // Utilitaires
  const clearRecentRewards = () => {
    dispatch({ type: ACTIONS.CLEAR_RECENT_REWARDS });
  };

  const getProgressToNextLevel = () => {
    const currentXP = state.currentXP;
    const currentLevel = state.currentLevel;
    const currentLevelXP = (currentLevel - 1) * 100;
    const nextLevelXP = currentLevel * 100;
    const progressXP = currentXP - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    
    return {
      current: progressXP,
      needed: neededXP,
      percentage: (progressXP / neededXP) * 100
    };
  };

  // Valeur du contexte
  const contextValue = {
    // État
    ...state,
    
    // Actions de données
    loadUserProfile,
    loadUserBadges,
    loadUserAchievements,
    loadNotifications,
    loadDailyStreak,
    
    // Actions de gamification
    triggerGamificationUpdate,
    
    // Actions de notifications
    markNotificationAsRead,
    markAllNotificationsAsRead,
    
    // Actions d'analytics
    trackScreenView,
    trackBadgeView,
    trackAchievementView,
    trackLeaderboardView,
    trackNotificationTap,
    
    // Utilitaires
    clearRecentRewards,
    getProgressToNextLevel,
    
    // Services directs
    gamificationService,
    pushNotificationService,
    gamificationAnalytics,
  };

  return (
    <GamificationContext.Provider value={contextValue}>
      {children}
    </GamificationContext.Provider>
  );
};

// Hook personnalisé
export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

export default GamificationContext;
