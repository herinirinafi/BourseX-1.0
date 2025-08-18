import React, { useState, useRef } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Modal, 
  TouchableWithoutFeedback,
  Dimensions 
} from 'react-native';
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
  isSmallMobile, 
  isMediumMobile,
  getTouchTargetSize,
  getResponsiveDimensions 
} from '../../utils/responsive';

interface TabItem {
  name: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
  category: 'main' | 'trading' | 'account' | 'extra';
}

interface DropdownItem {
  name: string;
  items: TabItem[];
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
}

// Reorganized navigation structure
const mainTabs: TabItem[] = [
  { name: 'home', route: '/dashboard', icon: 'home', labelKey: 'dashboard.title', category: 'main' },
  { name: 'search', route: '/search', icon: 'search', labelKey: 'search.title', category: 'main' },
];

const tradingTabs: TabItem[] = [
  { name: 'trading', route: '/trading', icon: 'trending-up', labelKey: 'trading.title', category: 'trading' },
  { name: 'portfolio', route: '/portfolio', icon: 'pie-chart', labelKey: 'portfolio.title', category: 'trading' },
  { name: 'transactions', route: '/transactions', icon: 'swap-horizontal', labelKey: 'transactions.title', category: 'trading' },
];

const accountTabs: TabItem[] = [
  { name: 'notifications', route: '/notifications', icon: 'notifications', labelKey: 'notifications.title', category: 'account' },
  { name: 'missions', route: '/missions', icon: 'trophy', labelKey: 'missions.title', category: 'account' },
  { name: 'leaderboard', route: '/leaderboard', icon: 'podium', labelKey: 'dashboard.leaderboard', category: 'account' },
];

const extraTabs: TabItem[] = [
  { name: 'tutorial', route: '/tutorial', icon: 'school', labelKey: 'tutorial.title', category: 'extra' },
  { name: 'login', route: '/login', icon: 'person', labelKey: 'auth.tab', category: 'extra' },
];

const dropdownMenus: DropdownItem[] = [
  {
    name: 'trading',
    items: tradingTabs,
    icon: 'trending-up',
    labelKey: 'Trading'
  },
  {
    name: 'account',
    items: accountTabs,
    icon: 'person-circle',
    labelKey: 'Account'
  },
  {
    name: 'more',
    items: extraTabs,
    icon: 'ellipsis-horizontal',
    labelKey: 'More'
  }
];

