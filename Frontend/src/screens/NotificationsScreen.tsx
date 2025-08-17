// src/screens/NotificationsScreen.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Card, GlassCard } from '../components/ui';
import { useTheme } from '../config/theme';
import { useGamification } from '../contexts/GamificationContext';

interface Notification {
  id: string;
  type: 'badge' | 'achievement' | 'trade' | 'news';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

const NotificationsScreen = () => {
  const theme = useTheme();
  const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead } = useGamification() as any;

  const mapped = useMemo<Notification[]>(() => {
    return (notifications || []).map((n: any) => ({
      id: String(n.id),
      type: (n.notification_type || 'news') as any,
      title: n.title || 'Notification',
      message: n.message || '',
      timestamp: new Date(n.created_at || Date.now()),
      read: !!n.is_read,
      icon: 'notifications',
    }));
  }, [notifications]);

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'badge':
        return theme.colors.warning;
      case 'achievement':
        return theme.colors.accent;
      case 'trade':
        return theme.colors.success;
      case 'news':
        return theme.colors.info;
      default:
        return theme.colors.textSecondary;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `Il y a ${minutes} min`;
    } else if (hours < 24) {
      return `Il y a ${hours}h`;
    } else {
      return `Il y a ${days}j`;
    }
  };

  return (
    <LinearGradient
      colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Typography variant="h2" color="text" weight="700">
              Notifications
            </Typography>
            <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
              <Typography variant="caption" color="white" weight="600">
                {unreadCount}
              </Typography>
            </View>
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllNotificationsAsRead} style={styles.markAllButton}>
              <Typography variant="body2" color="primary" weight="600">
                Tout marquer comme lu
              </Typography>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications List */}
        <View style={styles.notificationsList}>
      {mapped.map((notification) => (
            <TouchableOpacity
              key={notification.id}
        onPress={() => markNotificationAsRead(notification.id as any)}
              activeOpacity={0.8}
            >
              <Card
                style={
                  notification.read
                    ? styles.notificationCard
                    : { ...styles.notificationCard, ...styles.unreadCard }
                }
                variant={notification.read ? 'default' : 'glass'}
                padding="lg"
              >
                <View style={styles.notificationContent}>
                  <View style={styles.notificationLeft}>
                    <View style={[
                      styles.iconContainer,
                      { backgroundColor: getNotificationColor(notification.type) }
                    ]}>
                      <Ionicons
                        name={notification.icon}
                        size={20}
                        color={theme.colors.textInverse}
                      />
                    </View>
                    
                    <View style={styles.notificationText}>
                      <Typography
                        variant="body1"
                        color="text"
                        weight="600"
                        style={styles.notificationTitle}
                      >
                        {notification.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        style={styles.notificationMessage}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        style={styles.timestamp}
                      >
                        {formatTimestamp(notification.timestamp)}
                      </Typography>
                    </View>
                  </View>
                  
                  {!notification.read && (
                    <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Empty State */}
        {notifications.length === 0 && (
          <GlassCard style={styles.emptyState} padding="lg">
            <View style={styles.emptyContent}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.colors.textSecondary }]}>
                <Ionicons
                  name="notifications-outline"
                  size={48}
                  color={theme.colors.textInverse}
                />
              </View>
              <Typography variant="h4" color="text" weight="600" align="center">
                Aucune notification
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                Vos notifications apparaîtront ici
              </Typography>
            </View>
          </GlassCard>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  markAllButton: {
    alignSelf: 'flex-start',
  },
  notificationsList: {
    gap: 12,
    marginBottom: 100,
  },
  notificationCard: {
    marginVertical: 0,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#00D4FF',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    flex: 1,
    gap: 4,
  },
  notificationTitle: {
    lineHeight: 20,
  },
  notificationMessage: {
    lineHeight: 18,
  },
  timestamp: {
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  emptyState: {
    marginTop: 100,
  },
  emptyContent: {
    alignItems: 'center',
    gap: 16,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
});

export default NotificationsScreen;
