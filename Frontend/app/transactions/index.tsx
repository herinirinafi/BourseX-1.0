import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography, GlassCard } from '../../src/components/ui';
import { BottomTabBar } from '../../src/components/navigation/BottomTabBar';
import { fetchTransactions } from '../../src/services/api';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { showToast } from '../../src/services/toast';
import { useTrading } from '../../src/contexts/TradingContext';
import { formatCurrency } from '../../src/config/currency';

type Tx = {
  id: number | string;
  stock?: { symbol?: string; name?: string };
  stock_id?: number;
  symbol?: string;
  type?: 'BUY' | 'SELL' | string;
  trade_type?: 'BUY' | 'SELL' | string;
  quantity: number;
  price?: number;
  executed_price?: number;
  timestamp?: string;
  created_at?: string;
};

export default function TransactionsScreen() {
  const [data, setData] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { transactions: localTx } = useTrading();
  const fetchAndMap = useCallback(async (isMountedRef?: { current: boolean }) => {
    setLoading(true);
    try {
      const res = await fetchTransactions() as unknown as any[];
      const serverTx: Tx[] = (res || []).map((t: any) => ({
        id: t.id,
        stock: t.stock,
        stock_id: t?.stock?.id ?? t?.stock_id,
        symbol: t?.stock?.symbol || t?.symbol,
        type: (t?.transaction_type || t?.type),
        trade_type: (t?.transaction_type || t?.type),
        quantity: Number(t?.quantity ?? 0),
        price: Number(t?.price ?? t?.executed_price ?? 0),
        executed_price: Number(t?.executed_price ?? t?.price ?? 0),
        timestamp: t?.timestamp || t?.created_at,
        created_at: t?.created_at || t?.timestamp,
      }));
      // Fallback to local transactions if server list is empty
      if (!isMountedRef || isMountedRef.current) {
        if (serverTx.length > 0) {
          setData(serverTx);
        } else {
          const localMapped: Tx[] = (localTx || []).map((lt: any) => ({
            id: lt.id,
            symbol: String(lt.assetId || 'ASSET'),
            type: (lt.type || '').toUpperCase(),
            trade_type: (lt.type || '').toUpperCase(),
            quantity: Number(lt.quantity || 0),
            price: Number(lt.price || 0),
            timestamp: (lt.timestamp instanceof Date) ? lt.timestamp.toISOString() : String(lt.timestamp || ''),
          }));
          setData(localMapped);
        }
      }
    } catch (e: any) {
      if (e?.status === 401) {
        showToast.info('Connexion requise', 'Veuillez vous connecter pour voir vos transactions');
        router.replace('/login' as any);
      }
      // On error, show local-only transactions if available
      if (!isMountedRef || isMountedRef.current) {
        const localMapped: Tx[] = (localTx || []).map((lt: any) => ({
          id: lt.id,
          symbol: String(lt.assetId || 'ASSET'),
          type: (lt.type || '').toUpperCase(),
          trade_type: (lt.type || '').toUpperCase(),
          quantity: Number(lt.quantity || 0),
          price: Number(lt.price || 0),
          timestamp: (lt.timestamp instanceof Date) ? lt.timestamp.toISOString() : String(lt.timestamp || ''),
        }));
        setData(localMapped);
      }
    } finally {
      if (!isMountedRef || isMountedRef.current) setLoading(false);
    }
  }, [router, localTx]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await fetchAndMap({ current: !cancelled });
    };
    run();
    return () => { cancelled = true; };
  }, [fetchAndMap, router]);

  // Rafraîchir quand on revient sur l'onglet Transactions
  useFocusEffect(
  React.useCallback(() => {
      const mounted = { current: true };
      fetchAndMap(mounted);
      return () => { mounted.current = false; };
  }, [fetchAndMap])
  );

  const renderItem = ({ item }: { item: Tx }) => {
    const kind = (item.type || item.trade_type || '').toUpperCase();
    const sym = item.symbol || item.stock?.symbol || 'ASSET';
    const name = item.stock?.name || sym;
  const price = item.price ?? item.executed_price ?? 0;
    const dt = item.timestamp || item.created_at || '';
    return (
      <GlassCard style={styles.row} padding="md">
        <View style={styles.rowLeft}>
          <Typography variant="body1" weight="700" color={kind === 'SELL' ? 'error' : 'success'}>
            {kind || 'TRADE'}
          </Typography>
          <Typography variant="caption" color="textSecondary">{new Date(dt || Date.now()).toLocaleString()}</Typography>
        </View>
        <View style={styles.rowCenter}>
          <Typography variant="body1" weight="600">{sym}</Typography>
          <Typography variant="caption" color="textSecondary">{name}</Typography>
        </View>
        <View style={styles.rowRight}>
          <Typography variant="body1" weight="700">{item.quantity}x</Typography>
          <Typography variant="caption" color="textSecondary">@ {formatCurrency(price)}</Typography>
        </View>
      </GlassCard>
    );
  };

  return (
    <LinearGradient colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']} style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h2" weight="700">Transactions</Typography>
        <Typography variant="body2" color="textSecondary">Historique de vos opérations</Typography>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={!loading ? (
          <GlassCard padding="lg" style={styles.empty}>
            <Typography variant="body1" align="center">Aucune transaction à afficher</Typography>
            <Typography variant="caption" color="textSecondary" align="center">Connectez-vous pour voir l&#39;historique</Typography>
          </GlassCard>
        ) : null}
      />
      <BottomTabBar />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLeft: { width: 90 },
  rowCenter: { flex: 1 },
  rowRight: { width: 90, alignItems: 'flex-end' },
  empty: { marginHorizontal: 16, marginTop: 24 },
});
