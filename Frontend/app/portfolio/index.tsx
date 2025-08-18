import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { showToast } from '../../src/services/toast';
import { Typography, Card, GlassCard } from '../../src/components/ui';
import { useTrading } from '../../src/contexts/TradingContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { fetchPortfolio } from '../../src/services/api';
import { useFocusEffect } from '@react-navigation/native';
import { formatCurrency } from '../../src/config/currency';
import { ResponsiveScreenWrapper } from '../../src/components/responsive/ResponsiveScreenWrapper';

// Declare window for TS when DOM lib isn't included
declare const window: any;

export default function PortfolioScreen() {
  const { user, assets } = useTrading();
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [serverHoldings, setServerHoldings] = useState<{
    symbol: string;
    name: string;
    amount: number;
    value: number;
    change: number;
  }[] | null>(null);

  const load = useCallback(async () => {
    // Don't load if not authenticated
    if (!isAuthenticated || !token) {
      setServerHoldings(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchPortfolio();
      console.log('Portfolio API response:', data); // Debug log
      const mapped = (Array.isArray(data) ? data : []).map((item: any) => {
        const stock = item.stock || {};
        const quantity = Number(item.quantity ?? 0);
        const currentPrice = Number(stock.current_price ?? 0);
        const avg = Number(item.average_price ?? 0);
        const currentValue = Number(item.current_value ?? quantity * currentPrice);
        const investedValue = avg * quantity || 1; // avoid zero div
        const profit = currentValue - investedValue;
        const profitPercentage = investedValue ? (profit / investedValue) * 100 : 0;
        
        console.log(`Portfolio item: ${stock.symbol}, Qty: ${quantity}, Price: ${currentPrice}, Value: ${currentValue}`); // Debug log
        
        return {
          symbol: String(stock.symbol ?? ''),
          name: String(stock.name ?? ''),
          amount: quantity,
          value: currentValue,
          change: profitPercentage,
        };
      });
      setServerHoldings(mapped);
    } catch (e: any) {
      setServerHoldings(null);
      console.error('Portfolio fetch error:', e); // Debug log
      setError(e?.message || 'Failed to load portfolio data');
      if (e?.status === 401) {
        console.log('Authentication error, redirecting to login'); // Debug log
        showToast.info('Connexion requise', 'Veuillez vous connecter pour voir votre portefeuille');
        router.replace('/login' as any);
      }
    } finally {
      setLoading(false);
    }
  }, [router, isAuthenticated, token]);

  useEffect(() => {
    // Web-only: ensure no element keeps focus when an overlay with aria-hidden might be present
    // This avoids the warning: "Blocked aria-hidden on an element because its descendant retained focus."
    if (typeof window !== 'undefined' && (window as any).document?.activeElement) {
      try {
        ((window as any).document.activeElement as any).blur?.();
      } catch {}
    }
    load();
  }, [router, load]);

  // Refresh portfolio when returning to this tab
  useFocusEffect(
    useCallback(() => {
      load();
      return () => {};
    }, [load])
  );

  // Fallback to local context portfolio when server data not available
  const localHoldings = useMemo(() => {
    return user.portfolio.map(item => {
      // Use current value from backend if available
      if (item.currentValue && item.currentValue > 0) {
        const investedValue = item.avgBuyPrice * item.quantity || 1;
        const profit = item.currentValue - investedValue;
        const profitPercentage = investedValue ? (profit / investedValue) * 100 : 0;
        return {
          symbol: item.assetId, // Fallback to assetId if no symbol
          name: item.assetId,
          amount: item.quantity,
          value: item.currentValue,
          change: profitPercentage,
        };
      }
      
      // Fallback to asset lookup for current price
      const asset = assets.find(a => a.id === item.assetId);
      if (!asset) return null;
      const currentValue = asset.currentPrice * item.quantity;
      const investedValue = item.avgBuyPrice * item.quantity || 1;
      const profit = currentValue - investedValue;
      const profitPercentage = investedValue ? (profit / investedValue) * 100 : 0;
      return {
        symbol: asset.symbol,
        name: asset.name,
        amount: item.quantity,
        value: currentValue,
        change: profitPercentage,
      };
    }).filter((h): h is NonNullable<typeof h> => h !== null);
  }, [user.portfolio, assets]);

  const holdings = (serverHoldings && serverHoldings.length > 0) ? serverHoldings : localHoldings;
  const portfolioValue = holdings.reduce((sum, h) => sum + h.value, 0);
  
  // Debug logging
  console.log('Portfolio calculation:', {
    serverHoldings: serverHoldings?.length || 0,
    localHoldings: localHoldings?.length || 0,
    holdings: holdings?.length || 0,
    portfolioValue,
    holdingsData: holdings
  });

  return (
    <ResponsiveScreenWrapper
      backgroundColor={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      showBottomTabs={true}
    >
      {/* Header */}
      <View style={styles.header}>
          <Typography variant="h2" color="text" weight="700">Portfolio</Typography>
          <Typography variant="body1" color="textSecondary">Track your investments and performance</Typography>
        </View>

        {/* Total Value Card */}
        <GlassCard style={styles.totalCard} padding="lg">
          <View style={[styles.totalGradient, { backgroundColor: '#3B82F6' }]}>
            <View style={styles.totalContent}>
              <Typography variant="body2" color="white">Total Value</Typography>
              <Typography variant="h1" color="white" weight="700">
                {portfolioValue > 0 ? formatCurrency(portfolioValue) : 
                 (user.balance > 0 ? `${formatCurrency(user.balance)} (from balance)` : formatCurrency(0))}
              </Typography>
              <Typography variant="body2" color="white">Your Assets</Typography>
              {portfolioValue === 0 && (
                <Typography variant="body2" color="white" style={{ opacity: 0.8 }}>
                  {holdings.length === 0 ? 'No holdings found' : `Holdings: ${holdings.length} items`}
                </Typography>
              )}
              <TouchableOpacity onPress={() => router.push('/transactions' as any)} style={[styles.cta, { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.35)' }]}>
                <Typography variant="body2" color="white" weight="700">Voir les transactions</Typography>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>

        {/* Holdings */}
        <Card style={styles.holdingsCard} variant="elevated" padding="lg">
          <Typography variant="h3" color="text" weight="600" style={styles.sectionTitle}>Your Assets</Typography>
          {loading && (
            <View style={{ paddingVertical: 12 }}>
              <ActivityIndicator color="#3B82F6" />
            </View>
          )}
          
          {holdings.map((holding, index) => (
            <View key={holding.symbol} style={styles.holdingItem}>
              <View style={styles.holdingInfo}>
                <View style={[
                  styles.cryptoIcon,
                  { backgroundColor: holding.symbol === 'BTC' ? '#F7931A' : holding.symbol === 'ETH' ? '#627EEA' : '#0D1421' }
                ]}>
                  <Typography variant="body1" color="white" weight="600">
                    {holding.symbol === 'BTC' ? '₿' : holding.symbol === 'ETH' ? 'Ξ' : holding.symbol.charAt(0)}
                  </Typography>
                </View>
                <View style={styles.holdingDetails}>
                  <Typography variant="body1" color="text" weight="500">
                    {holding.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {holding.amount} {holding.symbol}
                  </Typography>
                </View>
              </View>
              <View style={styles.holdingValue}>
                <Typography variant="body1" color="text" weight="600">
                  {formatCurrency(holding.value)}
                </Typography>
                <Typography 
                  variant="caption" 
                  color={holding.change >= 0 ? 'success' : 'error'}
                >
                  {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(1)}%
                </Typography>
              </View>
            </View>
          ))}
          
      {holdings.length === 0 && (
            <View style={styles.emptyState}>
        <Typography variant="body1" color="textSecondary" align="center">No assets found</Typography>
        <Typography variant="caption" color="textSecondary" align="center">Start trading to see your portfolio here</Typography>
            </View>
          )}
        </Card>
    </ResponsiveScreenWrapper>
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
  totalCard: {
    marginBottom: 16,
  },
  totalGradient: {
    borderRadius: 16,
    padding: 24,
  },
  totalContent: {
    alignItems: 'center',
  },
  cta: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  holdingsCard: {
    marginBottom: 100,
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
  emptyState: {
    paddingVertical: 40,
    gap: 8,
  },
});