interface DropdownMenuProps {
  visible: boolean;
  items: TabItem[];
  onClose: () => void;
  onItemPress: (item: TabItem) => void;
  anchorPosition: { x: number; y: number };
  pathname: string;
  isAuthenticated: boolean;
  t: (key: string) => string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  visible,
  items,
  onClose,
  onItemPress,
  anchorPosition,
  pathname,
  isAuthenticated,
  t
}) => {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const touchTargets = getTouchTargetSize();
  const dimensions = getResponsiveDimensions();

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const isActive = (route: string) => {
    if (route === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) {
      return true;
    }
    return pathname === route;
  };

  // Calculate menu position
  const menuWidth = isSmallMobile ? 180 : isMediumMobile ? 200 : 220;
  const menuHeight = items.length * (touchTargets.button + spacing.sm) + spacing.lg * 2;
  
  const menuX = Math.min(
    anchorPosition.x - menuWidth / 2,
    screenWidth - menuWidth - spacing.md
  );
  const menuY = Math.max(
    anchorPosition.y - menuHeight - spacing.xl,
    dimensions.safeAreaTop + spacing.md
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.dropdown,
              {
                left: menuX,
                top: menuY,
                width: menuWidth,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.98)', 'rgba(248, 250, 252, 0.95)']}
              style={[styles.dropdownContent, { borderRadius: borderRadius.lg }]}
            >
              {items.map((item, index) => {
                const active = isActive(item.route);
                
                return (
                  <TouchableOpacity
                    key={item.name}
                    style={[
                      styles.dropdownItem,
                      {
                        minHeight: touchTargets.button,
                        backgroundColor: active ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                        borderRadius: borderRadius.md,
                        marginBottom: index < items.length - 1 ? spacing.xs : 0,
                      }
                    ]}
                    onPress={() => onItemPress(item)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.dropdownIcon, {
                      backgroundColor: active ? '#FFD700' : 'rgba(107, 114, 128, 0.1)',
                    }]}>
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={active ? '#0F172A' : theme.colors.textSecondary}
                      />
                    </View>
                    <Typography
                      variant="body2"
                      color={active ? 'primary' : 'text'}
                      weight={active ? '600' : '400'}
                      style={{ flex: 1 }}
                    >
                      {item.name === 'login' 
                        ? (isAuthenticated ? t('settings.logout') : t('login.title'))
                        : t(item.labelKey)
                      }
                    </Typography>
                    {active && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#FFD700"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </LinearGradient>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export const EnhancedBottomTabBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage, t } = useI18n();
  const { isAuthenticated, logout } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const touchTargets = getTouchTargetSize();
  const dimensions = getResponsiveDimensions();

  const isActive = (route: string) => {
    if (route === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) {
      return true;
    }
    return pathname === route;
  };

  const isDropdownActive = (items: TabItem[]) => {
    return items.some(item => isActive(item.route));
  };

  const handleTabPress = (tab: TabItem) => {
    if (tab.name === 'login') {
      if (isAuthenticated) {
        logout();
        router.push('/login');
      } else {
        router.push('/login');
      }
    } else {
      router.push(tab.route as any);
    }
    setActiveDropdown(null);
  };

  const handleDropdownPress = (dropdownName: string, event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setDropdownPosition({ x: pageX, y: pageY });
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const getCurrentDropdownItems = () => {
    const dropdown = dropdownMenus.find(d => d.name === activeDropdown);
    return dropdown ? dropdown.items : [];
  };

  const getTabBarHeight = () => {
    return dimensions.tabBarHeight + dimensions.safeAreaBottom;
  };

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
              <Ionicons name="language" size={18} color={theme.colors.textSecondary} />
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
              <Ionicons name="cash" size={18} color={theme.colors.textSecondary} />
            </View>
            <Typography variant="caption" color="textSecondary" style={styles.utilityLabel}>
              {currency}
            </Typography>
          </TouchableOpacity>

          {/* Main Tabs */}
          {mainTabs.map((tab) => {
            const active = isActive(tab.route);
            
            return (
              <TouchableOpacity
                key={tab.name}
                style={[styles.tabItem, { minHeight: touchTargets.button }]}
                onPress={() => handleTabPress(tab)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: active ? '#FFD700' : 'rgba(107, 114, 128, 0.1)' }
                  ]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={active ? 22 : 20}
                    color={active ? '#0F172A' : theme.colors.textSecondary}
                  />
                </View>
                
                <Typography
                  variant="caption"
                  color={active ? 'primary' : 'textSecondary'}
                  weight={active ? '600' : '400'}
                  style={styles.label}
                >
                  {t(tab.labelKey)}
                </Typography>
              </TouchableOpacity>
            );
          })}

          {/* Dropdown Menus */}
          {dropdownMenus.map((dropdown) => {
            const active = isDropdownActive(dropdown.items);
            const isOpen = activeDropdown === dropdown.name;
            
            return (
              <TouchableOpacity
                key={dropdown.name}
                style={[styles.tabItem, { minHeight: touchTargets.button }]}
                onPress={(event) => handleDropdownPress(dropdown.name, event)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { 
                      backgroundColor: active ? '#FFD700' : isOpen ? 'rgba(255, 215, 0, 0.2)' : 'rgba(107, 114, 128, 0.1)',
                      transform: [{ scale: isOpen ? 1.1 : 1 }]
                    }
                  ]}
                >
                  <Ionicons
                    name={dropdown.icon}
                    size={active || isOpen ? 22 : 20}
                    color={active ? '#0F172A' : isOpen ? '#FFD700' : theme.colors.textSecondary}
                  />
                  {isOpen && (
                    <View style={styles.dropdownIndicator}>
                      <Ionicons
                        name="chevron-up"
                        size={10}
                        color={active ? '#0F172A' : '#FFD700'}
                      />
                    </View>
                  )}
                </View>
                
                <Typography
                  variant="caption"
                  color={active ? 'primary' : isOpen ? 'primary' : 'textSecondary'}
                  weight={active || isOpen ? '600' : '400'}
                  style={styles.label}
                >
                  {dropdown.labelKey}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </LinearGradient>
      </View>

      {/* Dropdown Menu */}
      <DropdownMenu
        visible={activeDropdown !== null}
        items={getCurrentDropdownItems()}
        onClose={() => setActiveDropdown(null)}
        onItemPress={handleTabPress}
        anchorPosition={dropdownPosition}
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.5)',
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xxs,
  },
  utilityTab: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    minWidth: 50,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
    position: 'relative',
  },
  utilityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
  },
  label: {
    fontSize: isSmallMobile ? 9 : 10,
    textAlign: 'center',
    lineHeight: 12,
  },
  utilityLabel: {
    fontSize: 8,
    textAlign: 'center',
    lineHeight: 10,
  },
  dropdownIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'transparent',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdown: {
    position: 'absolute',
  },
  dropdownContent: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  dropdownIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
});

export default EnhancedBottomTabBar;
