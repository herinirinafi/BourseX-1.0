/**
 * Service de notifications push pour la gamification
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

class PushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.notificationListener = null;
    this.responseListener = null;
  }

  /**
   * Configure les notifications push
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Configuration des notifications
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Demander les permissions
      await this.requestPermissions();

      // Enregistrer les listeners
      this.registerNotificationListeners();

      this.isInitialized = true;
      console.log('✅ Service de notifications push initialisé');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des notifications:', error);
    }
  }

  /**
   * Demande les permissions pour les notifications
   */
  async requestPermissions() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Permission de notification refusée');
      }

      // Configuration pour Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('gamification', {
          name: 'Gamification',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } else {
      throw new Error('Les notifications push ne fonctionnent que sur des appareils physiques');
    }
  }

  /**
   * Enregistre les listeners pour les notifications
   */
  registerNotificationListeners() {
    // Listener pour les notifications reçues pendant que l'app est active
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification reçue:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener pour les interactions avec les notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification touchée:', response);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Gère les notifications reçues
   */
  handleNotificationReceived(notification) {
    const { data } = notification.request.content;
    
    // Traitement spécifique selon le type de notification
    switch (data?.type) {
      case 'BADGE':
        this.handleBadgeNotification(data);
        break;
      case 'ACHIEVEMENT':
        this.handleAchievementNotification(data);
        break;
      case 'LEVEL_UP':
        this.handleLevelUpNotification(data);
        break;
      case 'MISSION':
        this.handleMissionNotification(data);
        break;
      default:
        console.log('Type de notification non géré:', data?.type);
    }
  }

  /**
   * Gère les réponses aux notifications (tap)
   */
  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    // Navigation vers l'écran approprié selon le type
    if (data?.screen) {
      // Ici, vous pourriez utiliser votre système de navigation
      console.log('Navigation vers:', data.screen);
    }
  }

  /**
   * Traite les notifications de badges
   */
  handleBadgeNotification(data) {
    console.log('🏆 Nouveau badge obtenu:', data.badge_name);
    // Ici, vous pourriez mettre à jour le state global ou déclencher des animations
  }

  /**
   * Traite les notifications d'achievements
   */
  handleAchievementNotification(data) {
    console.log('🎯 Nouvel achievement débloqué:', data.achievement_name);
  }

  /**
   * Traite les notifications de level up
   */
  handleLevelUpNotification(data) {
    console.log('📈 Level up! Nouveau niveau:', data.new_level);
  }

  /**
   * Traite les notifications de missions
   */
  handleMissionNotification(data) {
    console.log('🎖️ Mission complétée:', data.mission_name);
  }

  /**
   * Planifie une notification locale pour la gamification
   */
  async scheduleGamificationNotification({
    type,
    title,
    body,
    data = {},
    trigger = null
  }) {
    try {
      const notificationContent = {
        title,
        body,
        data: {
          type,
          ...data
        },
        sound: 'default',
      };

      if (Platform.OS === 'android') {
        notificationContent.channelId = 'gamification';
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: trigger || null, // null = immédiat
      });

      console.log(`📲 Notification ${type} planifiée:`, notificationId);
      return notificationId;
    } catch (error) {
      console.error('Erreur lors de la planification de la notification:', error);
    }
  }

  /**
   * Notifications spécifiques pour la gamification
   */
  
  async notifyBadgeEarned(badge) {
    return this.scheduleGamificationNotification({
      type: 'BADGE',
      title: '🏆 Badge Obtenu!',
      body: `Félicitations! Vous avez obtenu le badge "${badge.name}"`,
      data: {
        badge_id: badge.id,
        badge_name: badge.name,
        xp_bonus: badge.xp_bonus,
        screen: 'BadgesScreen'
      }
    });
  }

  async notifyAchievementUnlocked(achievement) {
    return this.scheduleGamificationNotification({
      type: 'ACHIEVEMENT',
      title: '🎯 Achievement Débloqué!',
      body: `Vous avez débloqué "${achievement.name}"! +${achievement.reward_xp} XP`,
      data: {
        achievement_id: achievement.id,
        achievement_name: achievement.name,
        reward_xp: achievement.reward_xp,
        reward_money: achievement.reward_money,
        screen: 'AchievementsScreen'
      }
    });
  }

  async notifyLevelUp(oldLevel, newLevel) {
    return this.scheduleGamificationNotification({
      type: 'LEVEL_UP',
      title: '📈 Level Up!',
      body: `Félicitations! Vous êtes maintenant niveau ${newLevel}!`,
      data: {
        old_level: oldLevel,
        new_level: newLevel,
        screen: 'ProfileScreen'
      }
    });
  }

  async notifyMissionCompleted(mission) {
    return this.scheduleGamificationNotification({
      type: 'MISSION',
      title: '🎖️ Mission Accomplie!',
      body: `Mission "${mission.title}" terminée! +${mission.reward_xp} XP`,
      data: {
        mission_id: mission.id,
        mission_title: mission.title,
        reward_xp: mission.reward_xp,
        reward_money: mission.reward_money,
        screen: 'MissionsScreen'
      }
    });
  }

  async notifyDailyStreak(streakCount) {
    return this.scheduleGamificationNotification({
      type: 'STREAK',
      title: '🔥 Série Quotidienne!',
      body: `${streakCount} jours consécutifs! Continuez comme ça!`,
      data: {
        streak_count: streakCount,
        screen: 'ProfileScreen'
      }
    });
  }

  async notifyLeaderboardRank(rank, leaderboardType) {
    return this.scheduleGamificationNotification({
      type: 'LEADERBOARD',
      title: '🏆 Nouveau Classement!',
      body: `Vous êtes #${rank} dans le classement ${leaderboardType}!`,
      data: {
        rank,
        leaderboard_type: leaderboardType,
        screen: 'LeaderboardScreen'
      }
    });
  }

  /**
   * Notifications de rappel quotidien
   */
  async scheduleDailyReminder() {
    try {
      // Annuler les rappels existants
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Programmer un rappel quotidien à 19h
      const trigger = {
        hour: 19,
        minute: 0,
        repeats: true,
      };

      return this.scheduleGamificationNotification({
        type: 'REMINDER',
        title: '📱 BourseX vous attend!',
        body: 'N\'oubliez pas de maintenir votre série quotidienne!',
        data: {
          reminder_type: 'daily_login',
          screen: 'HomeScreen'
        },
        trigger
      });
    } catch (error) {
      console.error('Erreur lors de la planification du rappel quotidien:', error);
    }
  }

  /**
   * Obtient le token push pour l'envoi de notifications serveur
   */
  async getPushToken() {
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('🔑 Token push obtenu:', token);
      return token;
    } catch (error) {
      console.error('Erreur lors de l\'obtention du token push:', error);
      return null;
    }
  }

  /**
   * Met à jour le badge de l'app
   */
  async updateAppBadge(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du badge:', error);
    }
  }

  /**
   * Nettoie les listeners
   */
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    this.isInitialized = false;
  }
}

export const pushNotificationService = new PushNotificationService();
