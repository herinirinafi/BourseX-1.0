import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useWatchlist } from '../contexts/WatchlistContext';
import { useStocks } from '../contexts/StocksContext';

const WatchlistScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const { stocks } = useStocks();
  const [loading, setLoading] = useState(true);

  // Merge watchlist items with current stock data
  const watchlistWithData = watchlist.map(watchlistItem => {
    const stockData = stocks.find(s => s.id === watchlistItem.id);
    return {
      ...watchlistItem,
      current_price: stockData?.current_price || watchlistItem.current_price,
      price_change: stockData ? stockData.current_price - watchlistItem.current_price : 0,
      price_change_percent: stockData ? 
        ((stockData.current_price - watchlistItem.current_price) / watchlistItem.current_price) * 100 : 0
    };
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleRemoveFromWatchlist = async (stockId: number) => {
    try {
      await removeFromWatchlist(stockId);
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (watchlist.length === 0) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="star-outline" size={64} color="#CCCCCC" />
        <Text style={styles.emptyText}>Your watchlist is empty</Text>
        <Text style={styles.emptySubtext}>Add stocks to your watchlist to track them here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={watchlistWithData}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.stockItem}
            onPress={() => navigation.navigate('StockDetail', { stockId: item.id })}
          >
            <View style={styles.stockInfo}>
              <Text style={styles.stockSymbol}>{item.symbol}</Text>
              <Text style={styles.stockName} numberOfLines={1}>{item.name}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.stockPrice}>${item.current_price?.toFixed(2) || 'N/A'}</Text>
              <View style={styles.priceChangeContainer}>
                <Text 
                  style={[
                    styles.priceChange,
                    { color: item.price_change >= 0 ? '#4CAF50' : '#F44336' }
                  ]}
                >
                  {item.price_change >= 0 ? '▲' : '▼'} 
                  {Math.abs(item.price_change_percent).toFixed(2)}%
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleRemoveFromWatchlist(item.id)}
            >
              <MaterialIcons name="star" size={24} color="#FFC107" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Watchlist</Text>
            <Text style={styles.stockCount}>{watchlist.length} items</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  stockCount: {
    fontSize: 14,
    color: '#666',
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  stockInfo: {
    flex: 1,
    marginRight: 12,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  stockName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginRight: 16,
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
  },
});

export default WatchlistScreen;
