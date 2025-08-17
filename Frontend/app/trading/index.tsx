import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography, Card, Button, GlassCard, PriceChart } from '../../src/components/ui';
import { BottomTabBar } from '../../src/components/navigation/BottomTabBar';
import { useTheme } from '../../src/config/theme';
import { useTrading } from '../../src/contexts/TradingContext';
import { useGamification } from '../../src/contexts/GamificationContext';
import { Asset } from '../../src/types';

const TradingScreen = () => {
  const theme = useTheme();
  const { assets, user, buyAsset, sellAsset } = useTrading();
  const { triggerGamificationUpdate } = useGamification();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [amount, setAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  const handleTrade = async () => {
    if (!selectedAsset || !amount) {
      Alert.alert('Erreur', 'Veuillez sélectionner un actif et entrer un montant');
      return;
    }
    
    const quantity = parseFloat(amount);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Erreur', 'Montant invalide');
      return;
    }

    try {
      if (tradeType === 'buy') {
        buyAsset(selectedAsset.id, quantity);
      } else {
        sellAsset(selectedAsset.id, quantity);
      }
      
      // 🎮 Déclencher la mise à jour de la gamification après le trade
      await triggerGamificationUpdate();
      
      setAmount('');
      Alert.alert('Succès', `${tradeType === 'buy' ? 'Achat' : 'Vente'} réalisé avec succès!`);
    } catch (error) {
      console.error('Erreur lors du trade:', error);
      Alert.alert('Erreur', 'Échec de la transaction');
    }
  };

  const maxBuy = selectedAsset 
    ? Math.floor(user.balance / selectedAsset.currentPrice * 100) / 100 
    : 0;

  return (
    <LinearGradient
      colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h2" color="text" weight="700">
            Trading
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Achetez et vendez vos cryptomonnaies
          </Typography>
        </View>

        {/* Balance Card */}
        <GlassCard style={styles.balanceCard} padding="lg">
          <View style={styles.balanceContent}>
            <Typography variant="body2" color="textSecondary">
              Solde disponible
            </Typography>
            <Typography variant="h2" color="text" weight="700">
              ${user?.balance?.toFixed(2) || '0.00'}
            </Typography>
          </View>
        </GlassCard>

        {/* Price Chart */}
        {selectedAsset && (
          <PriceChart
            data={[
              selectedAsset.currentPrice * 0.95,
              selectedAsset.currentPrice * 0.97,
              selectedAsset.currentPrice * 0.99,
              selectedAsset.currentPrice * 1.02,
              selectedAsset.currentPrice * 0.98,
              selectedAsset.currentPrice * 1.01,
              selectedAsset.currentPrice * 1.05,
              selectedAsset.currentPrice * 1.03,
              selectedAsset.currentPrice * 1.07,
              selectedAsset.currentPrice * 1.04,
              selectedAsset.currentPrice * 1.02,
              selectedAsset.currentPrice,
            ]}
            title={selectedAsset.symbol}
            currentPrice={selectedAsset.currentPrice}
            change24h={selectedAsset.change24h}
          />
        )}

        {/* Trade Type Selector */}
        <Card style={styles.tradeTypeCard} variant="glass" padding="sm">
          <View style={styles.tradeTypeTabs}>
            <TouchableOpacity
              style={[
                styles.tradeTypeTab,
                tradeType === 'buy' && { backgroundColor: theme.colors.success }
              ]}
              onPress={() => setTradeType('buy')}
            >
              <Typography 
                variant="body1" 
                color={tradeType === 'buy' ? 'white' : 'textSecondary'}
                weight="600"
              >
                Acheter
              </Typography>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tradeTypeTab,
                tradeType === 'sell' && { backgroundColor: theme.colors.error }
              ]}
              onPress={() => setTradeType('sell')}
            >
              <Typography 
                variant="body1" 
                color={tradeType === 'sell' ? 'white' : 'textSecondary'}
                weight="600"
              >
                Vendre
              </Typography>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Asset Selection */}
        <Card style={styles.assetCard} variant="elevated" padding="lg">
          <Typography variant="h3" color="text" weight="600" style={styles.sectionTitle}>
            Sélectionner un actif
          </Typography>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.assetScroll}>
            {assets.map((asset) => (
              <TouchableOpacity
                key={asset.id}
                style={[
                  styles.assetItem,
                  selectedAsset?.id === asset.id && {
                    backgroundColor: theme.colors.primary,
                  }
                ]}
                onPress={() => setSelectedAsset(asset)}
              >
                <View style={styles.assetInfo}>
                  <Typography
                    variant="body1"
                    color={selectedAsset?.id === asset.id ? 'white' : 'text'}
                    weight="600"
                  >
                    {asset.symbol}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={selectedAsset?.id === asset.id ? 'white' : 'textSecondary'}
                  >
                    {asset.name}
                  </Typography>
                  <Typography
                    variant="body1"
                    color={selectedAsset?.id === asset.id ? 'white' : 'text'}
                    weight="500"
                  >
                    ${asset.currentPrice?.toFixed(2)}
                  </Typography>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>

        {/* Selected Asset Details */}
        {selectedAsset && (
          <Card style={styles.selectedAssetCard} variant="gradient" padding="lg">
            <View style={styles.selectedAssetHeader}>
              <View>
                <Typography variant="h3" color="white" weight="700">
                  {selectedAsset.symbol}
                </Typography>
                <Typography variant="body1" color="white">
                  {selectedAsset.name}
                </Typography>
              </View>
              <View style={styles.priceContainer}>
                <Typography variant="h2" color="white" weight="700">
                  ${selectedAsset.currentPrice?.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="white">
                  +2.5% ↗
                </Typography>
              </View>
            </View>
          </Card>
        )}

        {/* Amount Input */}
        {selectedAsset && (
          <Card style={styles.inputCard} variant="default" padding="lg">
            <Typography variant="h4" color="text" weight="600" style={styles.inputLabel}>
              Montant ({tradeType === 'buy' ? 'USD' : selectedAsset.symbol})
            </Typography>
            
            <TextInput
              style={[styles.amountInput, { borderColor: theme.colors.border }]}
              value={amount}
              onChangeText={setAmount}
              placeholder={tradeType === 'buy' ? "0.00" : "0.0000"}
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textSecondary}
            />
            
            <View style={styles.quickAmounts}>
              {['25%', '50%', '75%', '100%'].map((percentage) => (
                <TouchableOpacity
                  key={percentage}
                  style={[styles.quickAmountBtn, { borderColor: theme.colors.primary }]}
                  onPress={() => {
                    const maxAmount = tradeType === 'buy' ? maxBuy : 1; // Simplified
                    const percent = parseInt(percentage) / 100;
                    setAmount((maxAmount * percent).toFixed(tradeType === 'buy' ? 2 : 4));
                  }}
                >
                  <Typography variant="caption" color="primary" weight="600">
                    {percentage}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>

            {tradeType === 'buy' && (
              <Typography variant="body2" color="textSecondary" style={styles.maxInfo}>
                Maximum: ${maxBuy.toFixed(2)}
              </Typography>
            )}
          </Card>
        )}

        {/* Trade Summary */}
        {selectedAsset && amount && (
          <GlassCard style={styles.summaryCard} padding="lg">
            <Typography variant="h4" color="text" weight="600" style={styles.summaryTitle}>
              Résumé de la transaction
            </Typography>
            
            <View style={styles.summaryRow}>
              <Typography variant="body1" color="textSecondary">
                {tradeType === 'buy' ? 'Vous achetez' : 'Vous vendez'}
              </Typography>
              <Typography variant="body1" color="text" weight="600">
                {tradeType === 'buy' 
                  ? `${(parseFloat(amount) / selectedAsset.currentPrice).toFixed(6)} ${selectedAsset.symbol}`
                  : `${parseFloat(amount)} ${selectedAsset.symbol}`
                }
              </Typography>
            </View>
            
            <View style={styles.summaryRow}>
              <Typography variant="body1" color="textSecondary">
                Prix unitaire
              </Typography>
              <Typography variant="body1" color="text" weight="600">
                ${selectedAsset.currentPrice.toFixed(2)}
              </Typography>
            </View>
            
            <View style={styles.summaryRow}>
              <Typography variant="body1" color="textSecondary">
                Total
              </Typography>
              <Typography variant="h4" color="text" weight="700">
                {tradeType === 'buy' 
                  ? `$${parseFloat(amount).toFixed(2)}`
                  : `$${(parseFloat(amount) * selectedAsset.currentPrice).toFixed(2)}`
                }
              </Typography>
            </View>
          </GlassCard>
        )}

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <Button
            title={selectedAsset && amount 
              ? `${tradeType === 'buy' ? 'Acheter' : 'Vendre'} ${selectedAsset.symbol}`
              : 'Sélectionner un actif'
            }
            onPress={handleTrade}
            variant="gradient"
            size="lg"
            fullWidth
            disabled={!selectedAsset || !amount}
          />
        </View>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <BottomTabBar />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    alignItems: 'center',
  },
  balanceCard: {
    marginBottom: 16,
  },
  balanceContent: {
    alignItems: 'center',
  },
  tradeTypeCard: {
    marginBottom: 16,
  },
  tradeTypeTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tradeTypeTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  assetCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  assetScroll: {
    paddingVertical: 8,
  },
  assetItem: {
    marginRight: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 120,
  },
  assetInfo: {
    alignItems: 'center',
    gap: 4,
  },
  selectedAssetCard: {
    marginBottom: 16,
  },
  selectedAssetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  inputCard: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 12,
  },
  amountInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickAmountBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  maxInfo: {
    textAlign: 'center',
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryTitle: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionContainer: {
    marginBottom: 100,
  },
});

export default TradingScreen;
