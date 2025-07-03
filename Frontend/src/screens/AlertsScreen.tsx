import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlerts } from '../contexts/AlertsContext';
import { useStocks } from '../contexts/StocksContext';

type AlertsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StockDetail'>;

const AlertsScreen = () => {
  const navigation = useNavigation<AlertsScreenNavigationProp>();
  const { alerts, toggleAlert, removeAlert, checkAlerts } = useAlerts();
  const { stocks, loading: stocksLoading } = useStocks();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'triggered'>('active');

  // Filter alerts based on active tab
  const filteredAlerts = alerts.filter(alert => 
    activeTab === 'active' ? !alert.triggered : alert.triggered
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await checkAlerts();
    } catch (error) {
      console.error('Error refreshing alerts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleAlert = async (alertId: string) => {
    try {
      await toggleAlert(alertId);
    } catch (error) {
      console.error('Error toggling alert:', error);
      Alert.alert('Error', 'Failed to update alert');
    }
  };

  const handleDeleteAlert = (alertId: string) => {
    Alert.alert(
      'Delete Alert',
      'Are you sure you want to delete this alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await removeAlert(alertId);
            } catch (error) {
              console.error('Error deleting alert:', error);
              Alert.alert('Error', 'Failed to delete alert');
            }
          } 
        },
      ]
    );
  };

  const getStockName = (stockId: number) => {
    const stock = stocks.find(s => s.id === stockId);
    return stock ? `${stock.symbol} - ${stock.name}` : 'Unknown Stock';
  };

  const renderAlertItem = ({ item }: { item: any }) => (
    <View style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <Text style={styles.stockName} numberOfLines={1}>
          {getStockName(item.stockId)}
        </Text>
        <View style={styles.alertActions}>
          <Switch
            value={!item.triggered && item.enabled}
            onValueChange={() => handleToggleAlert(item.id)}
            disabled={item.triggered}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={item.enabled && !item.triggered ? '#007AFF' : '#f4f3f4'}
          />
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteAlert(item.id)}
          >
            <MaterialIcons name="delete-outline" size={22} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.alertDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Condition:</Text>
          <Text style={styles.detailValue}>
            {item.condition === 'above' ? 'Price above' : 'Price below'} ${item.targetPrice.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Current Price:</Text>
          <Text style={styles.detailValue}>
            ${item.currentPrice ? item.currentPrice.toFixed(2) : 'N/A'}
          </Text>
        </View>
        
        {item.triggered && (
          <View style={styles.triggeredBadge}>
            <MaterialIcons name="notifications-active" size={16} color="white" />
            <Text style={styles.triggeredText}>Triggered</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.alertDate}>
        Created: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  if (stocksLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active Alerts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'triggered' && styles.activeTab]}
          onPress={() => setActiveTab('triggered')}
        >
          <View style={styles.tabWithBadge}>
            <Text style={[styles.tabText, activeTab === 'triggered' && styles.activeTabText]}>
              Triggered
            </Text>
            {alerts.some(a => a.triggered) && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {alerts.filter(a => a.triggered).length}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAlerts}
        renderItem={renderAlertItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.alertsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons 
              name={activeTab === 'active' ? 'notifications-none' : 'notifications-off'} 
              size={64} 
              color="#CCCCCC" 
            />
            <Text style={styles.emptyText}>
              {activeTab === 'active' 
                ? 'No active alerts' 
                : 'No triggered alerts'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'active'
                ? 'Create alerts to get notified about price changes'
                : 'Your triggered alerts will appear here'}
            </Text>
            
            {activeTab === 'active' && (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('Stocks')}
              >
                <MaterialIcons name="add-alert" size={20} color="white" />
                <Text style={styles.addButtonText}>Create Alert</Text>
              </TouchableOpacity>
            )}
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF10',
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertsList: {
    padding: 16,
    paddingTop: 8,
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  alertActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
  alertDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  triggeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  triggeredText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  alertDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
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
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AlertsScreen;
