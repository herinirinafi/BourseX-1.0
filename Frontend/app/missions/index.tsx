import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useTrading } from '../../src/contexts/TradingContext';
import { Mission } from '../../src/types';

export default function MissionsScreen() {
  const { missions, completeMission, user } = useTrading();

  const dailyMissions = missions.filter(m => m.type === 'daily');
  // Les achievements sont filtrés mais non utilisés actuellement
  // const achievements = missions.filter(m => m.type === 'achievement');

  const renderMissionItem = ({ item }: { item: Mission }) => (
    <View style={styles.missionCard}>
      <View style={styles.missionInfo}>
        <Text style={styles.missionTitle}>{item.title}</Text>
        <Text style={styles.missionDescription}>{item.description}</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(item.progress / item.target) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {item.progress}/{item.target}
        </Text>
      </View>
      <View style={styles.rewardContainer}>
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardText}>+{item.reward}</Text>
          <Image 
            // Remplacement temporaire de l'image par un texte
            // source={require('../../assets/coin.png')} 
            style={styles.coinIcon}
          />
        </View>
        {!item.completed && item.progress >= item.target ? (
          <TouchableOpacity 
            style={styles.claimButton}
            onPress={() => completeMission(item.id)}
          >
            <Text style={styles.claimButtonText}>Réclamer</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.claimButton, styles.claimButtonDisabled]}>
            <Text style={[styles.claimButtonText, { color: '#666' }]}>
              {item.completed ? 'Terminé' : 'En cours'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelContainer}>
          <Text style={styles.levelLabel}>Niveau {user.level}</Text>
          <View style={styles.xpBar}>
            <View 
              style={[
                styles.xpFill, 
                { width: `${(user.xp / (user.level * 100)) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.xpText}>
            {user.xp}/{user.level * 100} XP
          </Text>
        </View>
        
        <View style={styles.badgesContainer}>
          <Text style={styles.sectionTitle}>Badges ({user.badges.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {user.badges.length > 0 ? (
              user.badges.map((badge, index) => (
                <View key={index} style={styles.badge}>
                  <View style={[styles.badgeIcon, { backgroundColor: '#4a90e2', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>🎖️</Text>
                  </View>
                  <Text style={styles.badgeName}>{badge}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noBadgesText}>Aucun badge débloqué</Text>
            )}
          </ScrollView>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, styles.tabActive]}
        >
          <Text style={styles.tabTextActive}>Missions</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tab}
        >
          <Text style={styles.tabText}>Succès</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dailyMissions}
        renderItem={renderMissionItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.missionsList}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Missions du jour</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  levelContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  levelLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  xpBar: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  xpText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'right',
  },
  badgesContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  badge: {
    alignItems: 'center',
    marginRight: 16,
  },
  badgeIcon: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  badgeName: {
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
  },
  noBadgesText: {
    color: '#888',
    fontStyle: 'italic',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#2A2A2A',
  },
  tabText: {
    color: '#888',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#007AFF',
  },
  missionsList: {
    paddingBottom: 20,
  },
  missionCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  missionInfo: {
    flex: 1,
    marginRight: 12,
  },
  missionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  missionDescription: {
    color: '#888',
    fontSize: 14,
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'right',
  },
  rewardContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  rewardText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  coinIcon: {
    width: 16,
    height: 16,
  },
  claimButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 80,
  },
  claimButtonDisabled: {
    backgroundColor: '#2A2A2A',
  },
  claimButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
