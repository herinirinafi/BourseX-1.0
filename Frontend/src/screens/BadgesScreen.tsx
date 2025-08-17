/**
 * Composant d'affichage des badges utilisateur
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { gamificationService, Badge, UserBadge } from '../services/gamificationService.js';

interface BadgeCardProps {
  badge: Badge;
  earned: boolean;
  earnedAt?: string;
  onPress: () => void;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, earned, earnedAt, onPress }) => {
  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      case 'diamond': return '#B9F2FF';
      default: return '#666';
    }
  };

  return (
    <TouchableOpacity style={[styles.badgeCard, !earned && styles.lockedBadge]} onPress={onPress}>
      <View style={[styles.badgeIconContainer, { backgroundColor: getTierColor(badge.tier) }]}>
        {badge.icon_url ? (
          <Image source={{ uri: badge.icon_url }} style={styles.badgeIcon} />
        ) : (
          <Text style={styles.badgeIconText}>🏆</Text>
        )}
      </View>
      <Text style={[styles.badgeName, !earned && styles.lockedText]}>{badge.name}</Text>
      <Text style={[styles.badgeTier, { color: getTierColor(badge.tier) }]}>
        {badge.tier}
      </Text>
      {earned && earnedAt && (
        <Text style={styles.earnedDate}>
          Obtenu le {new Date(earnedAt).toLocaleDateString()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const BadgesScreen: React.FC = () => {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const [userBadgesData, allBadgesData] = await Promise.all([
        gamificationService.getUserBadges(),
        gamificationService.getAllBadges(),
      ]);
      
      setUserBadges(userBadgesData);
      setAllBadges(allBadgesData);
    } catch (error) {
      console.error('Erreur lors du chargement des badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserBadgeInfo = (badge: Badge) => {
    const userBadge = userBadges.find(ub => ub.badge.id === badge.id);
    return {
      earned: !!userBadge,
      earnedAt: userBadge?.earned_at,
    };
  };

  const handleBadgePress = (badge: Badge) => {
    setSelectedBadge(badge);
    setModalVisible(true);
  };

  const renderBadge = ({ item }: { item: Badge }) => {
    const { earned, earnedAt } = getUserBadgeInfo(item);
    return (
      <BadgeCard
        badge={item}
        earned={earned}
        earnedAt={earnedAt}
        onPress={() => handleBadgePress(item)}
      />
    );
  };

  const getBadgeStats = () => {
    const earnedCount = userBadges.length;
    const totalCount = allBadges.length;
    const completionRate = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;
    return { earnedCount, totalCount, completionRate };
  };

  const { earnedCount, totalCount, completionRate } = getBadgeStats();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Chargement des badges...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Collection de Badges</Text>
        <Text style={styles.statsText}>
          {earnedCount}/{totalCount} badges obtenus ({completionRate.toFixed(1)}%)
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${completionRate}%` }]}
          />
        </View>
      </View>

      {/* Badges Grid */}
      <FlatList
        data={allBadges}
        renderItem={renderBadge}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.badgesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Badge Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedBadge && (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <View style={[
                    styles.modalBadgeIcon,
                    { backgroundColor: getTierColor(selectedBadge.tier) }
                  ]}>
                    <Text style={styles.modalBadgeIconText}>🏆</Text>
                  </View>
                  <Text style={styles.modalBadgeName}>{selectedBadge.name}</Text>
                  <Text style={[
                    styles.modalBadgeTier,
                    { color: getTierColor(selectedBadge.tier) }
                  ]}>
                    {selectedBadge.tier}
                  </Text>
                </View>
                
                <Text style={styles.modalDescription}>
                  {selectedBadge.description}
                </Text>
                
                {selectedBadge.xp_bonus > 0 && (
                  <Text style={styles.modalXpBonus}>
                    Bonus XP: +{selectedBadge.xp_bonus}
                  </Text>
                )}

                {getUserBadgeInfo(selectedBadge).earned && (
                  <View style={styles.earnedInfo}>
                    <Text style={styles.earnedTitle}>✅ Badge obtenu!</Text>
                    <Text style={styles.earnedDate}>
                      Le {new Date(getUserBadgeInfo(selectedBadge).earnedAt!).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Fermer</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getTierColor = (tier: string) => {
  switch (tier.toLowerCase()) {
    case 'bronze': return '#CD7F32';
    case 'silver': return '#C0C0C0';
    case 'gold': return '#FFD700';
    case 'platinum': return '#E5E4E2';
    case 'diamond': return '#B9F2FF';
    default: return '#666';
  }
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
  statsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  badgesList: {
    padding: 16,
  },
  badgeCard: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lockedBadge: {
    opacity: 0.5,
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeIcon: {
    width: 40,
    height: 40,
  },
  badgeIconText: {
    fontSize: 32,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeTier: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  earnedDate: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  lockedText: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalBadgeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBadgeIconText: {
    fontSize: 40,
  },
  modalBadgeName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBadgeTier: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  modalXpBonus: {
    fontSize: 14,
    textAlign: 'center',
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 16,
  },
  earnedInfo: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  earnedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BadgesScreen;
