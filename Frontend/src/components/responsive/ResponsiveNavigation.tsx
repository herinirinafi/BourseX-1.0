import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, Modal, Pressable } from 'react-native';
import { ResponsiveText } from './ResponsiveText';
import { ResponsiveContainer, ResponsiveRow } from './ResponsiveLayouts';
import { 
  isDesktop, 
  isTablet, 
  spacing, 
  getNavigationHeight, 
  getTabBarHeight,
  iconSizes,
  borderRadius 
} from '../../utils/responsive';

interface NavigationItem {
  key: string;
  title: string;
  icon?: React.ReactNode;
  onPress: () => void;
  active?: boolean;
}

interface ResponsiveNavigationProps {
  items: NavigationItem[];
  logo?: React.ReactNode;
  actions?: React.ReactNode[];
  style?: ViewStyle;
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  items,
  logo,
  actions = [],
  style = {},
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navHeight = getNavigationHeight();

  const navigationStyle: ViewStyle = {
    height: navHeight,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: spacing.md,
    ...style,
  };

  // Desktop Navigation
  if (isDesktop) {
    return (
      <View style={navigationStyle}>
        <ResponsiveContainer fullWidth padding={false}>
          <ResponsiveRow justifyContent="space-between" alignItems="center" style={{ height: '100%' }}>
            {/* Logo */}
            <View>{logo}</View>
            
            {/* Navigation Items */}
            <ResponsiveRow gap={spacing.lg}>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  onPress={item.onPress}
                  style={[
                    styles.desktopNavItem,
                    item.active && styles.desktopNavItemActive,
                  ]}
                >
                  {item.icon && <View style={{ marginRight: spacing.xs }}>{item.icon}</View>}
                  <ResponsiveText 
                    size="base" 
                    weight={item.active ? 'semibold' : 'normal'}
                    color={item.active ? '#007AFF' : '#374151'}
                  >
                    {item.title}
                  </ResponsiveText>
                </TouchableOpacity>
              ))}
            </ResponsiveRow>

            {/* Actions */}
            <ResponsiveRow gap={spacing.sm}>
              {actions.map((action, index) => (
                <View key={index}>{action}</View>
              ))}
            </ResponsiveRow>
          </ResponsiveRow>
        </ResponsiveContainer>
      </View>
    );
  }

  // Tablet Navigation
  if (isTablet) {
    return (
      <View style={navigationStyle}>
        <ResponsiveContainer fullWidth padding={false}>
          <ResponsiveRow justifyContent="space-between" alignItems="center" style={{ height: '100%' }}>
            {/* Logo */}
            <View>{logo}</View>
            
            {/* Compact Navigation */}
            <ResponsiveRow gap={spacing.md}>
              {items.slice(0, 3).map((item) => (
                <TouchableOpacity
                  key={item.key}
                  onPress={item.onPress}
                  style={[styles.tabletNavItem, item.active && styles.tabletNavItemActive]}
                >
                  {item.icon}
                  <ResponsiveText size="xs" style={{ marginTop: 2 }}>
                    {item.title}
                  </ResponsiveText>
                </TouchableOpacity>
              ))}
              
              {items.length > 3 && (
                <TouchableOpacity
                  onPress={() => setMobileMenuOpen(true)}
                  style={styles.tabletNavItem}
                >
                  <ResponsiveText size="lg">⋯</ResponsiveText>
                </TouchableOpacity>
              )}
            </ResponsiveRow>

            {/* Actions */}
            <ResponsiveRow gap={spacing.xs}>
              {actions.map((action, index) => (
                <View key={index}>{action}</View>
              ))}
            </ResponsiveRow>
          </ResponsiveRow>
        </ResponsiveContainer>
      </View>
    );
  }

  // Mobile Navigation (Header only, bottom tabs handled separately)
  return (
    <>
      <View style={navigationStyle}>
        <ResponsiveRow justifyContent="space-between" alignItems="center" style={{ height: '100%' }}>
          {/* Logo */}
          <View>{logo}</View>
          
          {/* Mobile menu button */}
          <TouchableOpacity
            onPress={() => setMobileMenuOpen(true)}
            style={styles.mobileMenuButton}
          >
            <ResponsiveText size="lg">☰</ResponsiveText>
          </TouchableOpacity>
        </ResponsiveRow>
      </View>

      {/* Mobile Menu Modal */}
      <Modal
        visible={mobileMenuOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMobileMenuOpen(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setMobileMenuOpen(false)}
        >
          <View style={styles.mobileMenu}>
            <View style={styles.mobileMenuHeader}>
              <ResponsiveText size="lg" weight="bold">Menu</ResponsiveText>
              <TouchableOpacity onPress={() => setMobileMenuOpen(false)}>
                <ResponsiveText size="lg">✕</ResponsiveText>
              </TouchableOpacity>
            </View>
            
            {items.map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => {
                  item.onPress();
                  setMobileMenuOpen(false);
                }}
                style={[styles.mobileMenuItem, item.active && styles.mobileMenuItemActive]}
              >
                {item.icon && <View style={{ marginRight: spacing.md }}>{item.icon}</View>}
                <ResponsiveText 
                  size="base" 
                  weight={item.active ? 'semibold' : 'normal'}
                  color={item.active ? '#007AFF' : '#374151'}
                >
                  {item.title}
                </ResponsiveText>
              </TouchableOpacity>
            ))}
            
            <View style={styles.mobileMenuActions}>
              {actions.map((action, index) => (
                <View key={index} style={{ marginBottom: spacing.sm }}>
                  {action}
                </View>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

interface ResponsiveBottomTabsProps {
  items: NavigationItem[];
  style?: ViewStyle;
}

export const ResponsiveBottomTabs: React.FC<ResponsiveBottomTabsProps> = ({
  items,
  style = {},
}) => {
  // Don't show bottom tabs on desktop
  if (isDesktop) {
    return null;
  }

  const tabBarHeight = getTabBarHeight();

  const tabBarStyle: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: tabBarHeight,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    paddingBottom: spacing.xs,
    ...style,
  };

  return (
    <View style={tabBarStyle}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          onPress={item.onPress}
          style={[styles.bottomTabItem, item.active && styles.bottomTabItemActive]}
        >
          <View style={styles.bottomTabIcon}>
            {item.icon}
          </View>
          <ResponsiveText 
            size="xs" 
            color={item.active ? '#007AFF' : '#6B7280'}
            textAlign="center"
          >
            {item.title}
          </ResponsiveText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // Desktop Navigation
  desktopNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  desktopNavItemActive: {
    backgroundColor: '#EBF8FF',
  },

  // Tablet Navigation
  tabletNavItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    minWidth: 60,
  },
  tabletNavItemActive: {
    backgroundColor: '#EBF8FF',
  },

  // Mobile Navigation
  mobileMenuButton: {
    padding: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  mobileMenu: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '80%',
  },
  mobileMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  mobileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  mobileMenuItemActive: {
    backgroundColor: '#EBF8FF',
  },
  mobileMenuActions: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  // Bottom Tabs
  bottomTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  bottomTabItemActive: {
    backgroundColor: 'transparent',
  },
  bottomTabIcon: {
    marginBottom: spacing.xs / 2,
    height: iconSizes.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default {
  ResponsiveNavigation,
  ResponsiveBottomTabs,
};
