import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { usePortfolio } from '../contexts/PortfolioContext';

type PortfolioScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StockDetail'>;

const PortfolioScreen = () => {
  const navigation = useNavigation<PortfolioScreenNavigationProp>();
  const { portfolio, getPortfolioPerformance, loading } = usePortfolio();
  const [refreshing, setRefreshing] = useState(false);
  
  const { totalValue, totalInvested, profitLoss, profitLossPercentage } = getPortfolioPerformance();

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => {
    const currentValue = item.stock.current_price * item.quantity;
    const profit = currentValue - item.totalInvested;
    const profitPercentage = (profit / item.totalInvested) * 100;
    
    return (
      <TouchableOpacity 
        style={styles.portfolioItem}
        onPress={() => navigation.navigate('StockDetail', { stockId: item.stock.id })}
      >
        <View style={styles.stockInfo}>
          <View style={styles.stockHeader}>
            <Text style={styles.stockSymbol}>{item.stock.symbol}</Text>
            <Text style={styles.quantity}>Qty: {item.quantity}</Text>
          </View>
          <Text style={styles.stockName} numberOfLines={1}>{item.stock.name}</Text>
          <View style={styles.investmentInfo}>
            <Text style={styles.investedAmount}>Invested: ${item.totalInvested.toFixed(2)}</Text>
            <Text style={styles.currentValue}>Current: ${currentValue.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.performanceContainer}>
          <Text style={[
            styles.profitLoss,
            { color: profit >= 0 ? '#4CAF50' : '#F44336' }
          ]}>
            {profit >= 0 ? '▲' : '▼'} ${Math.abs(profit).toFixed(2)} ({Math.abs(profitPercentage).toFixed(2)}%)
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Portfolio Value</Text>
        <Text style={styles.portfolioValue}>${totalValue.toFixed(2)}</Text>
        
        <View style={styles.performanceRow}>
          <View>
            <Text style={styles.performanceLabel}>Total Invested</Text>
            <Text style={styles.performanceValue}>${totalInvested.toFixed(2)}</Text>
          </View>
          <View style={styles.performanceDivider} />
          <View>
            <Text style={styles.performanceLabel}>Total P&L</Text>
            <Text style={[
              styles.performanceValue,
              { color: profitLoss >= 0 ? '#4CAF50' : '#F44336' }
            ]}>
              {profitLoss >= 0 ? '▲' : '▼'} ${Math.abs(profitLoss).toFixed(2)} ({Math.abs(profitLossPercentage).toFixed(2)}%)
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={portfolio}
        renderItem={renderItem}
        keyExtractor={(item) => item.stock.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="account-balance-wallet" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>Your portfolio is empty</Text>
            <Text style={styles.emptySubtext}>Start by adding stocks to your portfolio</Text>
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
  },
  summaryCard: {
    backgroundColor: '#007AFF',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  portfolioValue: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  performanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  performanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  performanceValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  portfolioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  quantity: {
    fontSize: 14,
    color: '#666',
  },
  stockName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  investmentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  investedAmount: {
    fontSize: 12,
    color: '#666',
  },
  currentValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  performanceContainer: {
    alignItems: 'flex-end',
  },
  profitLoss: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
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
});

export default PortfolioScreen;
