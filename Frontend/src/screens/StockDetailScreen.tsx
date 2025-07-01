import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useStocksContext } from '../contexts/StocksContext';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

type StockDetailScreenRouteProp = RouteProp<RootStackParamList, 'StockDetail'>;

interface StockDetailScreenProps {
  route: StockDetailScreenRouteProp;
}

const StockDetailScreen: React.FC<StockDetailScreenProps> = ({ route }) => {
  const { stockId } = route.params;
  const { getStockDetail, getStockHistory, updateStockPrice } = useStocksContext();
  
  const [stock, setStock] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [stockData, historyData] = await Promise.all([
        getStockDetail(stockId),
        getStockHistory(stockId)
      ]);
      
      setStock(stockData);
      setHistory(historyData);
      setNewPrice(stockData.current_price.toString());
    } catch (err) {
      setError(err.message || 'Failed to load stock details');
      console.error('Error loading stock details:', err);
    } finally {
      setLoading(false);
    }
  };

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
      
    } catch (err) {
      setError(err.message || 'Failed to update price');
      console.error('Error updating price:', err);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [stockId]);

  if (loading && !stock) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!stock) {
    return (
      <View style={styles.centered}>
        <Text>Stock not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.symbol}>{stock.symbol}</Text>
        <Text style={styles.name}>{stock.name}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${stock.current_price.toFixed(2)}</Text>
          <Text style={styles.volume}>Volume: {stock.volume.toLocaleString()}</Text>
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
              style={styles.updateButton}
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
                    ${item.price.toFixed(2)}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  symbol: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  priceContainer: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  volume: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
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
    marginTop: 10,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
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
    marginTop: 10,
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
    fontWeight: 'bold',
  },
});

export default StockDetailScreen;
