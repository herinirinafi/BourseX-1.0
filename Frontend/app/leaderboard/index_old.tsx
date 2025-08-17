import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography, GlassCard } from '../../src/components/ui';
import { BottomTabBar } from '../../src/components/navigation/BottomTabBar';
import { useTheme } from '../../src/config/theme';

const leaderboardData = [
  { id: '1', name: 'CryptoMaster', rank: 1, portfolioValue: 12543.21, weeklyChange: 12.5, avatar: '👑' },
  { id: '2', name: 'BitcoinKing', rank: 2, portfolioValue: 11876.54, weeklyChange: 8.2, avatar: '🚀' },
  { id: '3', name: 'EtherealTrader', rank: 3, portfolioValue: 10987.32, weeklyChange: 5.7, avatar: '💎' },
  { id: '4', name: 'AltcoinWhale', rank: 4, portfolioValue: 9876.54, weeklyChange: 3.2, avatar: '🐋' },
  { id: '5', name: 'SatoshiNakamoto', rank: 5, portfolioValue: 8765.43, weeklyChange: -1.5, avatar: '👨‍💻' },
  { id: '6', name: 'HODLer', rank: 6, portfolioValue: 7654.32, weeklyChange: 2.1, avatar: '💪' },
  { id: '7', name: 'FOMOtrader', rank: 7, portfolioValue: 6543.21, weeklyChange: -3.4, avatar: '😱' },
  { id: '8', name: 'MoonLamb0', rank: 8, portfolioValue: 5432.10, weeklyChange: 1.2, avatar: '🌙' },
  { id: '9', name: 'DegenTrader', rank: 9, portfolioValue: 4321.09, weeklyChange: -5.6, avatar: '🎲' },
  { id: '10', name: 'NoobTrader', rank: 10, portfolioValue: 3210.98, weeklyChange: 0.5, avatar: '🐣' },
];

const timeFrames = [
  { id: 'weekly', label: 'Hebdomadaire' },
  { id: 'monthly', label: 'Mensuel' },
  { id: 'alltime', label: 'Tous les temps' },
];

export default function LeaderboardScreen() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('weekly');
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);

  const renderItem = ({ item, index }) => {
    const isTop3 = item.rank <= 3;
    
    return (
      <View style={[
        styles.leaderboardItem,
        isTop3 && styles.top3Item,
        index % 2 === 0 && styles.evenItem,
      ]}>
        <View style={styles.rankContainer}>
          {isTop3 ? (
            <Text style={styles.top3Rank}>
              {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}
            </Text>
          ) : (
            <Text style={styles.rank}>#{item.rank}</Text>
          )}
        </View>
        
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{item.avatar}</Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.portfolioValue}>${item.portfolioValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}</Text>
        </View>
        
        <View style={styles.changeContainer}>
          <Text style={[
            styles.changeText,
            item.weeklyChange >= 0 ? styles.positive : styles.negative
          ]}>
            {item.weeklyChange >= 0 ? '+' : ''}{item.weeklyChange}%
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Classement</Text>
      
      <View style={styles.timeFrameContainer}>
        {timeFrames.map(timeFrame => (
          <TouchableOpacity
            key={timeFrame.id}
            style={[
              styles.timeFrameButton,
              selectedTimeFrame === timeFrame.id && styles.selectedTimeFrame
            ]}
            onPress={() => setSelectedTimeFrame(timeFrame.id)}
          >
            <Text style={[
              styles.timeFrameText,
              selectedTimeFrame === timeFrame.id && styles.selectedTimeFrameText
            ]}>
              {timeFrame.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Afficher :</Text>
        <TouchableOpacity
          style={[
            styles.filterButton,
            !showFriendsOnly && styles.activeFilter
          ]}
          onPress={() => setShowFriendsOnly(false)}
        >
          <Text style={[
            styles.filterButtonText,
            !showFriendsOnly && styles.activeFilterText
          ]}>
            Tous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            showFriendsOnly && styles.activeFilter
          ]}
          onPress={() => setShowFriendsOnly(true)}
        >
          <Text style={[
            styles.filterButtonText,
            showFriendsOnly && styles.activeFilterText
          ]}>
            Amis
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={leaderboardData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      />
      
      <View style={styles.yourRankContainer}>
        <Text style={styles.yourRankLabel}>Votre rang : </Text>
        <Text style={styles.yourRank}>#42</Text>
      </View>
      {/* Bottom Navigation */}
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    backgroundColor: '#121212',
    paddingBottom: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    marginBottom: 16,
    padding: 4,
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedTimeFrame: {
    backgroundColor: '#2A2A2A',
  },
  timeFrameText: {
    color: '#888',
    fontWeight: '600',
  },
  selectedTimeFrameText: {
    color: '#FFF',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    color: '#888',
    marginRight: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#1E1E1E',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#888',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFF',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#1E1E1E',
  },
  evenItem: {
    backgroundColor: '#252525',
  },
  top3Item: {
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  rankContainer: {
    width: 24,
    marginRight: 12,
  },
  rank: {
    color: '#888',
    fontWeight: '600',
    textAlign: 'center',
  },
  top3Rank: {
    fontSize: 20,
    textAlign: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  portfolioValue: {
    color: '#888',
    fontSize: 12,
  },
  changeContainer: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  changeText: {
    fontWeight: '600',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  yourRankContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yourRankLabel: {
    color: '#888',
    fontSize: 16,
  },
  yourRank: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
