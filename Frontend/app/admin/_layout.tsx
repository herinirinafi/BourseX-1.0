import { Stack } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '../../src/components/ui';

export default function AdminLayout() {
  const { isAdmin, user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Typography variant="h3" color="white">
            Chargement...
          </Typography>
        </View>
      </LinearGradient>
    );
  }

  // Check if user is admin
  if (!isAdmin) {
    return (
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.container}
      >
        <View style={styles.unauthorizedContainer}>
          <Typography variant="h2" color="white" style={styles.unauthorizedTitle}>
            🚫 Accès Refusé
          </Typography>
          <Typography variant="body1" color="white" style={styles.unauthorizedText}>
            Vous devez être administrateur pour accéder à cette section.
          </Typography>
          <Typography variant="caption" color="white" style={styles.userInfo}>
            Connecté en tant que: {user?.username || 'Utilisateur inconnu'}
          </Typography>
        </View>
      </LinearGradient>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Dashboard Admin",
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="demo" 
        options={{ 
          title: "Demo Admin",
          headerShown: false 
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  unauthorizedTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  unauthorizedText: {
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.8,
  },
  userInfo: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
});
