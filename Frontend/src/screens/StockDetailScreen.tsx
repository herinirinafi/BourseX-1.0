import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl
} from 'react-native';
import { useStocksContext } from '../contexts/StocksContext';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Stock, PriceHistory } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';
// Format function from date-fns is not currently used
// import { format } from 'date-fns';

type StockDetailScreenRouteProp = RouteProp<RootStackParamList, 'StockDetail'>;

interface StockDetailScreenProps {
  route: StockDetailScreenRouteProp;
}

const StockDetailScreen: React.FC<StockDetailScreenProps> = ({ route }) => {
  const { stockId } = route.params;
  const { getStockDetail, getStockHistory, updateStockPrice } = useStocksContext();
  
  const navigation = useNavigation();
  
  const [stock, setStock] = useState<Stock | null>(null);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      
      const [stockData, historyData] = await Promise.all([
        getStockDetail(stockId),
        getStockHistory(stockId)
      ]);
      
      setStock(stockData);
      setHistory(historyData);
      setNewPrice(stockData.current_price.toString());
    } catch (err: any) {
      setError(err?.message || 'Failed to load stock details');
      console.error('Error loading stock details:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getStockDetail, getStockHistory, stockId]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  // Load data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const handleUpdatePrice = async () => {
    if (!newPrice) return;
    
    try {
      setUpdating(true);
      const price = parseFloat(newPrice);
      if (isNaN(price) || price <= 0) {
        setError('Please enter a valid price');
        return;
      }
      
      const updatedStock = await updateStockPrice(stockId, price);
      setStock(updatedStock);
      setNewPrice(updatedStock.current_price.toString());
      
      // Refresh history after update
      const historyData = await getStockHistory(stockId);
      setHistory(historyData);
      
    } catch (err: any) {
      setError(err?.message || 'Failed to update price');
      console.error('Error updating price:', err);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [stockId, loadData]);

  useEffect(() => {
    if (stock) {
      setNewPrice(stock.current_price.toString());
    }
  }, [stock]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={[styles.text, {marginTop: 16}]}>Loading stock details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="error-outline" size={48} color="#FF3B30" style={{marginBottom: 16}} />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={[styles.text, {marginBottom: 16}]}>Please try again later</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!stock) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="search-off" size={48} color="#8E8E93" style={{marginBottom: 16}} />
        <Text style={[styles.text, {marginBottom: 24}]}>Stock not found</Text>
        <TouchableOpacity 
          style={[styles.retryButton, {backgroundColor: '#8E8E93'}]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate price change if we have history
  const priceChange = history.length > 1 
    ? stock.current_price - history[1].price 
    : 0;
    
  const priceChangePercent = history.length > 1 && history[1].price !== 0
    ? (priceChange / history[1].price) * 100
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.stockInfo}>
                <Text style={styles.symbol}>{stock.symbol}</Text>
                <Text style={styles.name} numberOfLines={2}>{stock.name}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${stock.current_price.toFixed(2)}</Text>
                {history.length > 1 && (
                  <View style={[
                    styles.priceChangeContainer,
                    priceChange >= 0 ? styles.positiveChange : styles.negativeChange
                  ]}>
                    <MaterialIcons 
                      name={priceChange >= 0 ? 'arrow-upward' : 'arrow-downward'} 
                      size={16} 
                      color="white"
                      style={styles.priceChangeIcon}
                    />
                    <Text style={styles.priceChangeText}>
                      {Math.abs(priceChange).toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                    </Text>
                  </View>
                )}
              </View>
            </View>
        
            <View style={styles.updateContainer}>
              <Text style={styles.updateLabel}>Update Price:</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={newPrice}
                  onChangeText={setNewPrice}
                  keyboardType="numeric"
                  placeholder="Enter new price"
                />
                <TouchableOpacity 
                  style={[styles.updateButton, updating && styles.disabledButton]}
                  onPress={handleUpdatePrice}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.updateButtonText}>Update</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>Price History</Text>
              {history.length > 0 ? (
                <View style={styles.historyList}>
                  {history.map((item) => (
                    <View key={item.id} style={styles.historyItem}>
                      <Text style={styles.historyDate}>
                        {new Date(item.timestamp).toLocaleString()}
                      </Text>
                      <Text style={styles.historyPrice}>
                        ${item.price?.toFixed(2) || '0.00'}
                      </Text>
                    </View>
                  ))}
                </View>
          ) : (
            <Text style={styles.noHistory}>No price history available</Text>
          )}
        </View>
      </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stockInfo: {
    flex: 1,
    marginRight: 12,
  },
  symbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    color: '#666',
    lineHeight: 20,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  priceChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  positiveChange: {
    backgroundColor: '#4CAF50',
  },
  negativeChange: {
    backgroundColor: '#F44336',
  },
  priceChangeIcon: {
    marginRight: 4,
  },
  priceChangeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  volume: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  updateContainer: {
    marginBottom: 20,
  },
  updateLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  historyContainer: {
    marginTop: 24,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  historyList: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    maxHeight: 300,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyDate: {
    color: '#666',
  },
  historyPrice: {
    fontWeight: '500',
  },
  noHistory: {
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default StockDetailScreen;
