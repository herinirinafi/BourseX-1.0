import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { ResponsiveScreenWrapper } from '../../src/components/responsive/ResponsiveScreenWrapper';
import { useEffect } from 'react';

type MenuItem = {
  id: string;
  title: string;
  icon: string;
  path: `/${string}`;
  adminOnly?: boolean;
};

const menuItems: MenuItem[] = [
  { id: 'dashboard', title: 'Tableau de bord', icon: '📊', path: '/dashboard' },
  { id: 'trading', title: 'Trading', icon: '📈', path: '/trading' },
  { id: 'portfolio', title: 'Portefeuille', icon: '💰', path: '/portfolio' },
  { id: 'leaderboard', title: 'Classement', icon: '🏆', path: '/leaderboard' },
  { id: 'missions', title: 'Missions', icon: '🎯', path: '/missions' },
  { id: 'search', title: 'Recherche', icon: '🔍', path: '/search' },
  { id: 'admin', title: 'Administration', icon: '🛠️', path: '/admin', adminOnly: true },
];

export default function HomeScreen() {
  const { isAuthenticated, user, isAdmin, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || (item.adminOnly && isAdmin)
  );
  return (
    <ResponsiveScreenWrapper showBottomTabs={true}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Bienvenue{user ? ` ${user.first_name || user.username}` : ''} sur
          </Text>
          <Text style={styles.appTitle}>BourseX</Text>
          <Text style={styles.subtitle}>Gérez vos investissements en toute simplicité</Text>
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>👑 Administrateur</Text>
            </View>
          )}
        </View>

        <View style={styles.gridContainer}>
          {filteredMenuItems.map((item) => (
            <Link href={item.path as any} key={item.id} asChild>
              <TouchableOpacity style={[
                styles.card,
                item.adminOnly && styles.adminCard
              ]}>
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <Text style={[
                  styles.cardText,
                  item.adminOnly && styles.adminCardText
                ]}>{item.title}</Text>
                {item.adminOnly && (
                  <View style={styles.adminIndicator}>
                    <Text style={styles.adminIndicatorText}>ADMIN</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 BourseX</Text>
        </View>
      </ScrollView>
      
    </ResponsiveScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    color: '#a7a7a7',
    fontSize: 18,
    marginBottom: 5,
  },
  appTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#a7a7a7',
    fontSize: 16,
    textAlign: 'center',
  },
  adminBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  adminBadgeText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -8,
  },
  card: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  adminCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  adminCardText: {
    color: '#FFD700',
    fontWeight: '600',
  },
  adminIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD700',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adminIndicatorText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
  },
  footer: {
    marginTop: 40,
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
  },
});
