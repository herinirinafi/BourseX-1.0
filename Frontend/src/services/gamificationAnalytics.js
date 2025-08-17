/**
 * Service d'analytics pour le tracking des interactions de gamification
 */

class GamificationAnalytics {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.isEnabled = true;
  }

  /**
   * Génère un ID de session unique
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Active ou désactive le tracking
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`📊 Analytics gamification: ${enabled ? 'activé' : 'désactivé'}`);
  }

  /**
   * Track un événement générique
   */
  trackEvent(eventName, properties = {}) {
    if (!this.isEnabled) return;

    const event = {
      id: this.generateEventId(),
      sessionId: this.sessionId,
      eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
        platform: 'react-native',
      },
      context: this.getContext(),
    };

    this.events.push(event);
    console.log('📊 Event tracked:', eventName, properties);

    // Envoi en lot toutes les 10 événements ou toutes les 30 secondes
    this.scheduleFlush();

    return event.id;
  }

  /**
   * Génère un ID d'événement unique
   */
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtient le contexte de l'utilisateur
   */
  getContext() {
    return {
      sessionDuration: Date.now() - this.startTime,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Programme l'envoi des événements
   */
  scheduleFlush() {
    if (this.flushTimeout) clearTimeout(this.flushTimeout);
    
    // Flush immédiat si plus de 10 événements
    if (this.events.length >= 10) {
      this.flush();
    } else {
      // Sinon, flush après 30 secondes
      this.flushTimeout = setTimeout(() => {
        this.flush();
      }, 30000);
    }
  }

  /**
   * Envoie les événements au serveur
   */
  async flush() {
    if (this.events.length === 0) return;

    try {
      const eventsToSend = [...this.events];
      this.events = [];

      // Simulation d'envoi au serveur d'analytics
      console.log(`📤 Envoi de ${eventsToSend.length} événements d'analytics`);
      
      // Ici, vous pourriez envoyer à votre service d'analytics préféré
      // await this.sendToAnalyticsService(eventsToSend);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des analytics:', error);
      // Remettre les événements en queue en cas d'erreur
      this.events.unshift(...eventsToSend);
    }
  }

  /**
   * === ÉVÉNEMENTS SPÉCIFIQUES À LA GAMIFICATION ===
   */

  /**
   * Track l'obtention d'un badge
   */
  trackBadgeEarned(badge, context = {}) {
    return this.trackEvent('badge_earned', {
      badge_id: badge.id,
      badge_name: badge.name,
      badge_type: badge.badge_type,
      badge_tier: badge.tier,
      xp_bonus: badge.xp_bonus,
      ...context
    });
  }

  /**
   * Track le déblocage d'un achievement
   */
  trackAchievementUnlocked(achievement, context = {}) {
    return this.trackEvent('achievement_unlocked', {
      achievement_id: achievement.id,
      achievement_name: achievement.name,
      achievement_category: achievement.category,
      reward_xp: achievement.reward_xp,
      reward_money: achievement.reward_money,
      is_hidden: achievement.is_hidden,
      ...context
    });
  }

  /**
   * Track les montées de niveau
   */
  trackLevelUp(oldLevel, newLevel, totalXp, context = {}) {
    return this.trackEvent('level_up', {
      old_level: oldLevel,
      new_level: newLevel,
      level_difference: newLevel - oldLevel,
      total_xp: totalXp,
      ...context
    });
  }

  /**
   * Track les interactions avec les leaderboards
   */
  trackLeaderboardView(leaderboardType, userRank, context = {}) {
    return this.trackEvent('leaderboard_viewed', {
      leaderboard_type: leaderboardType,
      user_rank: userRank,
      ...context
    });
  }

  /**
   * Track les interactions avec les badges
   */
  trackBadgeViewed(badge, context = {}) {
    return this.trackEvent('badge_viewed', {
      badge_id: badge.id,
      badge_name: badge.name,
      badge_tier: badge.tier,
      is_earned: context.is_earned || false,
      ...context
    });
  }

  /**
   * Track les interactions avec les achievements
   */
  trackAchievementViewed(achievement, progress, context = {}) {
    return this.trackEvent('achievement_viewed', {
      achievement_id: achievement.id,
      achievement_name: achievement.name,
      achievement_category: achievement.category,
      progress_percentage: progress,
      is_completed: progress >= 100,
      ...context
    });
  }

  /**
   * Track les notifications gamification
   */
  trackNotificationReceived(notification, context = {}) {
    return this.trackEvent('gamification_notification_received', {
      notification_id: notification.id,
      notification_type: notification.notification_type,
      title: notification.title,
      is_read: notification.is_read,
      ...context
    });
  }

  /**
   * Track les interactions avec les notifications
   */
  trackNotificationTapped(notification, context = {}) {
    return this.trackEvent('gamification_notification_tapped', {
      notification_id: notification.id,
      notification_type: notification.notification_type,
      action: context.action || 'opened',
      ...context
    });
  }

  /**
   * Track les streaks quotidiens
   */
  trackDailyStreak(streakCount, isNewRecord, context = {}) {
    return this.trackEvent('daily_streak_updated', {
      streak_count: streakCount,
      is_new_record: isNewRecord,
      ...context
    });
  }

  /**
   * Track les missions complétées
   */
  trackMissionCompleted(mission, completionTime, context = {}) {
    return this.trackEvent('mission_completed', {
      mission_id: mission.id,
      mission_title: mission.title,
      mission_type: mission.mission_type,
      reward_xp: mission.reward_xp,
      reward_money: mission.reward_money,
      completion_time_ms: completionTime,
      ...context
    });
  }

  /**
   * Track l'engagement global avec la gamification
   */
  trackGamificationEngagement(sessionData, context = {}) {
    return this.trackEvent('gamification_engagement', {
      session_duration: sessionData.duration,
      badges_viewed: sessionData.badgesViewed || 0,
      achievements_viewed: sessionData.achievementsViewed || 0,
      leaderboard_views: sessionData.leaderboardViews || 0,
      notifications_tapped: sessionData.notificationsTapped || 0,
      screens_visited: sessionData.screensVisited || [],
      ...context
    });
  }

  /**
   * Track les actions de trading liées à la gamification
   */
  trackGamifiedTrade(tradeData, gamificationRewards, context = {}) {
    return this.trackEvent('gamified_trade_executed', {
      trade_type: tradeData.type,
      trade_amount: tradeData.amount,
      stock_symbol: tradeData.symbol,
      xp_gained: gamificationRewards.xp_gained,
      badges_earned: gamificationRewards.badges_earned,
      achievements_unlocked: gamificationRewards.achievements_unlocked,
      level_up: gamificationRewards.level_up,
      ...context
    });
  }

  /**
   * === MÉTRIQUES ET RAPPORTS ===
   */

  /**
   * Génère un rapport de session
   */
  generateSessionReport() {
    const sessionDuration = Date.now() - this.startTime;
    const eventsByType = this.events.reduce((acc, event) => {
      acc[event.eventName] = (acc[event.eventName] || 0) + 1;
      return acc;
    }, {});

    return {
      sessionId: this.sessionId,
      duration: sessionDuration,
      totalEvents: this.events.length,
      eventsByType,
      startTime: this.startTime,
      endTime: Date.now(),
    };
  }

  /**
   * Obtient les métriques de gamification
   */
  getGamificationMetrics() {
    const gamificationEvents = this.events.filter(event => 
      event.eventName.includes('badge_') || 
      event.eventName.includes('achievement_') ||
      event.eventName.includes('level_') ||
      event.eventName.includes('gamification_')
    );

    return {
      totalGamificationEvents: gamificationEvents.length,
      badgesEarned: gamificationEvents.filter(e => e.eventName === 'badge_earned').length,
      achievementsUnlocked: gamificationEvents.filter(e => e.eventName === 'achievement_unlocked').length,
      levelUps: gamificationEvents.filter(e => e.eventName === 'level_up').length,
      notificationInteractions: gamificationEvents.filter(e => e.eventName.includes('notification_')).length,
    };
  }

  /**
   * Exporte les données pour analyse
   */
  exportData() {
    return {
      sessionInfo: this.generateSessionReport(),
      events: this.events,
      metrics: this.getGamificationMetrics(),
      exportTime: new Date().toISOString(),
    };
  }

  /**
   * Nettoie les données d'analytics
   */
  cleanup() {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }
    this.flush(); // Dernier envoi
    this.events = [];
  }
}

// Instance singleton
export const gamificationAnalytics = new GamificationAnalytics();

// Hook React pour faciliter l'utilisation
export const useGamificationAnalytics = () => {
  const trackBadgeEarned = (badge, context) => {
    gamificationAnalytics.trackBadgeEarned(badge, context);
  };

  const trackAchievementUnlocked = (achievement, context) => {
    gamificationAnalytics.trackAchievementUnlocked(achievement, context);
  };

  const trackLevelUp = (oldLevel, newLevel, totalXp, context) => {
    gamificationAnalytics.trackLevelUp(oldLevel, newLevel, totalXp, context);
  };

  const trackScreenView = (screenName, context) => {
    gamificationAnalytics.trackEvent('screen_view', {
      screen_name: screenName,
      ...context
    });
  };

  const trackUserAction = (action, context) => {
    gamificationAnalytics.trackEvent('user_action', {
      action,
      ...context
    });
  };

  return {
    trackBadgeEarned,
    trackAchievementUnlocked,
    trackLevelUp,
    trackScreenView,
    trackUserAction,
    analytics: gamificationAnalytics,
  };
};
