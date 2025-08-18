// src/components/navigation/BottomTabBar.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui';
import { useTheme } from '../../config/theme';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';

interface TabItem {
  name: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
}

const tabs: TabItem[] = [
  { name: 'home', route: '/dashboard', icon: 'home', labelKey: 'dashboard.title' },
  { name: 'trading', route: '/trading', icon: 'trending-up', labelKey: 'trading.title' },
  { name: 'portfolio', route: '/portfolio', icon: 'pie-chart', labelKey: 'portfolio.title' },
  { name: 'transactions', route: '/transactions', icon: 'swap-horizontal', labelKey: 'transactions.title' },
  { name: 'leaderboard', route: '/leaderboard', icon: 'trophy', labelKey: 'dashboard.leaderboard' },
  { name: 'notifications', route: '/notifications', icon: 'notifications', labelKey: 'notifications.title' },
  { name: 'login', route: '/login', icon: 'person', labelKey: 'auth.tab' },
];

export const BottomTabBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage, t } = useI18n();
  const { isAuthenticated, logout } = useAuth();

  const isActive = (route: string) => {
    if (route === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) {
      return true;
    }
    return pathname === route;
  };

  const handleTabPress = (tab: TabItem) => {
    if (tab.name === 'login') {
      if (isAuthenticated) {
        // If already authenticated, logout
        logout();
        router.push('/login');
      } else {
        // If not authenticated, go to login
        router.push('/login');
      }
    } else {
      router.push(tab.route as any);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
        style={[styles.tabBar, theme.shadows.lg]}
      >
        {/* Language & Currency toggles */}
        <TouchableOpacity
          style={[styles.tabItem, { maxWidth: 72 }]}
          onPress={() => setLanguage(language === 'fr' ? 'mg' : 'fr')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: 'transparent' }] }>
            <Ionicons name="language" size={20} color={theme.colors.textSecondary} />
          </View>
          <Typography variant="caption" color="textSecondary" style={styles.label}>
            {language.toUpperCase()}
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, { maxWidth: 72 }]}
          onPress={() => setCurrency(currency === 'MGA' ? 'USD' : 'MGA')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: 'transparent' }] }>
            <Ionicons name="cash" size={20} color={theme.colors.textSecondary} />
          </View>
          <Typography variant="caption" color="textSecondary" style={styles.label}>
            {currency}
          </Typography>
        </TouchableOpacity>

        {tabs.map((tab) => {
          const active = isActive(tab.route);
          
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  active && { backgroundColor: theme.colors.primary }
                ]}
              >
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
                {tab.name === 'login' 
                  ? (isAuthenticated ? t('settings.logout') : t('login.title'))
                  : t(tab.labelKey)
                }
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
