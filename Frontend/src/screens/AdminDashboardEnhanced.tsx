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
import { useRouter } from 'expo-router';
import { authService } from '../services/authService';
import { Typography, Card, Button } from '../components/ui';
import { useTheme } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { ResponsiveScreenWrapper } from '../components/responsive/ResponsiveScreenWrapper';
import LoadingSpinner from '../components/LoadingSpinner';
import { showToast } from '../services/toast';

// Enhanced interfaces for comprehensive admin functionality
interface DashboardStats {
  user_stats: {
    total_users: number;
    active_users: number;
    new_users_week: number;
    avg_balance: number;
  };
  trading_stats: {
    total_transactions: number;
    total_volume: number;
    recent_transactions: number;
  };
  gamification_stats: {
    total_badges: number;
    total_missions: number;
    active_missions: number;
    recent_badges: number;
  };
  top_performers?: {
    top_traders: any[];
    top_levels: any[];
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
  last_login?: string;
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
  price_change: number;
  price_change_percent: number;
  last_updated: string;
}

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  
  // State management
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  
  // Form data
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

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats
      const statsResponse = await authService.apiCall('/admin/dashboard-stats/');
      setStats(statsResponse);
      
      // Load users
      const usersResponse = await authService.apiCall('/admin/users/');
      setUsers(usersResponse.results || usersResponse);
      
