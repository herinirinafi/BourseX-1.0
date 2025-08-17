import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Card, GlassCard } from '../../src/components/ui';
import { BottomTabBar } from '../../src/components/navigation/BottomTabBar';
import { useTheme } from '../../src/config/theme';
import { useTrading } from '../../src/contexts/TradingContext';
import { Asset } from '../../src/types';

export default function SearchScreen() {
  const theme = useTheme();
  const { assets } = useTrading();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tous', icon: '🌟' },
    { id: 'trending', name: 'Tendance', icon: '🔥' },
    { id: 'gainers', name: 'Gagnants', icon: '📈' },
    { id: 'losers', name: 'Perdants', icon: '📉' },
  ];

  const filteredAssets = useMemo(() => {
    let filtered = assets;

    // Filtrer par recherche
    if (searchText.trim()) {
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(searchText.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filtrer par catégorie
    switch (selectedCategory) {
      case 'trending':
        // Actifs les plus volatils
        filtered = filtered.filter(asset => Math.abs(asset.change24h) > 5);
        break;
      case 'gainers':
        filtered = filtered.filter(asset => asset.change24h > 0)
          .sort((a, b) => b.change24h - a.change24h);
        break;
      case 'losers':
        filtered = filtered.filter(asset => asset.change24h < 0)
          .sort((a, b) => a.change24h - b.change24h);
        break;
    }

    return filtered;
  }, [assets, searchText, selectedCategory]);

  const renderAsset = ({ item }: { item: Asset }) => (
    <TouchableOpacity style={styles.assetItem}>
      <GlassCard style={styles.assetCard} padding="md">
        <View style={styles.assetInfo}>
          <View style={styles.assetIcon}>
            <Typography variant="h4" color="white">
              {item.symbol === 'BTC' ? '₿' : item.symbol === 'ETH' ? 'Ξ' : item.symbol.charAt(0)}
            </Typography>
          </View>
          <View style={styles.assetDetails}>
            <Typography variant="h5" color="text" weight="600">
              {item.symbol}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {item.name}
            </Typography>
          </View>
        </View>
        <View style={styles.assetPricing}>
          <Typography variant="h5" color="text" weight="600">
            ${item.currentPrice.toFixed(2)}
          </Typography>
          <Typography 
            variant="caption" 
            color={item.change24h >= 0 ? 'success' : 'error'}
            weight="500"
          >
            {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
          </Typography>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h2" color="text" weight="700">
            Recherche
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Découvrez les cryptomonnaies
          </Typography>
        </View>

        {/* Search Bar */}
        <GlassCard style={styles.searchCard} padding="md">
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              onChangeText={setSearchText}
              value={searchText}
              placeholder="Rechercher une crypto..."
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </GlassCard>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
            >
              <Typography variant="body2" color="white">
                {category.icon}
              </Typography>
              <Typography 
                variant="caption" 
                color="white" 
                weight={selectedCategory === category.id ? "600" : "400"}
              >
                {category.name}
              </Typography>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results */}
        <View style={styles.resultsContainer}>
          <Typography variant="h4" color="text" weight="600" style={styles.resultsTitle}>
            {filteredAssets.length} résultat{filteredAssets.length > 1 ? 's' : ''}
          </Typography>
          
          <FlatList
            data={filteredAssets}
            renderItem={renderAsset}
            keyExtractor={item => item.id}
            style={styles.assetsList}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomTabBar />
    </LinearGradient>
  );
}

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
  searchCard: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoryButton: {
    backgroundColor: 'rgba(0, 212, 255, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: '#00D4FF',
  },
  resultsContainer: {
    marginBottom: 100,
  },
  resultsTitle: {
    marginBottom: 16,
  },
  assetsList: {
    gap: 12,
  },
  assetItem: {
    marginBottom: 8,
  },
  assetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assetIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0D1421',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetDetails: {
    gap: 2,
  },
  assetPricing: {
    alignItems: 'flex-end',
    gap: 2,
  },
});
