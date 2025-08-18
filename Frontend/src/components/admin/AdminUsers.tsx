import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/admin/adminService';

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
    level: number;
    xp: number;
    balance: number;
    total_trades: number;
    successful_trades: number;
    trading_score: number;
  };
}

interface UsersResponse {
  results: User[];
  count?: number;
  next?: string;
  previous?: string;
}

const UserCard: React.FC<{
  user: User;
  onEdit: (user: User) => void;
  onXP: (user: User) => void;
  onBalance: (user: User) => void;
}> = ({ user, onEdit, onXP, onBalance }) => {
  const profile = user.userprofile;
  const winRate = profile ? (profile.total_trades > 0 ? (profile.successful_trades / profile.total_trades * 100).toFixed(1) : '0') : '0';

  return (
    <View style={styles.userCard}>
      <LinearGradient
        colors={user.is_active ? ['#667eea', '#764ba2'] : ['#888', '#666']}
        style={styles.userCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Typography variant="h4" color="white" weight="700">
              {user.username}
            </Typography>
            <Typography variant="caption" color="white" style={styles.userEmail}>
              {user.email}
            </Typography>
            {user.first_name && (
              <Typography variant="caption" color="white">
                {user.first_name} {user.last_name}
              </Typography>
            )}
          </View>
          <View style={styles.userStatus}>
            <View style={[styles.statusDot, { backgroundColor: user.is_active ? '#4CAF50' : '#F44336' }]} />
            {user.is_staff && (
              <Ionicons name="shield" size={16} color="#FFD700" style={styles.staffIcon} />
            )}
          </View>
        </View>

        {profile && (
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Typography variant="caption" color="white">Niveau</Typography>
              <Typography variant="body2" color="white" weight="600">{profile.level}</Typography>
            </View>
            <View style={styles.statItem}>
              <Typography variant="caption" color="white">XP</Typography>
              <Typography variant="body2" color="white" weight="600">{profile.xp.toLocaleString()}</Typography>
            </View>
            <View style={styles.statItem}>
              <Typography variant="caption" color="white">Balance</Typography>
              <Typography variant="body2" color="white" weight="600">${profile.balance.toFixed(2)}</Typography>
            </View>
            <View style={styles.statItem}>
              <Typography variant="caption" color="white">Win Rate</Typography>
              <Typography variant="body2" color="white" weight="600">{winRate}%</Typography>
            </View>
          </View>
        )}

        <View style={styles.userActions}>
          <TouchableOpacity onPress={() => onEdit(user)} style={styles.actionButton}>
            <Ionicons name="create" size={16} color="white" />
            <Typography variant="caption" color="white" style={styles.actionText}>Éditer</Typography>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onXP(user)} style={styles.actionButton}>
            <Ionicons name="star" size={16} color="white" />
            <Typography variant="caption" color="white" style={styles.actionText}>XP</Typography>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onBalance(user)} style={styles.actionButton}>
            <Ionicons name="wallet" size={16} color="white" />
            <Typography variant="caption" color="white" style={styles.actionText}>Balance</Typography>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const XPModal: React.FC<{
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}> = ({ visible, user, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('100');

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Typography variant="h3" style={styles.modalTitle}>
            Ajouter XP à {user?.username}
          </Typography>
          
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="Montant XP"
            keyboardType="numeric"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose} style={[styles.modalButton, styles.cancelButton]}>
              <Typography variant="body2" color="white">Annuler</Typography>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onSubmit(parseInt(amount) || 0);
                onClose();
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

const BalanceModal: React.FC<{
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (amount: number, operation: string) => void;
}> = ({ visible, user, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('1000');
  const [operation, setOperation] = useState('add');

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Typography variant="h3" style={styles.modalTitle}>
            Ajuster Balance - {user?.username}
          </Typography>
          
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="Montant"
            keyboardType="numeric"
          />

          <View style={styles.operationSelector}>
            {['add', 'subtract', 'set'].map((op) => (
              <TouchableOpacity
                key={op}
                onPress={() => setOperation(op)}
                style={[
                  styles.operationButton,
                  operation === op && styles.operationButtonSelected
                ]}
              >
                <Typography
                  variant="caption"
                  color={operation === op ? "white" : "text"}
                >
                  {op === 'add' ? 'Ajouter' : op === 'subtract' ? 'Soustraire' : 'Définir'}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose} style={[styles.modalButton, styles.cancelButton]}>
              <Typography variant="body2" color="white">Annuler</Typography>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onSubmit(parseFloat(amount) || 0, operation);
                onClose();
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

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [xpModalVisible, setXpModalVisible] = useState(false);
  const [balanceModalVisible, setBalanceModalVisible] = useState(false);
  const [page, setPage] = useState(1);

  const loadUsers = useCallback(async (resetPage = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const response = await adminService.getUsers(currentPage, searchText) as UsersResponse;
      
      if (resetPage) {
        setUsers(response.results || []);
        setPage(1);
      } else {
        setUsers(prev => [...prev, ...(response.results || [])]);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [loading, page, searchText]);

  useEffect(() => {
    loadUsers(true);
  }, [searchText, loadUsers]);

  const handleXP = async (amount: number) => {
    if (!selectedUser) return;

    try {
      await adminService.addUserXP(selectedUser.id, amount);
      Alert.alert('Succès', `${amount} XP ajouté à ${selectedUser.username}`);
      loadUsers(true);
    } catch {
      Alert.alert('Erreur', 'Impossible d\'ajouter XP');
    }
  };

  const handleBalance = async (amount: number, operation: string) => {
    if (!selectedUser) return;

    try {
      await adminService.adjustUserBalance(selectedUser.id, amount, operation as any);
      Alert.alert('Succès', `Balance ${operation === 'add' ? 'ajoutée' : operation === 'subtract' ? 'soustraite' : 'définie'} pour ${selectedUser.username}`);
      loadUsers(true);
    } catch {
      Alert.alert('Erreur', 'Impossible d\'ajuster la balance');
    }
  };

  const handleLoadMore = () => {
    if (!loading) {
      setPage(prev => prev + 1);
      loadUsers();
    }
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
            👥 Gestion Utilisateurs
          </Typography>
          <Typography variant="caption" color="white" style={styles.headerSubtitle}>
            Connecté en tant que: {currentUser?.username}
          </Typography>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher utilisateurs..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#888"
            />
          </View>
        </View>

        {/* Users List */}
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onEdit={() => {}}
              onXP={(user) => {
                setSelectedUser(user);
                setXpModalVisible(true);
              }}
              onBalance={(user) => {
                setSelectedUser(user);
                setBalanceModalVisible(true);
              }}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />

        {/* Modals */}
        <XPModal
          visible={xpModalVisible}
          user={selectedUser}
          onClose={() => setXpModalVisible(false)}
          onSubmit={handleXP}
        />

        <BalanceModal
          visible={balanceModalVisible}
          user={selectedUser}
          onClose={() => setBalanceModalVisible(false)}
          onSubmit={handleBalance}
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
    alignItems: 'center',
  },
  headerSubtitle: {
    opacity: 0.7,
    marginTop: 4,
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
  userCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  userCardGradient: {
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    opacity: 0.8,
    marginTop: 4,
  },
  userStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  staffIcon: {
    marginLeft: 8,
  },
  userStats: {
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
  userActions: {
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  operationSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  operationButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  operationButtonSelected: {
    backgroundColor: '#667eea',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