      // Load stocks
      const stocksResponse = await authService.apiCall('/admin/stocks/');
      setStocks(stocksResponse.results || stocksResponse);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showToast.error('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // CRUD Operations
  const handleUserAction = async (userId: number, action: string) => {
    try {
      let endpoint = '';
      let method = 'POST';
      
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
        case 'delete':
          endpoint = `/admin/users/${userId}/`;
          method = 'DELETE';
          break;
        default:
          return;
      }
      
      if (action === 'delete') {
        Alert.alert(
          'Confirm Delete',
          'Are you sure you want to delete this user?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                await authService.apiCall(endpoint, { method });
                showToast.success('Success', 'User deleted successfully');
                await loadDashboardData();
              },
            },
          ]
        );
      } else {
        const response = await authService.apiCall(endpoint, { method });
        showToast.success('Success', response.message || 'Action completed');
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error in user action:', error);
      showToast.error('Error', 'Failed to perform action');
    }
  };

  const handleCreateUser = async () => {
    try {
      await authService.apiCall('/admin/users/', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      });
      showToast.success('Success', 'User created successfully');
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
      showToast.error('Error', 'Failed to create user');
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
      showToast.success('Success', 'Stock created successfully');
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
      showToast.error('Error', 'Failed to create stock');
    }
  };

  // Bulk operations
  const handleBulkActions = async (action: string) => {
    try {
      await authService.apiCall('/admin/bulk-actions/', {
        method: 'POST',
        body: JSON.stringify({
          action,
          item_ids: selectedItems,
          item_type: activeTab,
        }),
      });
      showToast.success('Success', 'Bulk action completed');
      setSelectedItems([]);
      setShowBulkActionsModal(false);
      await loadDashboardData();
    } catch (error) {
      console.error('Error in bulk action:', error);
      showToast.error('Error', 'Failed to perform bulk action');
    }
  };

  // Market simulation
  const handleMarketSimulation = async (type: string) => {
    try {
      const response = await authService.apiCall('/admin/market-simulation/', {
        method: 'POST',
        body: JSON.stringify({ type, intensity: 0.1 }),
      });
      showToast.success('Success', response.message);
      await loadDashboardData();
    } catch (error) {
      console.error('Error in market simulation:', error);
      showToast.error('Error', 'Failed to simulate market event');
    }
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
              showToast.success('Success', response.message);
              await loadDashboardData();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error updating prices:', error);
      showToast.error('Error', 'Failed to update stock prices');
    }
  };

  // Chart component for analytics
  const renderMiniChart = (data: number[], color: string = '#007AFF', height: number = 60) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    return (
      <View style={[styles.chartContainer, { height }]}>
        <View style={styles.chartWrapper}>
          {data.map((value, index) => {
            const normalizedHeight = ((value - min) / range) * (height - 10);
            return (
              <View
                key={index}
                style={[
                  styles.chartBar,
                  {
                    height: normalizedHeight + 5,
                    backgroundColor: color,
                    width: `${90 / data.length}%`,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
    );
  };

  // Enhanced analytics cards
  const renderAnalyticsCard = (title: string, value: string, trend: number[], icon: string, color: string = '#007AFF') => (
    <Card variant="default" style={styles.analyticsCard}>
      <View style={styles.analyticsHeader}>
        <View style={styles.analyticsContent}>
          <Text style={styles.analyticsIcon}>{icon}</Text>
          <Typography variant="h3" weight="700" color="primary">
            {value}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {title}
          </Typography>
        </View>
        <View style={styles.chartSection}>
          {renderMiniChart(trend, color, 40)}
        </View>
      </View>
    </Card>
  );

  // Enhanced dashboard stats with charts
  const renderEnhancedDashboard = () => (
    <View style={styles.statsContainer}>
      <Typography variant="h2" weight="700" style={styles.sectionTitle}>
        🛠️ Enhanced Admin Dashboard
      </Typography>
      
      {stats && stats.user_stats && stats.trading_stats && stats.gamification_stats ? (
        <>
          {/* Analytics Overview */}
          <View style={styles.analyticsGrid}>
            {renderAnalyticsCard(
              'Total Users',
              stats.user_stats.total_users.toString(),
              [10, 15, 12, 18, 22, 25, 30],
              '👥',
              '#007AFF'
            )}
            {renderAnalyticsCard(
              'Active Stocks',
              stats.trading_stats.total_transactions.toString(),
              [100, 120, 110, 140, 160, 150, 180],
              '📈',
              '#34C759'
            )}
            {renderAnalyticsCard(
              'Total Missions',
              stats.gamification_stats.total_missions.toString(),
              [5, 8, 6, 10, 12, 15, 18],
              '🎯',
              '#FF9500'
            )}
            {renderAnalyticsCard(
              'Revenue Trend',
              `${stats.user_stats.avg_balance ? (stats.user_stats.avg_balance / 1000).toFixed(0) : '0'}K MGA`,
              [50, 60, 55, 70, 80, 75, 90],
              '💰',
              '#AF52DE'
            )}
          </View>

          {/* Traditional Stats Grid */}
          <View style={styles.statsGrid}>
            <Card variant="default" style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={styles.statIcon}>👥</Text>
                <Typography variant="h3" color="primary" weight="700">
                  {stats.user_stats.total_users}
                </Typography>
                <Typography variant="body2" color="text">
                  Total Users
                </Typography>
                <Typography variant="caption" color="textSecondary" style={styles.statSubtext}>
                  {stats.user_stats.active_users} active
                </Typography>
              </View>
            </Card>
            
            <Card variant="default" style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={styles.statIcon}>📈</Text>
                <Typography variant="h3" color="primary" weight="700">
                  {stats.trading_stats.total_transactions}
                </Typography>
                <Typography variant="body2" color="text">
                  Total Transactions
                </Typography>
                <Typography variant="caption" color="textSecondary" style={styles.statSubtext}>
                  {stats.trading_stats.recent_transactions} recent trades
                </Typography>
              </View>
            </Card>
            
            <Card variant="default" style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={styles.statIcon}>🎯</Text>
                <Typography variant="h3" color="primary" weight="700">
                  {stats.gamification_stats.total_missions}
                </Typography>
                <Typography variant="body2" color="text">
                  Total Missions
                </Typography>
                <Typography variant="caption" color="textSecondary" style={styles.statSubtext}>
                  {stats.gamification_stats.active_missions} active
                </Typography>
              </View>
            </Card>
            
            <Card variant="default" style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={styles.statIcon}>💰</Text>
                <Typography variant="h3" color="primary" weight="700">
                  {stats.user_stats.avg_balance ? (stats.user_stats.avg_balance * stats.user_stats.total_users).toFixed(0) : '0'} MGA
                </Typography>
                <Typography variant="body2" color="text">
                  Total Balance (Est.)
                </Typography>
                <Typography variant="caption" color="textSecondary" style={styles.statSubtext}>
                  Avg: {stats.user_stats.avg_balance ? stats.user_stats.avg_balance.toFixed(0) : '0'} MGA
                </Typography>
              </View>
            </Card>
          </View>
          
          {/* Enhanced Action Buttons */}
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
            <Button
              variant="secondary"
              onPress={() => setShowBulkActionsModal(true)}
              title="⚡ Bulk Actions"
            />
          </View>
        </>
      ) : (
        <Card variant="default" style={styles.noDataCard}>
          <Typography variant="body1" style={styles.noDataText}>
            Loading enhanced dashboard data...
          </Typography>
        </Card>
      )}
    </View>
  );

  // Enhanced user management with search and filters
  const renderEnhancedUserManagement = () => {
    const filteredUsers = users.filter(user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <View style={styles.managementContainer}>
        <View style={styles.sectionHeader}>
          <Typography variant="h3" weight="700">
            👥 Enhanced User Management
          </Typography>
          <View style={styles.headerActions}>
            <Button
              variant="secondary"
              onPress={() => setShowBulkActionsModal(true)}
              title="⚡ Bulk Actions"
              style={styles.bulkButton}
            />
            <Button
              variant="primary"
              onPress={() => setShowUserModal(true)}
              title="➕ Add User"
              style={styles.addButton}
            />
          </View>
        </View>
        
        {/* Search and filters */}
        <View style={styles.filtersContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              // Toggle filter logic
              console.log('Filter clicked');
            }}
          >
            <Ionicons name="filter" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        
        {/* Enhanced user list */}
        <ScrollView style={styles.listContainer}>
          {filteredUsers.map((user) => (
            <Card key={user.id} variant="default" style={styles.enhancedUserCard}>
              <View style={styles.userCardHeader}>
                <TouchableOpacity
                  style={styles.selectCheckbox}
                  onPress={() => {
                    if (selectedItems.includes(user.id)) {
                      setSelectedItems(selectedItems.filter(id => id !== user.id));
                    } else {
                      setSelectedItems([...selectedItems, user.id]);
                    }
                  }}
                >
                  <Ionicons
                    name={selectedItems.includes(user.id) ? "checkbox" : "square-outline"}
                    size={20}
                    color="#007AFF"
                  />
                </TouchableOpacity>
                
                <View style={styles.userInfo}>
                  <Typography variant="h4" weight="600">
                    {user.username}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {user.email}
                  </Typography>
                  <View style={styles.userStats}>
                    <Typography variant="caption" color="textSecondary">
                      Level: {user.userprofile?.level || 0} | 
                      Balance: {user.userprofile?.balance || 0} MGA | 
                      Trades: {user.userprofile?.total_trades || 0}
                    </Typography>
                  </View>
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
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={() => handleUserAction(user.id, 'delete')}
                    title="🗑️"
                  />
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Enhanced stock management
  const renderEnhancedStockManagement = () => (
    <View style={styles.managementContainer}>
      <View style={styles.sectionHeader}>
        <Typography variant="h3" weight="700">
          📈 Enhanced Stock Management
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
          <Card key={stock.id} variant="default" style={styles.enhancedStockCard}>
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
                Vol: {stock.volume ? stock.volume.toLocaleString() : 'N/A'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Cap: {stock.market_cap ? stock.market_cap.toLocaleString() : 'N/A'} MGA
              </Typography>
            </View>
            
            <View style={styles.stockActions}>
              <Button
                variant="primary"
                size="sm"
                onPress={() => {
                  // Update price action
                  console.log('Update price for', stock.symbol);
                }}
                title="💹"
              />
              <Button
                variant="secondary"
                size="sm"
                onPress={() => {
                  // Delete stock action
                  Alert.alert(
                    'Delete Stock',
                    `Are you sure you want to delete ${stock.symbol}?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete', stock.id) }
                    ]
                  );
                }}
                title="🗑️"
              />
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
              Loading enhanced admin dashboard...
            </Typography>
          </View>
        </View>
      </ResponsiveScreenWrapper>
    );
  }

  return (
    <ResponsiveScreenWrapper showBottomTabs={false}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Enhanced Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Ionicons name="analytics" size={20} color={activeTab === 'dashboard' ? '#007AFF' : '#8E8E93'} />
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
              Users ({users.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stocks' && styles.activeTab]}
            onPress={() => setActiveTab('stocks')}
          >
            <Ionicons name="trending-up" size={20} color={activeTab === 'stocks' ? '#007AFF' : '#8E8E93'} />
            <Text style={[styles.tabText, activeTab === 'stocks' && styles.activeTabText]}>
              Stocks ({stocks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              console.log('🔴 Logout button touched');
              console.log('✅ Direct logout (no confirmation for web compatibility)');
              logout();
              showToast.success('Déconnexion', 'À bientôt !');
              router.replace('/login' as any);
              console.log('🏁 Logout completed');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Content */}
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {activeTab === 'dashboard' && renderEnhancedDashboard()}
          {activeTab === 'users' && renderEnhancedUserManagement()}
          {activeTab === 'stocks' && renderEnhancedStockManagement()}
        </ScrollView>

        {/* Enhanced User Creation Modal */}
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

        {/* Enhanced Stock Creation Modal */}
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

        {/* Bulk Actions Modal */}
        <Modal visible={showBulkActionsModal} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Bulk Actions</Text>
              <Text style={styles.modalSubtitle}>
                {selectedItems.length} items selected
              </Text>
              
              <View style={styles.bulkActionsContainer}>
                <TouchableOpacity
                  style={[styles.bulkActionButton, styles.activateButton]}
                  onPress={() => handleBulkActions('activate')}
                >
                  <Text style={styles.bulkActionText}>✅ Activate All</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.bulkActionButton, styles.deactivateButton]}
                  onPress={() => handleBulkActions('deactivate')}
                >
                  <Text style={styles.bulkActionText}>❌ Deactivate All</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.bulkActionButton, styles.deleteButton]}
                  onPress={() => handleBulkActions('delete')}
                >
                  <Text style={styles.bulkActionText}>🗑️ Delete All</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowBulkActionsModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
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
    paddingHorizontal: 4,
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
  
  // Enhanced Analytics
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  analyticsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analyticsContent: {
    flex: 1,
  },
  analyticsIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  chartSection: {
    width: 60,
    alignItems: 'center',
  },
  
  // Chart styles
  chartContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  chartBar: {
    borderRadius: 2,
    marginHorizontal: 1,
  },
  
  // Traditional stats
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
  statSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  
  // Action buttons
  actionButtonsGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 16,
  },
  
  // Management sections
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    backgroundColor: '#34C759',
  },
  bulkButton: {
    backgroundColor: '#FF9500',
  },
  
  // Search and filters
  filtersContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: 'white',
  },
  filterButton: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  
  // Enhanced cards
  listContainer: {
    flex: 1,
  },
  enhancedUserCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectCheckbox: {
    padding: 4,
  },
  userInfo: {
    flex: 1,
  },
  userStats: {
    marginTop: 4,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  
  enhancedStockCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
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
  stockDetails: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  stockActions: {
    flexDirection: 'row',
    gap: 8,
  },
  
  // Modals
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
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
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
  
  // Bulk actions
  bulkActionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  bulkActionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activateButton: {
    backgroundColor: '#34C759',
  },
  deactivateButton: {
    backgroundColor: '#FF9500',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  bulkActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  noDataCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    margin: 16,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default AdminDashboard;
