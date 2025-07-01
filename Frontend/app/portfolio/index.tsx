import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { useTrading } from '../../src/contexts/TradingContext';

export default function PortfolioScreen() {
  const { user, assets } = useTrading();

  // Calculer la valeur totale du portefeuille
  const portfolioValue = user.portfolio.reduce((total, item) => {
    const asset = assets.find(a => a.id === item.assetId);
    return total + (asset ? asset.currentPrice * item.quantity : 0);
  }, 0);

  // Calculer le rendement total
  const totalInvested = user.portfolio.reduce((total, item) => {
    return total + item.avgBuyPrice * item.quantity;
  }, 0);
  
  const totalReturn = portfolioValue - totalInvested;
  const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  const renderAsset = ({ item }) => {
    const asset = assets.find(a => a.id === item.assetId);
    if (!asset) return null;
    
    const currentValue = asset.currentPrice * item.quantity;
    const investedValue = item.avgBuyPrice * item.quantity;
    const profit = currentValue - investedValue;
    const profitPercentage = (profit / investedValue) * 100;

    return (
      <View style={styles.assetCard}>
        <View style={styles.assetHeader}>
          <Image source={{ uri: asset.image }} style={styles.assetIcon} />
          <View>
            <Text style={styles.assetName}>{asset.name}</Text>
            <Text style={styles.assetSymbol}>{asset.symbol}</Text>
          </View>
        </View>
        
        <View style={styles.assetDetails}>
          <View>
            <Text style={styles.detailLabel}>Quantité</Text>
            <Text style={styles.detailValue}>{item.quantity.toFixed(6)}</Text>
          </View>
          <View style={styles.detailColumn}>
            <Text style={styles.detailLabel}>Valeur actuelle</Text>
            <Text style={styles.detailValue}>${currentValue.toFixed(2)}</Text>
          </View>
          <View style={[styles.detailColumn, styles.rightAligned]}>
            <Text style={[
              styles.profitText,
              profit >= 0 ? styles.positive : styles.negative
            ]}>
              {profit >= 0 ? '+' : ''}{profit.toFixed(2)} $
              ({profitPercentage.toFixed(2)}%)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.balanceLabel}>Valeur du portefeuille</Text>
        <Text style={styles.balanceValue}>${portfolioValue.toFixed(2)}</Text>
        <Text style={[
          styles.returnText,
          totalReturn >= 0 ? styles.positive : styles.negative
        ]}>
          {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)} $
          ({returnPercentage.toFixed(2)}%)
        </Text>
      </View>

      <View style={styles.portfolioList}>
        <Text style={styles.sectionTitle}>Vos actifs</Text>
        {user.portfolio.length > 0 ? (
          <FlatList
            data={user.portfolio}
            renderItem={renderAsset}
            keyExtractor={item => item.assetId}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Votre portefeuille est vide</Text>
            <Text style={styles.emptyStateSubtext}>Commencez par acheter des actifs</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  header: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#888',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  returnText: {
    fontSize: 16,
    fontWeight: '500',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  portfolioList: {
    flex: 1,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  assetCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  assetIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  assetName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  assetSymbol: {
    color: '#888',
    fontSize: 14,
  },
  assetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailColumn: {
    flex: 1,
  },
  rightAligned: {
    alignItems: 'flex-end',
  },
  detailLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  profitText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
});
