import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../src/components/ui';
import { useAuth } from '../../src/contexts/AuthContext';
import { ResponsiveScreenWrapper } from '../../src/components/responsive/ResponsiveScreenWrapper';
import { useRouter } from 'expo-router';

const AdminMenuItem: React.FC<{
  title: string;
  subtitle: string;
  icon: string;
  color: [string, string];
  onPress: () => void;
}> = ({ title, subtitle, icon, color, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
    <LinearGradient
      colors={color}
      style={styles.menuItemGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name={icon as any} size={24} color="white" />
      <View style={styles.menuItemText}>
        <Typography variant="h4" color="white" weight="700">
          {title}
        </Typography>
        <Typography variant="caption" color="white" style={styles.menuItemSubtitle}>
          {subtitle}
        </Typography>
      </View>
      <Ionicons name="chevron-forward" size={20} color="white" />
    </LinearGradient>
  </TouchableOpacity>
);

export default function AdminNavigation() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  if (!isAdmin) {
    return (
      <ResponsiveScreenWrapper showBottomTabs={false}>
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
          </View>
        </LinearGradient>
      </ResponsiveScreenWrapper>
    );
  }

  return (
    <ResponsiveScreenWrapper showBottomTabs={false}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Typography variant="h1" color="white" weight="700">
              🛠️ Administration
            </Typography>
            <Typography variant="body1" color="white" style={styles.headerSubtitle}>
              Panneau d&apos;administration BourseX
            </Typography>
            <View style={styles.adminBadge}>
              <Typography variant="caption" color="white" weight="600">
                👑 {user?.username} - Administrateur
              </Typography>
            </View>
          </View>

          {/* Navigation Menu */}
          <View style={styles.menuContainer}>
            <AdminMenuItem
              title="Dashboard"
              subtitle="Vue d'ensemble et statistiques"
              icon="stats-chart"
              color={['#667eea', '#764ba2']}
              onPress={() => router.push('./' as any)}
            />
            
            <AdminMenuItem
              title="Gestion Utilisateurs"
              subtitle="CRUD utilisateurs, XP, balance"
              icon="people"
              color={['#4facfe', '#00f2fe']}
              onPress={() => router.push('./demo' as any)}
            />
            
            <AdminMenuItem
              title="Gestion Stocks"
              subtitle="CRUD stocks, prix, volume"
              icon="trending-up"
              color={['#43e97b', '#38f9d7']}
              onPress={() => router.push('./demo' as any)}
            />
            
            <AdminMenuItem
              title="Transactions"
              subtitle="Historique et statistiques"
              icon="swap-horizontal"
              color={['#fa709a', '#fee140']}
              onPress={() => router.push('./demo' as any)}
            />
            
            <AdminMenuItem
              title="Missions & Badges"
              subtitle="Système de gamification"
              icon="trophy"
              color={['#ff9a9e', '#fecfef']}
              onPress={() => router.push('./demo' as any)}
            />
            
            <AdminMenuItem
              title="Notifications"
              subtitle="Gestion des notifications"
              icon="notifications"
              color={['#a8edea', '#fed6e3']}
              onPress={() => router.push('./demo' as any)}
            />
            
            <AdminMenuItem
              title="Demo Système"
              subtitle="Documentation et tests"
              icon="flask"
              color={['#fdbb2d', '#22c1c3']}
              onPress={() => router.push('./demo' as any)}
            />
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStatsContainer}>
            <Typography variant="h3" color="white" style={styles.sectionTitle}>
              📊 Accès Rapide
            </Typography>
            
            <View style={styles.statsGrid}>
              <TouchableOpacity 
                style={styles.statCard}
                onPress={() => router.push('./' as any)}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.statCardGradient}
                >
                  <Ionicons name="bar-chart" size={24} color="white" />
                  <Typography variant="h4" color="white" weight="700">
                    Dashboard
                  </Typography>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.statCard}
                onPress={() => router.push('./demo' as any)}
              >
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  style={styles.statCardGradient}
                >
                  <Ionicons name="people" size={24} color="white" />
                  <Typography variant="h4" color="white" weight="700">
                    Utilisateurs
                  </Typography>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Back to Home */}
          <View style={styles.backContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push('/home' as any)}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.backButtonGradient}
              >
                <Ionicons name="home" size={20} color="white" />
                <Typography variant="body2" color="white" style={styles.backText}>
                  Retour à l&apos;accueil
                </Typography>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </ResponsiveScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
    textAlign: 'center',
    opacity: 0.8,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerSubtitle: {
    marginTop: 8,
    opacity: 0.8,
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
  menuContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItemGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 16,
  },
  menuItemSubtitle: {
    opacity: 0.8,
    marginTop: 4,
  },
  quickStatsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: 16,
    alignItems: 'center',
  },
  backContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  backButtonGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    marginLeft: 8,
  },
});
