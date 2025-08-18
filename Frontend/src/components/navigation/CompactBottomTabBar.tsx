import React, { useState, useRef } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Modal, 
  TouchableWithoutFeedback
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui';
import { useTheme } from '../../config/theme';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  spacing, 
  borderRadius, 
  getTouchTargetSize,
  getResponsiveDimensions 
} from '../../utils/responsive';

interface QuickAccessItem {
  name: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
  priority: number; // Higher priority = more likely to be shown
}

// Quick access items for compact navigation
const quickAccessItems: QuickAccessItem[] = [
  { name: 'home', route: '/dashboard', icon: 'home', labelKey: 'dashboard.title', priority: 10 },
  { name: 'trading', route: '/trading', icon: 'trending-up', labelKey: 'trading.title', priority: 9 },
  { name: 'portfolio', route: '/portfolio', icon: 'pie-chart', labelKey: 'portfolio.title', priority: 8 },
  { name: 'search', route: '/search', icon: 'search', labelKey: 'search.title', priority: 7 },
  { name: 'notifications', route: '/notifications', icon: 'notifications', labelKey: 'notifications.title', priority: 6 },
  { name: 'transactions', route: '/transactions', icon: 'swap-horizontal', labelKey: 'transactions.title', priority: 5 },
  { name: 'missions', route: '/missions', icon: 'trophy', labelKey: 'missions.title', priority: 4 },
  { name: 'leaderboard', route: '/leaderboard', icon: 'podium', labelKey: 'dashboard.leaderboard', priority: 3 },
  { name: 'tutorial', route: '/tutorial', icon: 'school', labelKey: 'tutorial.title', priority: 2 },
  { name: 'login', route: '/login', icon: 'person', labelKey: 'auth.tab', priority: 1 },
];

interface CompactMenuProps {
  visible: boolean;
  onClose: () => void;
  onItemPress: (item: QuickAccessItem) => void;
  pathname: string;
  isAuthenticated: boolean;
  t: (key: string) => string;
}

