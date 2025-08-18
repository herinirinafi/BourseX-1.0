import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { authService } from '../services/authService';
import { Typography, Card, Button } from '../components/ui';
import { useTheme } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { ResponsiveScreenWrapper } from '../components/responsive/ResponsiveScreenWrapper';
import LoadingSpinner from '../components/LoadingSpinner';
import { showToast } from '../services/toast';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    staff: number;
    new_this_week: number;
    avg_level: number;
    avg_balance: number;
    total_balance: number;
  };
  trading: {
    total_stocks: number;
    total_transactions: number;
    recent_transactions: number;
  };
  gamification: {
    total_missions: number;
    active_missions: number;
  };
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  userprofile?: {
    balance: number;
    level: number;
    xp: number;
    total_trades: number;
    successful_trades: number;
    trading_score: number;
  };
}

interface Stock {
  id: number;
  symbol: string;
  name: string;
  current_price: number;
  sector: string;
  volume: number;
  market_cap: number;
}

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_active: true,
    is_staff: false,
  });
  const [newStockData, setNewStockData] = useState({
    symbol: '',
    name: '',
    current_price: '',
    sector: '',
    volume: '',
    market_cap: '',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats
      console.log('Loading dashboard stats...');
      const statsResponse = await authService.apiCall('/admin/dashboard-stats/');
      console.log('Stats response:', statsResponse);
      setStats(statsResponse);
      
      // Load users
      console.log('Loading users...');
      const usersResponse = await authService.apiCall('/admin/users/');
      console.log('Users response:', usersResponse);
      setUsers(usersResponse.results || usersResponse);
      
      // Load stocks
      console.log('Loading stocks...');
      const stocksResponse = await authService.apiCall('/admin/stocks/');
      console.log('Stocks response:', stocksResponse);
      setStocks(stocksResponse.results || stocksResponse);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleBulkPriceUpdate = async () => {
    try {
      Alert.alert(
        'Update Stock Prices',
        'This will update all stock prices with random fluctuations. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Update',
            onPress: async () => {
              const response = await authService.apiCall('/admin/stocks/bulk_update_prices/', {
                method: 'POST',
              });
              Alert.alert('Success', response.message);
              await loadDashboardData();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error updating prices:', error);
      Alert.alert('Error', 'Failed to update stock prices');
    }
  };

  const handleMarketSimulation = async (type: string) => {
    try {
      const response = await authService.apiCall('/admin/market-simulation/', {
        method: 'POST',
        body: JSON.stringify({
          type,
          intensity: 0.1, // 10% intensity
        }),
      });
      Alert.alert('Success', response.message);
      await loadDashboardData();
    } catch (error) {
      console.error('Error in market simulation:', error);
      Alert.alert('Error', 'Failed to simulate market event');
    }
  };

  const handleUserAction = async (userId: number, action: string) => {
    try {
      let endpoint = '';
      
      switch (action) {
        case 'toggle_active':
          endpoint = `/admin/users/${userId}/toggle_active/`;
          break;
        case 'toggle_staff':
          endpoint = `/admin/users/${userId}/toggle_staff/`;
          break;
        case 'reset_password':
          endpoint = `/admin/users/${userId}/reset_password/`;
          break;
        default:
          return;
      }
      
      const response = await authService.apiCall(endpoint, { method: 'POST' });
      Alert.alert('Success', response.message);
      await loadDashboardData();
    } catch (error) {
      console.error('Error in user action:', error);
      Alert.alert('Error', 'Failed to perform action');
    }
  };

  const handleCreateUser = async () => {
    try {
      await authService.apiCall('/admin/users/', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      });
      Alert.alert('Success', 'User created successfully');
      setShowUserModal(false);
      setNewUserData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        is_active: true,
        is_staff: false,
      });
      await loadDashboardData();
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Failed to create user');
    }
  };

  const handleCreateStock = async () => {
    try {
      const stockData = {
        ...newStockData,
        current_price: parseFloat(newStockData.current_price),
        volume: parseInt(newStockData.volume),
        market_cap: parseFloat(newStockData.market_cap),
      };
      
      await authService.apiCall('/admin/stocks/', {
        method: 'POST',
        body: JSON.stringify(stockData),
      });
      Alert.alert('Success', 'Stock created successfully');
      setShowStockModal(false);
      setNewStockData({
        symbol: '',
        name: '',
        current_price: '',
        sector: '',
        volume: '',
        market_cap: '',
      });
      await loadDashboardData();
    } catch (error) {
      console.error('Error creating stock:', error);
      Alert.alert('Error', 'Failed to create stock');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            logout();
            showToast.success('Déconnexion', 'À bientôt !');
            router.replace('/login' as any);
          },
        },
      ]
    );
  };

  const renderDashboardStats = () => (
    <View style={styles.statsContainer}>
      <Typography variant="h2" weight="700" style={styles.sectionTitle}>
        🛠️ Administration Dashboard
      </Typography>
      
      {stats && stats.users && stats.trading && stats.gamification ? (
        <>
          <View style={styles.statsGrid}>
            <Card variant="default" style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={styles.statIcon}>👥</Text>
                <Typography variant="h3" color="primary" weight="700">
                  {stats.users.total}
                </Typography>
                <Typography variant="body2" color="text">
                  Total Users
                </Typography>
                <Typography variant="caption" color="textSecondary" style={styles.statSubtext}>
                  {stats.users.active} active
                </Typography>
              </View>
            </Card>
            
            <Card variant="default" style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={styles.statIcon}>📈</Text>
                <Typography variant="h3" color="primary" weight="700">
                  {stats.trading.total_stocks}
                </Typography>
                <Typography variant="body2" color="text">
                  Total Stocks
                </Typography>
                <Typography variant="caption" color="textSecondary" style={styles.statSubtext}>
                  {stats.trading.recent_transactions} recent trades
                </Typography>
              </View>
            </Card>
            
            <Card variant="default" style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={styles.statIcon}>🎯</Text>
                <Typography variant="h3" color="primary" weight="700">
                  {stats.gamification.total_missions}
                </Typography>
                <Typography variant="body2" color="text">
                  Total Missions
                </Typography>
                <Typography variant="caption" color="textSecondary" style={styles.statSubtext}>
                  {stats.gamification.active_missions} active
                </Typography>
              </View>
            </Card>
            
            <Card variant="default" style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={styles.statIcon}>💰</Text>
                <Typography variant="h3" color="primary" weight="700">
                  {stats.users.total_balance.toFixed(0)} MGA
                </Typography>
                <Typography variant="body2" color="text">
                  Total Balance
                </Typography>
                <Typography variant="caption" color="textSecondary" style={styles.statSubtext}>
                  Avg: {stats.users.avg_balance.toFixed(0)} MGA
                </Typography>
              </View>
            </Card>
          </View>
          
          <View style={styles.actionButtonsGrid}>
            <Button
              variant="primary"
              onPress={handleBulkPriceUpdate}
              title="🔄 Update Prices"
            />
            
            <Button
              variant="primary"
              onPress={() => handleMarketSimulation('bull_market')}
              title="📈 Bull Market"
            />
            
            <Button
              variant="primary"
              onPress={() => handleMarketSimulation('bear_market')}
              title="📉 Bear Market"
            />
          </View>
        </>
      ) : (
        <Card variant="default" style={styles.noDataCard}>
          <Typography variant="body1" style={styles.noDataText}>
            No dashboard data available
          </Typography>
        </Card>
      )}
    </View>
  );

  const renderUserManagement = () => (
    <View style={styles.managementContainer}>
      <View style={styles.sectionHeader}>
        <Typography variant="h3" weight="700">
          👥 User Management
        </Typography>
        <Button
          variant="primary"
          onPress={() => setShowUserModal(true)}
          title="➕ Add User"
          style={styles.addButton}
        />
      </View>
      
      <ScrollView style={styles.listContainer}>
        {users.map((user) => (
          <Card key={user.id} variant="default" style={styles.userCard}>
            <View style={styles.userInfo}>
              <Typography variant="h4" weight="600">
                {user.username}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user.email}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Level: {user.userprofile?.level || 0} | 
                Balance: {user.userprofile?.balance || 0} MGA
              </Typography>
            </View>
            
            <View style={styles.userActions}>
              <Button
                variant={user.is_active ? "primary" : "secondary"}
                size="sm"
                onPress={() => handleUserAction(user.id, 'toggle_active')}
                title={user.is_active ? 'Active' : 'Inactive'}
              />
              
              <Button
                variant={user.is_staff ? "primary" : "secondary"}
                size="sm"
                onPress={() => handleUserAction(user.id, 'toggle_staff')}
                title={user.is_staff ? 'Staff' : 'User'}
              />
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  const renderStockManagement = () => (
    <View style={styles.managementContainer}>
      <View style={styles.sectionHeader}>
        <Typography variant="h3" weight="700">
          📈 Stock Management
        </Typography>
        <Button
          variant="primary"
          onPress={() => setShowStockModal(true)}
          title="➕ Add Stock"
          style={styles.addButton}
        />
      </View>
      
      <ScrollView style={styles.listContainer}>
        {stocks.map((stock) => (
          <Card key={stock.id} variant="default" style={styles.stockCard}>
            <View style={styles.stockInfo}>
              <Typography variant="h4" weight="600">
                {stock.symbol}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {stock.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {stock.sector}
              </Typography>
            </View>
            
            <View style={styles.stockDetails}>
              <Typography variant="h4" color="success" weight="700">
                {stock.current_price} MGA
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Vol: {stock.volume}
              </Typography>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <ResponsiveScreenWrapper showBottomTabs={false}>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
            <Typography variant="body1" color="textSecondary" style={{ marginTop: 16 }}>
              Loading admin dashboard...
            </Typography>
          </View>
        </View>
      </ResponsiveScreenWrapper>
    );
  }

  return (
    <ResponsiveScreenWrapper showBottomTabs={false}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Ionicons name="grid" size={20} color={activeTab === 'dashboard' ? '#007AFF' : '#8E8E93'} />
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Ionicons name="people" size={20} color={activeTab === 'users' ? '#007AFF' : '#8E8E93'} />
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Users
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stocks' && styles.activeTab]}
          onPress={() => setActiveTab('stocks')}
        >
          <Ionicons name="trending-up" size={20} color={activeTab === 'stocks' ? '#007AFF' : '#8E8E93'} />
          <Text style={[styles.tabText, activeTab === 'stocks' && styles.activeTabText]}>
            Stocks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'dashboard' && renderDashboardStats()}
        {activeTab === 'users' && renderUserManagement()}
        {activeTab === 'stocks' && renderStockManagement()}
      </ScrollView>

      {/* User Creation Modal */}
      <Modal visible={showUserModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New User</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={newUserData.username}
              onChangeText={(text) => setNewUserData({ ...newUserData, username: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={newUserData.email}
              onChangeText={(text) => setNewUserData({ ...newUserData, email: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={newUserData.first_name}
              onChangeText={(text) => setNewUserData({ ...newUserData, first_name: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={newUserData.last_name}
              onChangeText={(text) => setNewUserData({ ...newUserData, last_name: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={newUserData.password}
              onChangeText={(text) => setNewUserData({ ...newUserData, password: text })}
              secureTextEntry
            />
            
            <View style={styles.switchContainer}>
              <Text>Is Active:</Text>
              <Switch
                value={newUserData.is_active}
                onValueChange={(value) => setNewUserData({ ...newUserData, is_active: value })}
              />
            </View>
            
            <View style={styles.switchContainer}>
              <Text>Is Staff:</Text>
              <Switch
                value={newUserData.is_staff}
                onValueChange={(value) => setNewUserData({ ...newUserData, is_staff: value })}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowUserModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateUser}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Stock Creation Modal */}
      <Modal visible={showStockModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Stock</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Symbol (e.g., AAPL)"
              value={newStockData.symbol}
              onChangeText={(text) => setNewStockData({ ...newStockData, symbol: text.toUpperCase() })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Company Name"
              value={newStockData.name}
              onChangeText={(text) => setNewStockData({ ...newStockData, name: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Current Price (MGA)"
              value={newStockData.current_price}
              onChangeText={(text) => setNewStockData({ ...newStockData, current_price: text })}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Sector"
              value={newStockData.sector}
              onChangeText={(text) => setNewStockData({ ...newStockData, sector: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Volume"
              value={newStockData.volume}
              onChangeText={(text) => setNewStockData({ ...newStockData, volume: text })}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Market Cap (MGA)"
              value={newStockData.market_cap}
              onChangeText={(text) => setNewStockData({ ...newStockData, market_cap: text })}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowStockModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateStock}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </ResponsiveScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  logoutText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  actionButtonsGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonText: {
    marginLeft: 8,
  },
  noDataCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    margin: 16,
  },
  managementContainer: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  userCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userDetails: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  stockCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stockName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  stockSector: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  stockDetails: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
  },
  stockVolume: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default AdminDashboard;