/**
 * Composant de gestion des notifications
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Simulation d'appel API
      const mockNotifications = [
        {
          id: 1,
          notification_type: 'BADGE',
          title: 'Badge Obtenu!',
          message: 'Félicitations! Vous avez obtenu le badge "Premier Trade"',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          notification_type: 'LEVEL_UP',
          title: 'Niveau 5 Atteint!',
          message: 'Vous êtes maintenant niveau 5! Continuez comme ça!',
          is_read: false,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 3,
          notification_type: 'ACHIEVEMENT',
          title: 'Achievement Débloqué!',
          message: 'Vous avez débloqué "Premier Profit". +50 XP!',
          is_read: true,
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de marquer la notification comme lue');
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de marquer toutes les notifications comme lues');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BADGE': return '🏆';
      case 'ACHIEVEMENT': return '🎯';
      case 'LEVEL_UP': return '📈';
      case 'MISSION': return '🎖️';
      case 'TRADE': return '💼';
      case 'SOCIAL': return '👥';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'BADGE': return '#FFD700';
      case 'ACHIEVEMENT': return '#4CAF50';
      case 'LEVEL_UP': return '#2196F3';
      case 'MISSION': return '#FF9800';
      case 'TRADE': return '#9C27B0';
      case 'SOCIAL': return '#795548';
      default: return '#607D8B';
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.is_read && styles.unreadCard
      ]}
      onPress={() => !item.is_read && markAsRead(item.id)}
    >
      <View style={styles.notificationHeader}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: getNotificationColor(item.notification_type) }
        ]}>
          <Text style={styles.notificationIcon}>
            {getNotificationIcon(item.notification_type)}
          </Text>
        </View>
        <View style={styles.notificationContent}>
          <Text style={[
            styles.notificationTitle,
            !item.is_read && styles.unreadTitle
          ]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage}>
            {item.message}
          </Text>
          <Text style={styles.notificationDate}>
            {new Date(item.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Chargement des notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllButtonText}>
              Tout marquer comme lu ({unreadCount})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🔔</Text>
          <Text style={styles.emptyTitle}>Aucune notification</Text>
          <Text style={styles.emptyMessage}>
            Vos notifications apparaîtront ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.notificationsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  markAllButton: {
    alignSelf: 'flex-start',
  },
  markAllButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationsList: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default NotificationsScreen;
