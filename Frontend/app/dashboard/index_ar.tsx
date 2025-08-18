import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Typography, Card, Button, GlassCard, FloatingActionButton } from '../../src/components/ui';
import { ARDashboard, ARPortfolioViewer } from '../../src/components/ar';
import { SmartNavigationBar } from '../../src/components/navigation';
import { useTheme } from '../../src/config/theme';
import { useGamification } from '../../src/contexts/GamificationContext';
import { useI18n } from '../../src/contexts/I18nContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTrading } from '../../src/contexts/TradingContext';
import { fetchDashboard, fetchMe } from '../../src/services/api';
import { gamificationService } from '../../src/services/gamificationService';

export default function DashboardScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const { user } = useTrading();
  const { userProfile, badges, refreshGamificationData } = useGamification();
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [gamificationSummary, setGamificationSummary] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
      loadGamificationData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      const [dashboard] = await Promise.all([
        fetchDashboard(),
        fetchMe()
      ]);
      setDashboardData(dashboard);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadGamificationData = async () => {
    try {
      const summary = await gamificationService.getGamificationSummary();
      setGamificationSummary(summary);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadDashboardData(),
      loadGamificationData(),
      refreshGamificationData()
    ]);
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('mg-MG', {
      style: 'currency',
      currency: 'MGA'
    }).format(amount);
  };

  const portfolioValue = dashboardData?.portfolio_value || 0;
  const userBalance = user?.balance || dashboardData?.user_profile?.balance || 0;
  const totalValue = userBalance + portfolioValue;
  const recentTransactions = dashboardData?.recent_transactions || [];
  const topStocks = dashboardData?.top_stocks || [];

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#374151']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* AR Enhanced Dashboard */}
        <ARDashboard
          balance={userBalance}
          totalPortfolio={portfolioValue}
          todayGain={dashboardData?.user_profile?.total_profit_loss || 0}
          totalGain={dashboardData?.user_profile?.total_profit_loss || 0}
          xp={gamificationSummary?.user_profile?.xp || userProfile?.experience_points || 0}
          level={gamificationSummary?.user_profile?.level || userProfile?.level || 1}
          streakDays={gamificationSummary?.daily_streak?.current_streak || 0}
          animated={true}
        />

        {/* Portfolio AR Viewer */}
        {dashboardData?.portfolio && dashboardData.portfolio.length > 0 && (
          <View style={styles.portfolioSection}>
            <Typography variant="h3" color="white" weight="600" style={styles.sectionTitle}>
              Portfolio AR
            </Typography>
            <ARPortfolioViewer
              portfolioData={dashboardData.portfolio}
              totalValue={portfolioValue}
              totalGain={dashboardData?.user_profile?.total_profit_loss || 0}
              totalGainPercent={((dashboardData?.user_profile?.total_profit_loss || 0) / Math.max(portfolioValue - (dashboardData?.user_profile?.total_profit_loss || 0), 1)) * 100}
            />
          </View>
        )}

        {/* Professional Quick Actions */}
        <View style={styles.quickActions}>
          <GlassCard style={styles.actionCard} padding="lg">
            <Typography variant="h4" color="white" weight="600" style={styles.actionTitle}>
              Actions Rapides
            </Typography>
            
            <View style={styles.actionGrid}>
              <Link href="/trading" asChild>
                <Button
                  title="Trading Pro"
                  onPress={() => {}}
                  variant="primary"
                  size="lg"
                  style={styles.primaryAction}
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
                    title="Recherche"
                    onPress={() => {}}
                    variant="outline"
                    size="md"
                    style={styles.actionButton}
                  />
                </Link>
              </View>
              
              <View style={styles.actionRow}>
                <Link href="/leaderboard" asChild>
                  <Button
                    title="Classement"
                    onPress={() => {}}
                    variant="outline"
                    size="md"
                    style={styles.actionButton}
                  />
                </Link>
                
                <Link href="/missions" asChild>
                  <Button
                    title="Missions"
                    onPress={() => {}}
                    variant="outline"
                    size="md"
                    style={styles.actionButton}
                  />
                </Link>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Recent Transactions with AR Effects */}
        {recentTransactions.length > 0 && (
          <View style={styles.transactionsSection}>
            <Typography variant="h3" color="white" weight="600" style={styles.sectionTitle}>
              Transactions Récentes
            </Typography>
            <GlassCard style={styles.transactionCard} padding="lg">
              {recentTransactions.slice(0, 5).map((transaction: any, index: number) => (
                <View key={index} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <View style={[
                      styles.transactionIcon,
                      { 
                        backgroundColor: transaction.transaction_type === 'BUY' 
                          ? 'rgba(16, 185, 129, 0.2)' 
                          : 'rgba(239, 68, 68, 0.2)',
                        borderColor: transaction.transaction_type === 'BUY' 
                          ? '#10B981' 
                          : '#EF4444'
                      }
                    ]}>
                      <Typography 
                        variant="caption" 
                        color={transaction.transaction_type === 'BUY' ? 'success' : 'error'} 
                        weight="600"
                      >
                        {transaction.transaction_type}
                      </Typography>
                    </View>
                    <View>
                      <Typography variant="body1" color="white" weight="500">
                        {transaction.stock_symbol}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {transaction.quantity} actions
                      </Typography>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Typography variant="body1" color="white" weight="600">
                      {formatCurrency(transaction.price * transaction.quantity)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatCurrency(transaction.price)}/action
                    </Typography>
                  </View>
                </View>
              ))}
            </GlassCard>
          </View>
        )}

        {/* Space for bottom navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon="add"
        onPress={() => {}}
        variant="primary"
        style={styles.fab}
      />
      
      {/* Bottom Navigation */}
      <SmartNavigationBar />
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
  portfolioSection: {
    marginVertical: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    paddingHorizontal: 4,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quickActions: {
    marginVertical: 24,
  },
  actionCard: {
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
  },
  actionTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  actionGrid: {
    gap: 16,
  },
  primaryAction: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  transactionsSection: {
    marginVertical: 24,
  },
  transactionCard: {
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  bottomSpacer: {
    height: 120,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
});
