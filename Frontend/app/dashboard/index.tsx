import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Typography, Card, Button, GlassCard, FloatingActionButton } from '../../src/components/ui';
import { BottomTabBar } from '../../src/components/navigation/BottomTabBar';
import { useTheme } from '../../src/config/theme';
import { useGamification } from '../../src/contexts/GamificationContext';

export default function DashboardScreen() {
  const theme = useTheme();
  const { userProfile, badges, refreshGamificationData } = useGamification();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshGamificationData();
    setRefreshing(false);
  };

  return (
    <LinearGradient
      colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h2" color="text" weight="700">
            Tableau de Bord
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Bienvenue dans votre espace de trading
          </Typography>
        </View>

        {/* Portfolio Summary */}
        <GlassCard style={styles.portfolioCard} padding="lg">
          <LinearGradient
            colors={theme.gradients.primary as any}
            style={styles.portfolioGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.portfolioContent}>
              <Typography variant="body2" color="white">
                Solde Total
              </Typography>
              <Typography variant="h1" color="white" weight="700">
                $12,845.67
              </Typography>
              <View style={styles.changeContainer}>
                <Typography variant="body2" color="white">
                  +$234.56 (1.85%) ↗
                </Typography>
              </View>
            </View>
          </LinearGradient>
        </GlassCard>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard} variant="glass" padding="md">
            <Typography variant="body2" color="textSecondary">
              Profit/Perte
            </Typography>
            <Typography variant="h3" color="success" weight="600">
              +$1,234.56
            </Typography>
          </Card>
          
          <Card style={styles.statCard} variant="glass" padding="md">
            <Typography variant="body2" color="textSecondary">
              Trades Aujourd'hui
            </Typography>
            <Typography variant="h3" color="text" weight="600">
              12
            </Typography>
          </Card>
        </View>

        {/* Gamification Section */}
        <Card style={styles.gamificationCard} variant="elevated" padding="lg">
          <View style={styles.gamificationHeader}>
            <Typography variant="h3" color="text" weight="600">
              Progression
            </Typography>
            <View style={[styles.levelBadge, { backgroundColor: theme.colors.accent }]}>
              <Typography variant="caption" color="white" weight="600">
                Niveau {userProfile?.level || 1}
              </Typography>
            </View>
          </View>
          
          <View style={styles.gamificationStats}>
            <View style={styles.gamificationItem}>
              <View style={[styles.gamificationIcon, { backgroundColor: theme.colors.warning }]}>
                <Typography variant="body1">🏆</Typography>
              </View>
              <View>
                <Typography variant="body1" color="text" weight="500">
                  {badges?.length || 0} Badges
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Débloquez-en plus !
                </Typography>
              </View>
            </View>
            
            <View style={styles.gamificationItem}>
              <View style={[styles.gamificationIcon, { backgroundColor: theme.colors.success }]}>
                <Typography variant="body1">⚡</Typography>
              </View>
              <View>
                <Typography variant="body1" color="text" weight="500">
                  {userProfile?.experience_points || 0} XP
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Points d'expérience
                </Typography>
              </View>
            </View>
          </View>
          
          <View style={styles.gamificationButtons}>
            <Link href="/leaderboard" asChild>
              <Button
                title="Classement"
                onPress={() => {}}
                variant="outline"
                size="sm"
                style={styles.gamificationButton}
              />
            </Link>
            
            {/* "/badges" is not a valid route, so use a valid one or remove this button */}
            {/* Example: Change to "/missions" if that's the intended destination */}
            <Link href="/missions" asChild>
              <Button
                title="Mes Badges"
                onPress={() => {}}
                variant="primary"
                size="sm"
                style={styles.gamificationButton}
              />
            </Link>
          </View>
        </Card>

        {/* Holdings */}
        <Card style={styles.holdingsCard} variant="default" padding="lg">
          <Typography variant="h3" color="text" weight="600" style={styles.sectionTitle}>
            Mes Positions
          </Typography>
          
          <View style={styles.holdingItem}>
            <View style={styles.holdingInfo}>
              <View style={[styles.cryptoIcon, { backgroundColor: '#F7931A' }]}>
                <Typography variant="body1" color="white" weight="600">₿</Typography>
              </View>
              <View style={styles.holdingDetails}>
                <Typography variant="body1" color="text" weight="500">
                  Bitcoin
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  0.25 BTC
                </Typography>
              </View>
            </View>
            <View style={styles.holdingValue}>
              <Typography variant="body1" color="text" weight="600">
                $10,500.00
              </Typography>
              <Typography variant="caption" color="success">
                +2.5%
              </Typography>
            </View>
          </View>

          <View style={styles.holdingItem}>
            <View style={styles.holdingInfo}>
              <View style={[styles.cryptoIcon, { backgroundColor: '#627EEA' }]}>
                <Typography variant="body1" color="white" weight="600">Ξ</Typography>
              </View>
              <View style={styles.holdingDetails}>
                <Typography variant="body1" color="text" weight="500">
                  Ethereum
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  1.5 ETH
                </Typography>
              </View>
            </View>
            <View style={styles.holdingValue}>
              <Typography variant="body1" color="text" weight="600">
                $2,345.67
              </Typography>
              <Typography variant="caption" color="error">
                -1.2%
              </Typography>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Link href="/trading" asChild>
            <Button
              title="Commencer à trader"
              onPress={() => {}}
              variant="gradient"
              size="lg"
              fullWidth
            />
          </Link>
          
          <View style={styles.actionRow}>
            <Link href="/portfolio" asChild>
              <Button
                title="Portfolio"
                onPress={() => {}}
                variant="outline"
                size="md"
                style={styles.actionButton}
              />
            </Link>
            
            <Link href="/search" asChild>
              <Button
                title="Explorer"
                onPress={() => {}}
                variant="outline"
                size="md"
                style={styles.actionButton}
              />
            </Link>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon="add"
        onPress={() => {}}
        variant="primary"
      />
      
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
  portfolioCard: {
    marginBottom: 16,
  },
  portfolioGradient: {
    borderRadius: 16,
    padding: 24,
  },
  portfolioContent: {
    alignItems: 'center',
  },
  changeContainer: {
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  gamificationCard: {
    marginBottom: 20,
  },
  gamificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gamificationStats: {
    gap: 16,
    marginBottom: 20,
  },
  gamificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gamificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gamificationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  gamificationButton: {
    flex: 1,
  },
  holdingsCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  holdingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  holdingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cryptoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdingDetails: {
    gap: 2,
  },
  holdingValue: {
    alignItems: 'flex-end',
    gap: 2,
  },
  quickActions: {
    gap: 16,
    marginBottom: 100,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
