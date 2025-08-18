import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { Typography } from '../../src/components/ui';
import AdminDashboard from '../../src/screens/AdminDashboard';

const AdminScreen: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Typography variant="body1">Loading...</Typography>
      </View>
    );
  }

  if (!user?.is_staff) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Typography variant="h2" style={styles.unauthorizedTitle}>
          Access Denied
        </Typography>
        <Typography variant="body1" style={styles.unauthorizedText}>
          You need admin privileges to access this page.
        </Typography>
      </View>
    );
  }

  return <AdminDashboard />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  unauthorizedTitle: {
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  unauthorizedText: {
    color: '#666',
    textAlign: 'center',
  },
});

export default AdminScreen;
