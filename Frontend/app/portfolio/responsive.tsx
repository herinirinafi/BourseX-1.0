import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ActivityIndicator, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { showToast } from '../../src/services/toast';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography, GlassCard } from '../../src/components/ui';
import { SmartNavigationBar } from '../../src/components/navigation';
import { 
  ResponsiveContainer, 
  ResponsiveGrid, 
  ResponsiveCard, 
  ResponsiveRow 
} from '../../src/components/responsive/ResponsiveLayouts';
import { 
  ResponsiveText, 
  ResponsiveHeading, 
  ResponsiveButton 
} from '../../src/components/responsive/ResponsiveText';
import { useTheme } from '../../src/config/theme';
import { useTrading } from '../../src/contexts/TradingContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { fetchPortfolio } from '../../src/services/api';
import { useFocusEffect } from '@react-navigation/native';
import { formatCurrency } from '../../src/config/currency';
import { useI18n } from '../../src/contexts/I18nContext';
import { 
  isDesktop, 
  isTablet, 
  spacing, 
  getCardDimensions, 
  fontSize, 
  borderRadius 
} from '../../src/utils/responsive';

export default function ResponsivePortfolioScreen() {
  const theme = useTheme();
  const { user, assets } = useTrading();
  const router = useRouter();
  const { t } = useI18n();
  const { isAuthenticated, token } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [serverHoldings, setServerHoldings] = useState<{
    symbol: string;
    name: string;
    amount: number;
    value: number;
    change: number;
  }[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setServerHoldings(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchPortfolio();
      const mapped = (Array.isArray(data) ? data : []).map((item: any) => {
        const stock = item.stock || {};
        const quantity = Number(item.quantity ?? 0);
        const currentPrice = Number(stock.current_price ?? 0);
        const avg = Number(item.average_price ?? 0);
        const currentValue = Number(item.current_value ?? quantity * currentPrice);
        const investedValue = avg * quantity || 1;
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
      setServerHoldings(null);
      console.error('Portfolio fetch error:', e);
      setError(e?.message || t('error.failedToLoad'));
      if (e?.status === 401) {
        showToast.info('Connexion requise', 'Veuillez vous connecter pour voir votre portefeuille');
        router.replace('/login' as any);
      }
    } finally {
      setLoading(false);
    }
  }, [router, isAuthenticated, token, t]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => {
    load();
  }, [router, load]);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {};
    }, [load])
  );

  const holdings = useMemo(() => {
    if (serverHoldings) return serverHoldings;
    return assets.map(asset => ({
      symbol: asset.symbol,
      name: asset.name,
      amount: asset.amount || 0, // Use asset.amount instead of asset.quantity
      value: (asset.amount || 0) * asset.price,
      change: asset.change || 0, // Provide default value of 0 if change doesn't exist
    }));
  }, [serverHoldings, assets]);

  const totalValue = useMemo(() => {
    return holdings.reduce((sum, holding) => sum + holding.value, 0);
  }, [holdings]);

  const totalGain = useMemo(() => {
    return holdings.reduce((sum, holding) => {
      const invested = holding.value / (1 + holding.change / 100);
      return sum + (holding.value - invested);
    }, 0);
  }, [holdings]);

  const totalGainPercent = useMemo(() => {
    const totalInvested = totalValue - totalGain;
    return totalInvested ? (totalGain / totalInvested) * 100 : 0;
  }, [totalValue, totalGain]);

  if (loading && !holdings.length) {
    return (
      <LinearGradient colors={['#0F172A', '#1E293B', '#374151']} style={{ flex: 1 }}>
        <ResponsiveContainer style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FFD700" />
          <ResponsiveText size="lg" color="#FFFFFF" style={{ marginTop: spacing.md }}>
            Chargement du portefeuille...
          </ResponsiveText>
        </ResponsiveContainer>
      </LinearGradient>
    );
  }

  const renderPortfolioCard = () => (
    <ResponsiveCard 
      style={{
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
        marginBottom: spacing.lg,
      }}
    >
      <LinearGradient
        colors={['rgba(255, 215, 0, 0.1)', 'rgba(255, 215, 0, 0.05)']}
        style={{ 
          borderRadius: borderRadius.lg, 
          padding: isDesktop ? spacing.xl : spacing.lg 
        }}
      >
        <ResponsiveRow justifyContent="space-between" alignItems="center" style={{ marginBottom: spacing.md }}>
          <ResponsiveHeading level={2} color="#FFD700">
            Portfolio Total
          </ResponsiveHeading>
          {isDesktop && (
            <ResponsiveButton
              title="Analyser"
              onPress={() => router.push('/trading' as any)}
              variant="outline"
              size="sm"
            />
          )}
        </ResponsiveRow>
        
        <ResponsiveText size="4xl" weight="bold" color="#FFFFFF" style={{ marginBottom: spacing.sm }}>
          {formatCurrency(totalValue)}
        </ResponsiveText>
        
        <ResponsiveRow justifyContent="space-between" wrap={!isDesktop}>
          <View style={{ flex: isDesktop ? 1 : undefined, marginRight: isDesktop ? spacing.lg : 0 }}>
            <ResponsiveText size="sm" color="rgba(255, 255, 255, 0.7)">
              Gain/Perte Total
            </ResponsiveText>
            <ResponsiveText 
              size="xl" 
              weight="semibold" 
              color={totalGain >= 0 ? '#10B981' : '#EF4444'}
            >
              {formatCurrency(totalGain)} ({totalGainPercent.toFixed(2)}%)
            </ResponsiveText>
          </View>
          
          <View style={{ flex: isDesktop ? 1 : undefined, marginTop: isTablet || !isDesktop ? spacing.sm : 0 }}>
            <ResponsiveText size="sm" color="rgba(255, 255, 255, 0.7)">
              Nombre d'actions
            </ResponsiveText>
            <ResponsiveText size="xl" weight="semibold" color="#FFFFFF">
              {holdings.length} positions
            </ResponsiveText>
          </View>
        </ResponsiveRow>
        
        {!isDesktop && (
          <ResponsiveButton
            title="Trading Avancé"
            onPress={() => router.push('/trading' as any)}
            variant="primary"
            size="md"
            fullWidth
            style={{ marginTop: spacing.lg }}
          />
        )}
      </LinearGradient>
    </ResponsiveCard>
  );

  const renderHoldingItem = (holding: any, index: number) => (
    <ResponsiveCard
      key={`${holding.symbol}-${index}`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: spacing.md,
      }}
    >
      <TouchableOpacity
        onPress={() => router.push(`/search?symbol=${holding.symbol}` as any)}
        activeOpacity={0.7}
      >
        <ResponsiveRow justifyContent="space-between" alignItems="center">
          <View style={{ flex: 1 }}>
            <ResponsiveRow alignItems="center" gap={spacing.sm}>
              <View style={{
                width: isDesktop ? 48 : 36,
                height: isDesktop ? 48 : 36,
                borderRadius: isDesktop ? 24 : 18,
                backgroundColor: '#FFD700',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ResponsiveText 
                  size={isDesktop ? "lg" : "base"} 
                  weight="bold" 
                  color="#0F172A"
                >
                  {holding.symbol.charAt(0)}
                </ResponsiveText>
              </View>
              
              <View style={{ flex: 1 }}>
                <ResponsiveText size="lg" weight="semibold" color="#FFFFFF">
                  {holding.symbol}
                </ResponsiveText>
                <ResponsiveText size="sm" color="rgba(255, 255, 255, 0.7)">
                  {holding.name} • {holding.amount} actions
                </ResponsiveText>
              </View>
            </ResponsiveRow>
          </View>
          
          <View style={{ alignItems: 'flex-end' }}>
            <ResponsiveText size="lg" weight="semibold" color="#FFFFFF">
              {formatCurrency(holding.value)}
            </ResponsiveText>
            <ResponsiveText 
              size="sm" 
              weight="medium"
              color={holding.change >= 0 ? '#10B981' : '#EF4444'}
            >
              {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(2)}%
            </ResponsiveText>
          </View>
        </ResponsiveRow>
      </TouchableOpacity>
    </ResponsiveCard>
  );

  const renderEmptyState = () => (
    <ResponsiveCard style={{ alignItems: 'center', padding: spacing.xl }}>
      <ResponsiveText size="5xl" style={{ marginBottom: spacing.md }}>
        📊
      </ResponsiveText>
      <ResponsiveHeading level={3} color="#374151" textAlign="center">
        Aucune position
      </ResponsiveHeading>
      <ResponsiveText 
        size="base" 
        color="#6B7280" 
        textAlign="center" 
        style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}
      >
        Commencez à investir pour voir votre portefeuille ici
      </ResponsiveText>
      <ResponsiveButton
        title="Commencer à trader"
        onPress={() => router.push('/trading' as any)}
        variant="primary"
        size="lg"
      />
    </ResponsiveCard>
  );

  return (
    <LinearGradient colors={['#0F172A', '#1E293B', '#374151']} style={{ flex: 1 }}>
      <ResponsiveContainer style={{ flex: 1 }}>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingHorizontal: isDesktop ? spacing.xl : spacing.lg,
            paddingBottom: spacing.xl 
          }}
        >
          {/* Header */}
          <View style={{ paddingTop: spacing.xl, paddingBottom: spacing.lg }}>
            <ResponsiveHeading level={1} color="#FFFFFF" textAlign="center">
              Mon Portfolio
            </ResponsiveHeading>
          </View>

          {/* Portfolio Summary */}
          {renderPortfolioCard()}

          {/* Holdings */}
          <View style={{ marginBottom: spacing.xl }}>
            <ResponsiveHeading 
              level={3} 
              color="#FFFFFF" 
              style={{ marginBottom: spacing.lg }}
            >
              Mes Positions
            </ResponsiveHeading>
            
            {holdings.length > 0 ? (
              isDesktop ? (
                <ResponsiveGrid columns={2} gap={spacing.md}>
                  {holdings.map(renderHoldingItem)}
                </ResponsiveGrid>
              ) : (
                <View>
                  {holdings.map(renderHoldingItem)}
                </View>
              )
            ) : (
              renderEmptyState()
            )}
          </View>

          {/* Bottom spacing for tab bar */}
          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </ResponsiveContainer>
      
      <SmartNavigationBar />
    </LinearGradient>
  );
}
