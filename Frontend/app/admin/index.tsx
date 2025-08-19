import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { Typography } from '../../src/components/ui';
import AdminDashboard from '../../src/screens/AdminDashboardEnhanced';
import { useRouter } from 'expo-router';

const AdminScreen: React.FC = () => {
  const { user, loading, isAuthenticated, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 Admin Screen - Auth State:', {
      loading,
      isAuthenticated,
      hasToken: !!token,
      hasUser: !!user,
      username: user?.username,
      is_staff: user?.is_staff
    });
    
    if (!loading && !isAuthenticated) {
      console.log('❌ Admin route - redirecting to login (not authenticated)');
      router.replace('/login' as any);
    }
  }, [loading, isAuthenticated, router, user, token]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Typography variant="body1">Loading admin...</Typography>
        <Typography variant="caption" style={{ marginTop: 8 }}>
          Auth: {isAuthenticated ? 'Yes' : 'No'} | User: {user?.username || 'None'}
        </Typography>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <Typography variant="body1">Redirecting to login...</Typography>
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
        <Typography variant="caption" style={{ marginTop: 16, color: '#999' }}>
          Current user: {user?.username || 'Unknown'} | Staff: {user?.is_staff ? 'Yes' : 'No'}
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
