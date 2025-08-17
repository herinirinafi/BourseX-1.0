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
  const theme = useTheme();
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('weekly');

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const isTop3 = item.rank <= 3;
    
    return (
      <GlassCard style={[styles.leaderboardItem, isTop3 && styles.top3Item]} padding="md">
        <View style={styles.rankContainer}>
          {isTop3 ? (
            <LinearGradient
              colors={
                item.rank === 1 ? ['#FFD700', '#FFA500'] :
                item.rank === 2 ? ['#C0C0C0', '#A9A9A9'] :
                ['#CD7F32', '#B8860B']
              }
              style={styles.top3Badge}
            >
              <Typography variant="h4" color="white" weight="700">
                {item.rank}
              </Typography>
            </LinearGradient>
          ) : (
            <View style={styles.rankBadge}>
              <Typography variant="h5" color="text" weight="600">
                #{item.rank}
              </Typography>
            </View>
          )}
        </View>

        <View style={styles.avatarContainer}>
          <Typography variant="h3" style={styles.avatar}>
            {item.avatar}
          </Typography>
        </View>

        <View style={styles.userInfo}>
          <Typography variant="h5" color="text" weight="600" numberOfLines={1}>
            {item.name}
          </Typography>
          <Typography variant="body1" color="text" weight="600">
            ${item.portfolioValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </Typography>
        </View>

        <View style={styles.changeContainer}>
          <Typography 
            variant="body2" 
            color={item.weeklyChange >= 0 ? 'success' : 'error'}
            weight="600"
          >
            {item.weeklyChange >= 0 ? '+' : ''}{item.weeklyChange.toFixed(1)}%
          </Typography>
        </View>
      </GlassCard>
    );
  };

  return (
    <LinearGradient
      colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h2" color="text" weight="700">
            Classement
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Compétition hebdomadaire
          </Typography>
        </View>

        {/* Time Frame Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.timeFrameContainer}
        >
          {timeFrames.map((timeFrame) => (
            <TouchableOpacity
              key={timeFrame.id}
              onPress={() => setSelectedTimeFrame(timeFrame.id)}
              style={[
                styles.timeFrameButton,
                selectedTimeFrame === timeFrame.id && styles.timeFrameButtonActive
              ]}
            >
              <Typography 
                variant="body2" 
                color="white" 
                weight={selectedTimeFrame === timeFrame.id ? "600" : "400"}
              >
                {timeFrame.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Leaderboard List */}
        <View style={styles.leaderboardContainer}>
          <FlatList
            data={leaderboardData}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={styles.leaderboardList}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Your Rank */}
        <GlassCard style={styles.yourRankCard} padding="lg">
          <View style={styles.yourRankContent}>
            <Typography variant="h4" color="text" weight="600">
              Votre Position
            </Typography>
            <View style={styles.yourRankInfo}>
              <Typography variant="h2" color="primary" weight="700">
                #42
              </Typography>
              <Typography variant="body1" color="textSecondary">
                sur 1,337 traders
              </Typography>
            </View>
          </View>
        </GlassCard>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomTabBar />
    </LinearGradient>
  );
}

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
    alignItems: 'center',
  },
  timeFrameContainer: {
    marginBottom: 24,
  },
  timeFrameButton: {
    backgroundColor: 'rgba(0, 212, 255, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  timeFrameButtonActive: {
    backgroundColor: '#00D4FF',
  },
  leaderboardContainer: {
    marginBottom: 16,
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  top3Item: {
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  top3Badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 50,
    alignItems: 'center',
  },
  avatar: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  changeContainer: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  yourRankCard: {
    marginBottom: 100,
  },
  yourRankContent: {
    alignItems: 'center',
    gap: 12,
  },
  yourRankInfo: {
    alignItems: 'center',
    gap: 4,
  },
});
