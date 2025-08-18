import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ResponsiveScreenWrapper } from '../../src/components/responsive/ResponsiveScreenWrapper';
import { Typography } from '../../src/components/ui';
import { AdminUsers, AdminStocks } from '../../src/components/admin';

type AdminView = 'dashboard' | 'users' | 'stocks';

export default function AdminDemo() {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

  const MenuItem: React.FC<{
    title: string;
    subtitle: string;
    icon: string;
    color: readonly [string, string, ...string[]];
    onPress: () => void;
    isActive?: boolean;
  }> = ({ title, subtitle, icon, color, onPress, isActive }) => (
    <TouchableOpacity
      style={[styles.menuItem, isActive && styles.activeMenuItem]}
      onPress={onPress}
      activeOpacity={0.8}
    >
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

  const renderDashboard = () => (
    <ScrollView style={styles.dashboardContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="h1" color="white" weight="700">
          🛠️ Admin System Demo
        </Typography>
        <Typography variant="body1" color="white" style={styles.headerSubtitle}>
          Système d&apos;administration complet pour BourseX
        </Typography>
      </View>

      {/* Features Overview */}
      <View style={styles.section}>
        <Typography variant="h3" color="white" style={styles.sectionTitle}>
          ✨ Fonctionnalités Implémentées
        </Typography>
        
        <View style={styles.featuresContainer}>
          {[
            {
              title: "Gestion Utilisateurs",
              features: ["CRUD complet", "Ajustement XP/Balance", "Statistiques détaillées", "Actions en lot"],
              icon: "people",
              color: ['#667eea', '#764ba2'] as const
            },
            {
              title: "Gestion Stocks", 
              features: ["Création/Modification", "Mise à jour prix", "Prix automatiques", "Volume tracking"],
              icon: "trending-up",
              color: ['#4facfe', '#00f2fe'] as const
            },
            {
              title: "Transactions",
              features: ["Vue en lecture seule", "Filtres avancés", "Statistiques temps réel", "Export données"],
              icon: "swap-horizontal",
              color: ['#fa709a', '#fee140'] as const
            },
            {
              title: "Missions & Badges",
              features: ["Création missions", "Attribution badges", "Système rewards", "Gamification"],
              icon: "trophy",
              color: ['#43e97b', '#38f9d7'] as const
            }
          ].map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <LinearGradient
                colors={feature.color}
                style={styles.featureCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.featureHeader}>
                  <Ionicons name={feature.icon as any} size={20} color="white" />
                  <Typography variant="h4" color="white" weight="600" style={styles.featureTitle}>
                    {feature.title}
                  </Typography>
                </View>
                {feature.features.map((item, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={14} color="white" />
                    <Typography variant="caption" color="white" style={styles.featureText}>
                      {item}
                    </Typography>
                  </View>
                ))}
              </LinearGradient>
            </View>
          ))}
        </View>
      </View>

      {/* API Routes */}
      <View style={styles.section}>
        <Typography variant="h3" color="white" style={styles.sectionTitle}>
          🔗 API Routes Implémentées
        </Typography>
        
        <View style={styles.apiContainer}>
          {[
            { method: 'GET', endpoint: '/api/admin/dashboard-stats/', desc: 'Statistiques dashboard' },
            { method: 'GET', endpoint: '/api/admin/users/', desc: 'Liste utilisateurs paginée' },
            { method: 'POST', endpoint: '/api/admin/users/{id}/add_xp/', desc: 'Ajouter XP utilisateur' },
            { method: 'POST', endpoint: '/api/admin/users/{id}/adjust_balance/', desc: 'Ajuster balance' },
            { method: 'POST', endpoint: '/api/admin/stocks/bulk_update_prices/', desc: 'Mise à jour prix en lot' },
            { method: 'POST', endpoint: '/api/admin/stocks/{id}/set_price/', desc: 'Définir prix stock' },
            { method: 'POST', endpoint: '/api/admin/missions/{id}/assign_to_users/', desc: 'Assigner mission' },
            { method: 'POST', endpoint: '/api/admin/badges/{id}/award_to_users/', desc: 'Attribuer badge' },
          ].map((api, index) => (
            <View key={index} style={styles.apiItem}>
              <View style={[styles.methodTag, { backgroundColor: api.method === 'GET' ? '#4CAF50' : '#FF9800' }]}>
                <Typography variant="caption" color="white" weight="700">{api.method}</Typography>
              </View>
              <View style={styles.apiInfo}>
                <Typography variant="body2" color="white" weight="600" style={styles.apiEndpoint}>
                  {api.endpoint}
                </Typography>
                <Typography variant="caption" color="white" style={styles.apiDesc}>
                  {api.desc}
                </Typography>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Menu Navigation */}
      <View style={styles.section}>
        <Typography variant="h3" color="white" style={styles.sectionTitle}>
          📱 Navigation Admin
        </Typography>
        
        <MenuItem
          title="Gestion Utilisateurs"
          subtitle="CRUD utilisateurs, XP, balance, statistiques"
          icon="people"
          color={['#667eea', '#764ba2']}
          onPress={() => setCurrentView('users')}
          isActive={currentView === 'users'}
        />
        
        <MenuItem
          title="Gestion Stocks"
          subtitle="CRUD stocks, prix, volume, historique"
          icon="trending-up"
          color={['#4facfe', '#00f2fe']}
          onPress={() => setCurrentView('stocks')}
          isActive={currentView === 'stocks'}
        />
        
        <MenuItem
          title="Dashboard Statistiques"
          subtitle="Vue d'ensemble, métriques, top performers"
          icon="stats-chart"
          color={['#fa709a', '#fee140']}
          onPress={() => Alert.alert('Info', 'Dashboard complet créé dans /app/admin/index.tsx')}
        />
      </View>

      {/* Technical Details */}
      <View style={styles.section}>
        <Typography variant="h3" color="white" style={styles.sectionTitle}>
          ⚙️ Détails Techniques
        </Typography>
        
        <View style={styles.techContainer}>
          <View style={styles.techItem}>
            <Typography variant="h4" color="white" weight="600">Backend</Typography>
            <Typography variant="body2" color="white">• Django Admin enrichi avec actions personnalisées</Typography>
            <Typography variant="body2" color="white">• ViewSets admin avec permissions IsAdminUser</Typography>
            <Typography variant="body2" color="white">• Endpoints RESTful complets (CRUD)</Typography>
            <Typography variant="body2" color="white">• Statistiques et métriques en temps réel</Typography>
          </View>
          
          <View style={styles.techItem}>
            <Typography variant="h4" color="white" weight="600">Frontend</Typography>
            <Typography variant="body2" color="white">• Composants React Native réutilisables</Typography>
            <Typography variant="body2" color="white">• Interface responsive et moderne</Typography>
            <Typography variant="body2" color="white">• Modales interactives pour CRUD</Typography>
            <Typography variant="body2" color="white">• Service API typé TypeScript</Typography>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'users':
        return <AdminUsers />;
      case 'stocks':
        return <AdminStocks />;
      default:
        return renderDashboard();
    }
  };

  return (
    <ResponsiveScreenWrapper showBottomTabs={false}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.container}
      >
        {currentView !== 'dashboard' && (
          <View style={styles.backButton}>
            <TouchableOpacity
              onPress={() => setCurrentView('dashboard')}
              style={styles.backButtonTouch}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
              <Typography variant="body2" color="white" style={styles.backText}>
                Retour Dashboard
              </Typography>
            </TouchableOpacity>
          </View>
        )}
        
        {renderContent()}
      </LinearGradient>
    </ResponsiveScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButtonTouch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 8,
  },
  dashboardContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerSubtitle: {
    marginTop: 8,
    opacity: 0.8,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '700',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featureCardGradient: {
    padding: 16,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    marginLeft: 8,
    flex: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureText: {
    marginLeft: 8,
    flex: 1,
  },
  apiContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
  },
  apiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  methodTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  apiInfo: {
    flex: 1,
  },
  apiEndpoint: {
    fontFamily: 'monospace',
  },
  apiDesc: {
    opacity: 0.8,
    marginTop: 2,
  },
  menuItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  activeMenuItem: {
    borderWidth: 2,
    borderColor: '#FFD700',
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
  techContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
  },
  techItem: {
    marginBottom: 16,
  },
});
