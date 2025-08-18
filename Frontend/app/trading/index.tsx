import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Typography, Card, Button, GlassCard, PriceChart } from '../../src/components/ui';
import { useTheme } from '../../src/config/theme';
import { useTrading } from '../../src/contexts/TradingContext';
import { useGamification } from '../../src/contexts/GamificationContext';
import { Asset } from '../../src/types';
import { showToast } from '../../src/services/toast';
import { formatCurrency } from '../../src/config/currency';
import { useCurrency } from '../../src/contexts/CurrencyContext';
import { ResponsiveScreenWrapper } from '../../src/components/responsive/ResponsiveScreenWrapper';

const TradingScreen = () => {
  const theme = useTheme();
  const { assets, user, buyAsset, sellAsset } = useTrading();
  const { triggerGamificationUpdate } = useGamification();
  const { format, symbol } = useCurrency();
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

    // Additional validation for sell orders
    if (tradeType === 'sell') {
      const portfolioItem = user.portfolio.find(p => p.assetId === selectedAsset.id);
      if (!portfolioItem) {
        Alert.alert('Erreur', 'Vous ne possédez pas cet actif dans votre portefeuille');
        return;
      }
      if (portfolioItem.quantity < quantity) {
        Alert.alert('Erreur', `Quantité insuffisante. Vous possédez ${portfolioItem.quantity} ${selectedAsset.symbol}, mais tentez de vendre ${quantity}`);
        return;
      }
    }

    try {
      if (tradeType === 'buy') {
        await buyAsset(selectedAsset.id, quantity);
      } else {
        await sellAsset(selectedAsset.id, quantity);
      }
      
      // 🎮 Déclencher la mise à jour de la gamification après le trade
      await triggerGamificationUpdate();
      
      setAmount('');
      showToast.success('Transaction réussie', `${tradeType === 'buy' ? 'Achat' : 'Vente'} de ${selectedAsset.symbol}`);
      Alert.alert('Succès', `${tradeType === 'buy' ? 'Achat' : 'Vente'} réalisé avec succès!`);
    } catch (error: any) {
      console.error('Erreur lors du trade:', error);
      const errorMessage = error?.message || 'Erreur inconnue';
      showToast.error('Échec de la transaction', errorMessage);
      Alert.alert('Erreur', errorMessage);
  Alert.alert('Erreur', 'Échec de la transaction');
    }
  };

  const maxBuy = selectedAsset 
    ? Math.floor(user.balance / selectedAsset.currentPrice * 100) / 100 
    : 0;
    
  const portfolioQuantity = selectedAsset 
    ? (user.portfolio.find(p => p.assetId === selectedAsset.id)?.quantity || 0)
    : 0;

  return (
    <ResponsiveScreenWrapper showBottomTabs={true}>
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
              {formatCurrency(user?.balance ?? 0)}
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
                { marginLeft: 8 },
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
                  { marginRight: 12 },
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
                    {formatCurrency(asset.currentPrice)}
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
                {/* Portfolio quantity display */}
                {(() => {
                  const portfolioItem = user.portfolio.find(p => p.assetId === selectedAsset.id);
                  const quantity = portfolioItem?.quantity || 0;
                  return (
                    <Typography variant="body2" color="white" style={{ opacity: 0.8, marginTop: 4 }}>
                      Possédé: {quantity.toFixed(4)} {selectedAsset.symbol}
                    </Typography>
                  );
                })()}
              </View>
              <View style={styles.priceContainer}>
                <Typography variant="h2" color="white" weight="700">
                  {format(selectedAsset.currentPrice)}
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
              Habetsahana ({tradeType === 'buy' ? symbol : selectedAsset.symbol})
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
                  style={[styles.quickAmountBtn, { borderColor: theme.colors.primary, marginRight: 8 }]}
                  onPress={() => {
                    const maxAmount = tradeType === 'buy' ? maxBuy : portfolioQuantity;
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
                  Ambony indrindra: {format(maxBuy)}
                </Typography>
              )}
              
              {tradeType === 'sell' && (
                <Typography variant="body2" color="textSecondary" style={styles.maxInfo}>
                  Maximum: {portfolioQuantity.toFixed(4)} {selectedAsset?.symbol}
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
              <Typography variant="body1" color="textSecondary">Vidiny isanisany</Typography>
              <Typography variant="body1" color="text" weight="600">{format(selectedAsset.currentPrice)}</Typography>
            </View>
            
            <View style={styles.summaryRow}>
              <Typography variant="body1" color="textSecondary">Totaly</Typography>
              <Typography variant="h4" color="text" weight="700">
                {tradeType === 'buy'
                  ? format(parseFloat(amount))
                  : format(parseFloat(amount) * selectedAsset.currentPrice)}
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
    </ResponsiveScreenWrapper>
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
  // Replace gap with spacing via margins
  // gap is not fully supported on react-native-web
  // We'll simulate by adding marginRight on children
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
  // Simulate gap with margins where needed
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
  // Simulate gap via margins
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
