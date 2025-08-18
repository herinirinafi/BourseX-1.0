import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui';
import { adminService } from '../../services/admin/adminService';

interface Stock {
  id: number;
  symbol: string;
  name: string;
  current_price: number;
  volume: number;
  last_updated: string;
}

const StockCard: React.FC<{
  stock: Stock;
  onEdit: (stock: Stock) => void;
  onPrice: (stock: Stock) => void;
  onDelete: (stock: Stock) => void;
}> = ({ stock, onEdit, onPrice, onDelete }) => {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatVolume = (volume: number) => volume.toLocaleString();
  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  return (
    <View style={styles.stockCard}>
      <LinearGradient
        colors={['#4facfe', '#00f2fe']}
        style={styles.stockCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.stockHeader}>
          <View style={styles.stockInfo}>
            <Typography variant="h3" color="white" weight="700">
              {stock.symbol}
            </Typography>
            <Typography variant="body2" color="white" style={styles.stockName}>
              {stock.name}
            </Typography>
          </View>
          <View style={styles.stockPrice}>
            <Typography variant="h3" color="white" weight="700">
              {formatPrice(stock.current_price)}
            </Typography>
          </View>
        </View>

        <View style={styles.stockStats}>
          <View style={styles.statItem}>
            <Typography variant="caption" color="white">Volume</Typography>
            <Typography variant="body2" color="white" weight="600">
              {formatVolume(stock.volume)}
            </Typography>
          </View>
          <View style={styles.statItem}>
            <Typography variant="caption" color="white">Mis à jour</Typography>
            <Typography variant="body2" color="white" weight="600">
              {formatDate(stock.last_updated)}
            </Typography>
          </View>
        </View>

        <View style={styles.stockActions}>
          <TouchableOpacity onPress={() => onEdit(stock)} style={styles.actionButton}>
            <Ionicons name="create" size={16} color="white" />
            <Typography variant="caption" color="white" style={styles.actionText}>Éditer</Typography>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onPrice(stock)} style={styles.actionButton}>
            <Ionicons name="trending-up" size={16} color="white" />
            <Typography variant="caption" color="white" style={styles.actionText}>Prix</Typography>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(stock)} style={[styles.actionButton, styles.deleteButton]}>
            <Ionicons name="trash" size={16} color="white" />
            <Typography variant="caption" color="white" style={styles.actionText}>Suppr.</Typography>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const StockModal: React.FC<{
  visible: boolean;
  stock: Stock | null;
  isEditing: boolean;
  onClose: () => void;
  onSubmit: (stockData: Partial<Stock>) => void;
}> = ({ visible, stock, isEditing, onClose, onSubmit }) => {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [volume, setVolume] = useState('');

  useEffect(() => {
    if (stock && isEditing) {
      setSymbol(stock.symbol);
      setName(stock.name);
      setPrice(stock.current_price.toString());
      setVolume(stock.volume.toString());
    } else {
      setSymbol('');
      setName('');
      setPrice('');
      setVolume('');
    }
  }, [stock, isEditing, visible]);

  const handleSubmit = () => {
    if (!symbol.trim() || !name.trim() || !price.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    onSubmit({
      symbol: symbol.toUpperCase(),
      name: name.trim(),
      current_price: parseFloat(price),
      volume: parseInt(volume) || 0,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Typography variant="h3" style={styles.modalTitle}>
            {isEditing ? `Éditer ${stock?.symbol}` : 'Nouveau Stock'}
          </Typography>
          
          <TextInput
            style={styles.input}
            value={symbol}
            onChangeText={setSymbol}
            placeholder="Symbole (ex: BTC, ETH)"
            autoCapitalize="characters"
          />

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nom complet"
          />

          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Prix initial"
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            value={volume}
            onChangeText={setVolume}
            placeholder="Volume (optionnel)"
            keyboardType="numeric"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose} style={[styles.modalButton, styles.cancelButton]}>
              <Typography variant="body2" color="white">Annuler</Typography>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.modalButton, styles.confirmButton]}
            >
              <Typography variant="body2" color="white">
                {isEditing ? 'Modifier' : 'Créer'}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const PriceModal: React.FC<{
  visible: boolean;
  stock: Stock | null;
  onClose: () => void;
  onSubmit: (price: number) => void;
}> = ({ visible, stock, onClose, onSubmit }) => {
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (stock) {
      setPrice(stock.current_price.toString());
    }
  }, [stock, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Typography variant="h3" style={styles.modalTitle}>
            Changer Prix - {stock?.symbol}
          </Typography>
          
          <Typography variant="body1" style={styles.currentPrice}>
            Prix actuel: ${stock?.current_price.toFixed(2)}
          </Typography>
          
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Nouveau prix"
            keyboardType="numeric"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose} style={[styles.modalButton, styles.cancelButton]}>
              <Typography variant="body2" color="white">Annuler</Typography>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const newPrice = parseFloat(price);
                if (newPrice > 0) {
                  onSubmit(newPrice);
                  onClose();
                } else {
                  Alert.alert('Erreur', 'Prix invalide');
                }
              }}
              style={[styles.modalButton, styles.confirmButton]}
            >
              <Typography variant="body2" color="white">Confirmer</Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function AdminStocks() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const loadStocks = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response: any = await adminService.getStocks(1, searchText);
      setStocks(response.results || []);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les stocks');
    } finally {
      setLoading(false);
    }
  }, [loading, searchText]);

  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  const handleCreateStock = async (stockData: Partial<Stock>) => {
    try {
      await adminService.createStock(stockData);
      Alert.alert('Succès', 'Stock créé avec succès');
      loadStocks();
    } catch {
      Alert.alert('Erreur', 'Impossible de créer le stock');
    }
  };

  const handleUpdateStock = async (stockData: Partial<Stock>) => {
    if (!selectedStock) return;

    try {
      await adminService.updateStock(selectedStock.id, stockData);
      Alert.alert('Succès', 'Stock mis à jour avec succès');
      loadStocks();
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le stock');
    }
  };

  const handlePriceUpdate = async (price: number) => {
    if (!selectedStock) return;

    try {
      await adminService.setStockPrice(selectedStock.id, price);
      Alert.alert('Succès', `Prix de ${selectedStock.symbol} mis à jour`);
      loadStocks();
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le prix');
    }
  };

  const handleDeleteStock = async (stock: Stock) => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer ${stock.symbol}?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteStock(stock.id);
              Alert.alert('Succès', 'Stock supprimé');
              loadStocks();
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer le stock');
            }
          },
        },
      ]
    );
  };

  const handleBulkPriceUpdate = async () => {
    Alert.alert(
      'Mise à jour des prix',
      'Voulez-vous mettre à jour tous les prix aléatoirement?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              await adminService.bulkUpdatePrices();
              Alert.alert('Succès', 'Tous les prix ont été mis à jour');
              loadStocks();
            } catch {
              Alert.alert('Erreur', 'Impossible de mettre à jour les prix');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h2" color="white" weight="700">
            📈 Gestion Stocks
          </Typography>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => {
                setSelectedStock(null);
                setIsEditing(false);
                setStockModalVisible(true);
              }}
              style={styles.addButton}
            >
              <Ionicons name="add" size={20} color="white" />
              <Typography variant="caption" color="white">Nouveau</Typography>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleBulkPriceUpdate}
              style={styles.updateButton}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Typography variant="caption" color="white">Prix</Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher stocks..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#888"
            />
          </View>
        </View>

        {/* Stocks List */}
        <FlatList
          data={stocks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <StockCard
              stock={item}
              onEdit={(stock) => {
                setSelectedStock(stock);
                setIsEditing(true);
                setStockModalVisible(true);
              }}
              onPrice={(stock) => {
                setSelectedStock(stock);
                setPriceModalVisible(true);
              }}
              onDelete={handleDeleteStock}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />

        {/* Modals */}
        <StockModal
          visible={stockModalVisible}
          stock={selectedStock}
          isEditing={isEditing}
          onClose={() => setStockModalVisible(false)}
          onSubmit={isEditing ? handleUpdateStock : handleCreateStock}
        />

        <PriceModal
          visible={priceModalVisible}
          stock={selectedStock}
          onClose={() => setPriceModalVisible(false)}
          onSubmit={handlePriceUpdate}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: 'white',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  stockCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  stockCardGradient: {
    padding: 16,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    opacity: 0.8,
    marginTop: 4,
  },
  stockPrice: {
    alignItems: 'flex-end',
  },
  stockStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  stockActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(244,67,54,0.8)',
  },
  actionText: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  currentPrice: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#888',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
});
