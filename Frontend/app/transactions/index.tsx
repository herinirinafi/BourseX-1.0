import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography, GlassCard } from '../../src/components/ui';
import { BottomTabBar } from '../../src/components/navigation/BottomTabBar';
import { fetchTransactions } from '../../src/services/api';

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

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
  const res = await fetchTransactions() as unknown as Tx[];
        if (cancelled) return;
        setData(res || []);
      } catch {
        // unauthenticated or error -> keep empty
        if (!cancelled) setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

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
          <Typography variant="caption" color="textSecondary">@ {price?.toFixed ? price.toFixed(2) : price}</Typography>
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
