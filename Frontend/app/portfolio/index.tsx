import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography, Card, GlassCard } from '../../src/components/ui';
import { BottomTabBar } from '../../src/components/navigation/BottomTabBar';
import { useTheme } from '../../src/config/theme';
import { useTrading } from '../../src/contexts/TradingContext';
import { fetchPortfolio } from '../../src/services/api';

export default function PortfolioScreen() {
  const theme = useTheme();
  const { user, assets } = useTrading();
  const router = useRouter();

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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPortfolio();
        // data is array of Portfolio items from backend
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => {
          const stock = item.stock || {};
          const quantity = Number(item.quantity ?? 0);
          const currentPrice = Number(stock.current_price ?? 0);
          const avg = Number(item.average_price ?? 0);
          const currentValue = Number(item.current_value ?? quantity * currentPrice);
          const investedValue = avg * quantity || 1; // avoid zero div
          const profit = currentValue - investedValue;
          const profitPercentage = investedValue ? (profit / investedValue) * 100 : 0;
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
        // Likely 401 when unauthenticated; fall back silently
        setServerHoldings(null);
        setError(e?.message || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Fallback to local context portfolio when server data not available
  const localHoldings = useMemo(() => {
    return user.portfolio.map(item => {
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

  const holdings = serverHoldings ?? localHoldings;
  const portfolioValue = holdings.reduce((sum, h) => sum + h.value, 0);

  return (
    <LinearGradient
      colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h2" color="text" weight="700">
            Portfolio
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gérez vos investissements
          </Typography>
        </View>

        {/* Total Value Card */}
        <GlassCard style={styles.totalCard} padding="lg">
          <LinearGradient
            colors={theme.gradients.primary as any}
            style={styles.totalGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.totalContent}>
              <Typography variant="body2" color="white">
                Valeur Totale
              </Typography>
              <Typography variant="h1" color="white" weight="700">
                ${portfolioValue.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="white">
                Vos investissements
              </Typography>
              <TouchableOpacity onPress={() => router.push('/transactions' as any)} style={[styles.cta, { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.35)' }]}>
                <Typography variant="body2" color="white" weight="700">Voir les transactions</Typography>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </GlassCard>

        {/* Holdings */}
        <Card style={styles.holdingsCard} variant="elevated" padding="lg">
          <Typography variant="h3" color="text" weight="600" style={styles.sectionTitle}>
            Mes Holdings
          </Typography>
          {loading && (
            <View style={{ paddingVertical: 12 }}>
              <ActivityIndicator color={theme.colors.primary} />
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
                  ${holding.value.toFixed(2)}
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
              <Typography variant="body1" color="textSecondary" align="center">
                Aucun actif dans votre portfolio
              </Typography>
              <Typography variant="caption" color="textSecondary" align="center">
                Commencez à trader pour voir vos investissements ici
              </Typography>
            </View>
          )}
        </Card>
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
