import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useStocksContext } from '../contexts/StocksContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Stock } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

type StocksScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Stocks'>;

const StocksScreen = () => {
  const { stocks, loading, error, loadStocks } = useStocksContext();
  const navigation = useNavigation<StocksScreenNavigationProp>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load stocks when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStocks();
    }, [loadStocks])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadStocks();
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: Stock }) => (
    <TouchableOpacity 
      style={styles.stockItem}
      onPress={() => navigation.navigate('StockDetail', { stockId: item.id })}
    >
      <View style={styles.stockInfo}>
        <Text style={styles.stockSymbol}>{item.symbol}</Text>
        <Text style={styles.stockName}>{item.name}</Text>
      </View>
      <View style={styles.stockPriceContainer}>
        <Text style={styles.stockPrice}>${item.current_price.toFixed(2)}</Text>
        <Text style={styles.stockVolume}>Vol: {item.volume.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && stocks.length === 0 && !isRefreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading stocks...</Text>
      </View>
    );
  }

  if (error && !isRefreshing) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="error-outline" size={50} color="#FF3B30" style={styles.errorIcon} />
        <Text style={styles.errorText}>Error loading stocks</Text>
        <Text style={styles.errorSubText}>{error}</Text>
        <TouchableOpacity 
          onPress={loadStocks} 
          style={styles.retryButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.retryButtonText}>Try Again</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={stocks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={60} color="#CCCCCC" />
            <Text style={styles.emptyText}>No stocks available</Text>
            <TouchableOpacity 
              onPress={loadStocks} 
              style={[styles.retryButton, styles.emptyButton]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.retryButtonText}>Refresh</Text>
              )}
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 10,
    marginBottom: 20,
  },
  emptyButton: {
    width: 150,
  },
  listContent: {
    padding: 10,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stockName: {
    fontSize: 14,
    color: '#666',
  },
  stockPriceContainer: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  stockVolume: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    color: '#666666',
  },
  errorIcon: {
    marginBottom: 15,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  errorSubText: {
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default StocksScreen;
