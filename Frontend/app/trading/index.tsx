import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useTrading } from '../../src/contexts/TradingContext';
import { Asset } from '../../src/types';

const TradingScreen = () => {
  const { assets, user, buyAsset, sellAsset } = useTrading();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [amount, setAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  const handleTrade = () => {
    if (!selectedAsset || !amount) return;
    const quantity = parseFloat(amount);
    if (isNaN(quantity) || quantity <= 0) return;

    if (tradeType === 'buy') {
      buyAsset(selectedAsset.id, quantity);
    } else {
      sellAsset(selectedAsset.id, quantity);
    }
    setAmount('');
  };

  const maxBuy = selectedAsset 
    ? Math.floor(user.balance / selectedAsset.currentPrice * 100) / 100 
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, tradeType === 'buy' && styles.activeTab]}
          onPress={() => setTradeType('buy')}
        >
          <Text style={[styles.tabText, tradeType === 'buy' && styles.activeTabText]}>
            Acheter
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, tradeType === 'sell' && styles.activeTab]}
          onPress={() => setTradeType('sell')}
        >
          <Text style={[styles.tabText, tradeType === 'sell' && styles.activeTabText]}>
            Vendre
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Actif</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.assetsList}>
          {assets.map(asset => (
            <TouchableOpacity 
              key={asset.id}
              style={[
                styles.assetItem, 
                selectedAsset?.id === asset.id && styles.selectedAsset
              ]}
              onPress={() => setSelectedAsset(asset)}
            >
              <Image source={{ uri: asset.image }} style={styles.assetIcon} />
              <Text style={styles.assetSymbol}>{asset.symbol}</Text>
              <Text style={[
                styles.priceChange,
                asset.change24h >= 0 ? styles.positive : styles.negative
              ]}>
                {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Montant</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            placeholderTextColor="#666"
          />
          <Text style={styles.currency}>
            {selectedAsset?.symbol || '---'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Prix:</Text>
          <Text style={styles.infoValue}>
            {selectedAsset ? `$${selectedAsset.currentPrice.toFixed(2)}` : '---'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total:</Text>
          <Text style={styles.infoValue}>
            {selectedAsset && amount && !isNaN(parseFloat(amount)) 
              ? `$${(parseFloat(amount) * selectedAsset.currentPrice).toFixed(2)}` 
              : '---'}
          </Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.tradeButton, 
            (!selectedAsset || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) && styles.disabledButton
          ]}
          onPress={handleTrade}
          disabled={!selectedAsset || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
        >
          <Text style={styles.tradeButtonText}>
            {tradeType === 'buy' ? 'Acheter' : 'Vendre'} {selectedAsset?.symbol || ''}
          </Text>
        </TouchableOpacity>

        {tradeType === 'buy' && (
          <TouchableOpacity 
            style={styles.maxButton}
            onPress={() => setAmount(maxBuy.toString())}
          >
            <Text style={styles.maxButtonText}>
              MAX: {maxBuy} {selectedAsset?.symbol || ''}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 15,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2A2A2A',
  },
  tabText: {
    color: '#888',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#007AFF',
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
  },
  label: {
    color: '#888',
    marginBottom: 8,
    fontSize: 14,
  },
  assetsList: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  assetItem: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    minWidth: 80,
  },
  selectedAsset: {
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  assetIcon: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  assetSymbol: {
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 5,
  },
  priceChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 24,
    paddingVertical: 15,
  },
  currency: {
    color: '#888',
    fontSize: 16,
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    color: '#888',
  },
  infoValue: {
    color: '#FFF',
    fontWeight: '500',
  },
  tradeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  tradeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  maxButton: {
    alignSelf: 'center',
    marginTop: 15,
    padding: 5,
  },
  maxButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
});

export default TradingScreen;
