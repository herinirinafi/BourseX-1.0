// src/components/navigation/BottomTabBar.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui';
import { useTheme } from '../../config/theme';

interface TabItem {
  name: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const tabs: TabItem[] = [
  { name: 'home', route: '/dashboard', icon: 'home', label: 'Accueil' },
  { name: 'trading', route: '/trading', icon: 'trending-up', label: 'Trading' },
  { name: 'portfolio', route: '/portfolio', icon: 'pie-chart', label: 'Portfolio' },
  { name: 'transactions', route: '/transactions', icon: 'swap-horizontal', label: 'Transactions' },
  { name: 'leaderboard', route: '/leaderboard', icon: 'trophy', label: 'Classement' },
  { name: 'notifications', route: '/notifications', icon: 'notifications', label: 'Alertes' },
  { name: 'login', route: '/login', icon: 'person', label: 'Connexion' },
];

export const BottomTabBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const isActive = (route: string) => {
    if (route === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) {
      return true;
    }
    return pathname === route;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
        style={[styles.tabBar, theme.shadows.lg]}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.route);
          
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => router.push(tab.route as any)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                active && { backgroundColor: theme.colors.primary }
              ]}>
                <Ionicons
                  name={tab.icon}
                  size={active ? 24 : 20}
                  color={active ? theme.colors.textInverse : theme.colors.textSecondary}
                />
              </View>
              
              <Typography
                variant="caption"
                color={active ? 'primary' : 'textSecondary'}
                weight={active ? '600' : '400'}
                style={styles.label}
              >
                {tab.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 34, // Safe area for iPhone
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 212, 255, 0.1)',
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
  },
});
