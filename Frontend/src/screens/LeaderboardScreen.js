/**
 * Composant Leaderboard pour afficher les classements
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

const LeaderboardScreen = () => {
  const [selectedTab, setSelectedTab] = useState('XP');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { key: 'XP', label: 'XP', icon: '⭐' },
    { key: 'PROFIT', label: 'Profit', icon: '💰' },
    { key: 'TRADES', label: 'Trades', icon: '📊' },
    { key: 'WIN_RATE', label: 'Win Rate', icon: '🎯' },
  ];

  useEffect(() => {
    loadLeaderboard();
  }, [selectedTab]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Simulation de données de leaderboard
      const mockData = generateMockLeaderboard(selectedTab);
      setLeaderboardData(mockData.leaderboard);
      setUserRank(mockData.userRank);
      
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger le classement');
    } finally {
      setLoading(false);
    }
  };

  const generateMockLeaderboard = (type) => {
    const users = [
      { username: 'TradingPro', firstName: 'Jean', lastName: 'Dupont' },
      { username: 'CryptoKing', firstName: 'Marie', lastName: 'Martin' },
      { username: 'StockMaster', firstName: 'Pierre', lastName: 'Durand' },
      { username: 'InvestGuru', firstName: 'Sophie', lastName: 'Blanc' },
      { username: 'MarketWiz', firstName: 'Thomas', lastName: 'Petit' },
      { username: 'testuser', firstName: 'Test', lastName: 'User' }, // Utilisateur actuel
    ];

    const leaderboard = users.map((user, index) => {
      let score, formattedScore;
      
      switch (type) {
        case 'XP':
          score = Math.floor(Math.random() * 5000) + 1000;
          formattedScore = `${score} XP`;
          break;
        case 'PROFIT':
          score = Math.floor(Math.random() * 50000) + 5000;
          formattedScore = `${score.toLocaleString()}$`;
          break;
        case 'TRADES':
          score = Math.floor(Math.random() * 500) + 50;
          formattedScore = `${score} trades`;
          break;
        case 'WIN_RATE':
          score = Math.floor(Math.random() * 40) + 60;
          formattedScore = `${score}%`;
          break;
        default:
          score = 0;
          formattedScore = '0';
      }

      return {
        user: {
          id: index + 1,
          username: user.username,
          first_name: user.firstName,
          last_name: user.lastName,
        },
        user_profile: {
          level: Math.floor(Math.random() * 50) + 1,
          badge_count: Math.floor(Math.random() * 20) + 1,
          trading_score: Math.floor(Math.random() * 1000) + 100,
        },
        leaderboard_type: type,
        score: score,
        formattedScore: formattedScore,
        rank: index + 1,
        updated_at: new Date().toISOString(),
      };
    }).sort((a, b) => b.score - a.score)
     .map((item, index) => ({ ...item, rank: index + 1 }));

    // Trouver le rang de l'utilisateur actuel
    const userEntry = leaderboard.find(entry => entry.user.username === 'testuser');
    const userRank = userEntry ? userEntry.rank : null;

    return { leaderboard, userRank };
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#666';
    }
  };

  const renderTabButton = (tab) => (
    <TouchableOpacity
      key={tab.key}
      style={[
        styles.tabButton,
        selectedTab === tab.key && styles.activeTabButton
      ]}
      onPress={() => setSelectedTab(tab.key)}
    >
      <Text style={styles.tabIcon}>{tab.icon}</Text>
      <Text style={[
        styles.tabLabel,
        selectedTab === tab.key && styles.activeTabLabel
      ]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );

  const renderLeaderboardItem = ({ item, index }) => {
    const isCurrentUser = item.user.username === 'testuser';
    
    return (
      <View style={[
        styles.leaderboardItem,
        isCurrentUser && styles.currentUserItem
      ]}>
        <View style={styles.rankContainer}>
          <Text style={[
            styles.rankText,
            { color: getRankColor(item.rank) }
          ]}>
            {getRankIcon(item.rank)}
          </Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={[
            styles.username,
            isCurrentUser && styles.currentUserText
          ]}>
            {item.user.first_name} {item.user.last_name}
          </Text>
          <Text style={styles.userDetails}>
            @{item.user.username} • Niveau {item.user_profile.level}
          </Text>
          <Text style={styles.badgeCount}>
            🏆 {item.user_profile.badge_count} badges
          </Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={[
            styles.score,
            isCurrentUser && styles.currentUserText
          ]}>
            {item.formattedScore}
          </Text>
          <Text style={styles.tradingScore}>
            Score: {item.user_profile.trading_score}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Chargement du classement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec onglets */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Classements</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map(renderTabButton)}
        </ScrollView>
      </View>

      {/* Position de l'utilisateur */}
      {userRank && (
        <View style={styles.userRankContainer}>
          <Text style={styles.userRankText}>
            Votre position: {getRankIcon(userRank)} 
          </Text>
          <Text style={styles.userRankDetails}>
            {selectedTab} • Rank #{userRank}
          </Text>
        </View>
      )}

      {/* Liste du classement */}
      <FlatList
        data={leaderboardData}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => `${item.user.id}-${selectedTab}`}
        contentContainerStyle={styles.leaderboardList}
        showsVerticalScrollIndicator={false}
      />
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
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tabsContainer: {
    paddingRight: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabLabel: {
    color: '#fff',
  },
  userRankContainer: {
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  userRankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  userRankDetails: {
    fontSize: 14,
    color: '#666',
  },
  leaderboardList: {
    padding: 16,
  },
  leaderboardItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  currentUserText: {
    color: '#007AFF',
  },
  userDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  badgeCount: {
    fontSize: 12,
    color: '#FFD700',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tradingScore: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default LeaderboardScreen;