const CompactMenu: React.FC<CompactMenuProps> = ({
  visible,
  onClose,
  onItemPress,
  pathname,
  isAuthenticated,
  t
}) => {
  const theme = useTheme();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const dimensions = getResponsiveDimensions();

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  const isActive = (route: string) => {
    if (route === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) {
      return true;
    }
    return pathname === route;
  };

  const handleGestureEvent = (event: any) => {
    if (event.nativeEvent.translationY > 50) {
      onClose();
    }
  };

  const sortedItems = [...quickAccessItems].sort((a, b) => b.priority - a.priority);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
          <PanGestureHandler
            onGestureEvent={handleGestureEvent}
            onHandlerStateChange={(event) => {
              if (event.nativeEvent.state === State.END) {
                if (event.nativeEvent.translationY > 100) {
                  onClose();
                }
              }
            }}
          >
            <Animated.View
              style={[
                styles.menuContainer,
                {
                  bottom: dimensions.tabBarHeight + dimensions.safeAreaBottom,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.98)', 'rgba(248, 250, 252, 0.95)']}
                style={[styles.menuContent, { borderRadius: borderRadius.xl }]}
              >
                {/* Handle bar */}
                <View style={styles.handleBar} />
                
                {/* Menu Title */}
                <View style={styles.menuHeader}>
                  <Typography variant="h4" weight="600" color="text">
                    {t('navigation.quickAccess')}
                  </Typography>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Menu Items Grid */}
                <View style={styles.menuGrid}>
                  {sortedItems.map((item, index) => {
                    const active = isActive(item.route);
                    
                    return (
                      <TouchableOpacity
                        key={item.name}
                        style={[
                          styles.menuItem,
                          {
                            backgroundColor: active ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                            borderColor: active ? 'rgba(255, 215, 0, 0.3)' : 'rgba(229, 231, 235, 0.5)',
                          }
                        ]}
                        onPress={() => onItemPress(item)}
                        activeOpacity={0.7}
                      >
                        <View style={[
                          styles.menuItemIcon,
                          { backgroundColor: active ? '#FFD700' : 'rgba(107, 114, 128, 0.1)' }
                        ]}>
                          <Ionicons
                            name={item.icon}
                            size={24}
                            color={active ? '#0F172A' : theme.colors.textSecondary}
                          />
                        </View>
                        <Typography
                          variant="caption"
                          color={active ? 'primary' : 'text'}
                          weight={active ? '600' : '400'}
                          style={styles.menuItemLabel}
                        >
                          {item.name === 'login' 
                            ? (isAuthenticated ? t('settings.logout') : t('login.title'))
                            : t(item.labelKey)
                          }
                        </Typography>
                        {active && (
                          <View style={styles.activeIndicator}>
                            <Ionicons name="checkmark-circle" size={14} color="#FFD700" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </LinearGradient>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export const CompactBottomTabBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage, t } = useI18n();
  const { isAuthenticated, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const touchTargets = getTouchTargetSize();
  const dimensions = getResponsiveDimensions();

  const handleItemPress = (item: QuickAccessItem) => {
    if (item.name === 'login') {
      if (isAuthenticated) {
        logout();
        router.push('/login');
      } else {
        router.push('/login');
      }
    } else {
      router.push(item.route as any);
    }
    setShowMenu(false);
  };

  const isActive = (route: string) => {
    if (route === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) {
      return true;
    }
    return pathname === route;
  };

  const getTabBarHeight = () => {
    return dimensions.tabBarHeight + dimensions.safeAreaBottom;
  };

  const activeHomeTab = isActive('/dashboard');
  const activeMenuHasItem = quickAccessItems.some(item => isActive(item.route));

  return (
    <>
      <View style={[styles.container, { height: getTabBarHeight() }]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.98)', 'rgba(248, 250, 252, 0.95)']}
          style={[
            styles.tabBar, 
            theme.shadows.lg,
            {
              paddingBottom: dimensions.safeAreaBottom + spacing.sm,
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
            }
          ]}
        >
          {/* Language Toggle */}
          <TouchableOpacity
            style={[styles.utilityTab, { minHeight: touchTargets.button }]}
            onPress={() => setLanguage(language === 'fr' ? 'mg' : 'fr')}
            activeOpacity={0.7}
          >
            <View style={[styles.utilityIcon, { backgroundColor: 'rgba(107, 114, 128, 0.1)' }]}>
              <Ionicons name="language" size={16} color={theme.colors.textSecondary} />
            </View>
            <Typography variant="caption" color="textSecondary" style={styles.utilityLabel}>
              {language.toUpperCase()}
            </Typography>
          </TouchableOpacity>

          {/* Currency Toggle */}
          <TouchableOpacity
            style={[styles.utilityTab, { minHeight: touchTargets.button }]}
            onPress={() => setCurrency(currency === 'MGA' ? 'USD' : 'MGA')}
            activeOpacity={0.7}
          >
            <View style={[styles.utilityIcon, { backgroundColor: 'rgba(107, 114, 128, 0.1)' }]}>
              <Ionicons name="cash" size={16} color={theme.colors.textSecondary} />
            </View>
            <Typography variant="caption" color="textSecondary" style={styles.utilityLabel}>
              {currency}
            </Typography>
          </TouchableOpacity>

          {/* Home Tab */}
          <TouchableOpacity
            style={[styles.tabItem, { minHeight: touchTargets.button }]}
            onPress={() => router.push('/dashboard')}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: activeHomeTab ? '#FFD700' : 'rgba(107, 114, 128, 0.1)' }
              ]}
            >
              <Ionicons
                name="home"
                size={activeHomeTab ? 22 : 20}
                color={activeHomeTab ? '#0F172A' : theme.colors.textSecondary}
              />
            </View>
            
            <Typography
              variant="caption"
              color={activeHomeTab ? 'primary' : 'textSecondary'}
              weight={activeHomeTab ? '600' : '400'}
              style={styles.label}
            >
              {t('dashboard.title')}
            </Typography>
          </TouchableOpacity>

          {/* Menu Tab */}
          <TouchableOpacity
            style={[styles.tabItem, { minHeight: touchTargets.button }]}
            onPress={() => setShowMenu(true)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                { 
                  backgroundColor: activeMenuHasItem ? '#FFD700' : showMenu ? 'rgba(255, 215, 0, 0.2)' : 'rgba(107, 114, 128, 0.1)',
                  transform: [{ scale: showMenu ? 1.1 : 1 }]
                }
              ]}
            >
              <Ionicons
                name="apps"
                size={activeMenuHasItem || showMenu ? 22 : 20}
                color={activeMenuHasItem ? '#0F172A' : showMenu ? '#FFD700' : theme.colors.textSecondary}
              />
            </View>
            
            <Typography
              variant="caption"
              color={activeMenuHasItem ? 'primary' : showMenu ? 'primary' : 'textSecondary'}
              weight={activeMenuHasItem || showMenu ? '600' : '400'}
              style={styles.label}
            >
              {t('navigation.menu')}
            </Typography>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Compact Menu */}
      <CompactMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onItemPress={handleItemPress}
        pathname={pathname}
        isAuthenticated={isAuthenticated}
        t={t}
      />
    </>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.5)',
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  utilityTab: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minWidth: 60,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  utilityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },
  utilityLabel: {
    fontSize: 8,
    textAlign: 'center',
    lineHeight: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  menuContent: {
    margin: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 400,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(156, 163, 175, 0.5)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  closeButton: {
    padding: spacing.xs,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    position: 'relative',
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  menuItemLabel: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 14,
  },
  activeIndicator: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
});

export default CompactBottomTabBar;