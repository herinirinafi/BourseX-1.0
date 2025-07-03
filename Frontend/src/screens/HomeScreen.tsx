import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { MaterialIcons } from '@expo/vector-icons';
import { useStocks } from '../contexts/StocksContext';
import { usePortfolio } from '../contexts/PortfolioContext';

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { stocks, loading: stocksLoading } = useStocks();
  const { portfolio, getPortfolioPerformance, loading: portfolioLoading } = usePortfolio();
  
  const { totalValue, totalInvested, profitLoss, profitLossPercentage } = getPortfolioPerformance();
  const isLoading = stocksLoading || portfolioLoading;

  const topMovers = [...(stocks || [])]
    .sort((a, b) => Math.abs(b.current_price - b.current_price * 0.9) - Math.abs(a.current_price - a.current_price * 0.9))
    .slice(0, 5);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Portfolio Summary */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Portfolio Value</Text>
        <Text style={styles.portfolioValue}>${totalValue.toFixed(2)}</Text>
        
        <View style={styles.performanceRow}>
          <Text style={[
            styles.performanceText, 
            { color: profitLoss >= 0 ? '#4CAF50' : '#F44336' }
          ]}>
            {profitLoss >= 0 ? '▲' : '▼'} ${Math.abs(profitLoss).toFixed(2)} ({profitLossPercentage.toFixed(2)}%)
          </Text>
          <Text style={styles.secondaryText}>All time</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Watchlist')}
          >
            <MaterialIcons name="star" size={24} color="#FFC107" />
            <Text style={styles.actionText}>Watchlist</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Alerts')}
          >
            <MaterialIcons name="notifications" size={24} color="#2196F3" />
            <Text style={styles.actionText}>Alerts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('News')}
          >
            <MaterialIcons name="article" size={24} color="#4CAF50" />
            <Text style={styles.actionText}>News</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Movers */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Top Movers</Text>
        {topMovers.map((stock) => (
          <TouchableOpacity 
            key={stock.id}
            style={styles.stockItem}
            onPress={() => navigation.navigate('StockDetail', { stockId: stock.id })}
          >
            <View style={styles.stockInfo}>
              <Text style={styles.stockSymbol}>{stock.symbol}</Text>
              <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
            </View>
            <View style={styles.stockPriceContainer}>
              <Text style={styles.stockPrice}>${stock.current_price.toFixed(2)}</Text>
              <Text 
                style={[
                  styles.priceChange,
                  { color: stock.current_price >= stock.current_price * 0.9 ? '#4CAF50' : '#F44336' }
                ]}
              >
                {stock.current_price >= stock.current_price * 0.9 ? '▲' : '▼'} 
                {Math.abs(10).toFixed(2)}%
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  performanceText: {
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryText: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    flex: 1,
    marginHorizontal: 4,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#333',
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  stockPriceContainer: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  priceChange: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default HomeScreen;
